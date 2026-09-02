import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';   // <-- Add thiss
import cors from 'cors';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import sanitizeHtml from 'sanitize-html';
import { mkdirSync } from 'fs';
import path from 'path';
import fs from "fs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const PUBLIC_DIR = path.join(__dirname, '../public');
const SITE_URL = (process.env.SITE_URL || 'https://gigolomeet.in').replace(/\/+$/, '');

// Routes that exist outside the location_pages table (dedicated legacy pages).
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/coimbatore', priority: '0.8', changefreq: 'weekly' },
  { path: '/hyderabad', priority: '0.8', changefreq: 'weekly' },
  { path: '/kolkata', priority: '0.8', changefreq: 'weekly' },
];

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

function normalizeMobile(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

// Regenerates public/sitemap.xml (and robots.txt) from the current database state.
// Called at startup and after every admin create/update/delete of a location page,
// so the sitemap always reflects what's actually published — no manual step needed.
async function regenerateSitemap() {
  try {
    const { rows } = await pool.query(
      `SELECT slug, updated_at FROM location_pages WHERE is_active = TRUE ORDER BY slug`
    );
    const staticPaths = new Set(STATIC_ROUTES.map(r => r.path));
    const dbUrls = rows
      .filter(row => !staticPaths.has(`/${row.slug}`))
      .map(row => `  <url>\n    <loc>${escapeXml(`${SITE_URL}/${row.slug}`)}</loc>\n    <lastmod>${new Date(row.updated_at).toISOString().slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
    const staticUrls = STATIC_ROUTES.map(r =>
      `  <url>\n    <loc>${escapeXml(`${SITE_URL}${r.path}`)}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticUrls, ...dbUrls].join('\n')}\n</urlset>\n`;
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');

    const robots = `User-agent: *\nDisallow: /admin\nDisallow: /admin/\nDisallow: /dashboard\nDisallow: /login\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
    fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robots, 'utf8');
  } catch (err) {
    console.error('Failed to regenerate sitemap.xml:', err);
  }
}

console.log("__dirname =", __dirname);
console.log("UPLOADS_DIR =", UPLOADS_DIR);

// 👇 Temporary debug logs
console.log("=================================");
console.log("UPLOADS_DIR:", UPLOADS_DIR);
console.log("Exists:", fs.existsSync(UPLOADS_DIR));

if (fs.existsSync(UPLOADS_DIR)) {
  console.log("Files:", fs.readdirSync(UPLOADS_DIR));
}
console.log("=================================");

mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const app = express();
app.set('trust proxy', 1);
const PORT = 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// ── Require secrets — fail fast if missing ────────────────────────────────
const REQUIRED = ['SESSION_SECRET', 'ADMIN_PASSWORD', 'TG_TOKEN', 'TG_CHAT', 'DATABASE_URL'];
const missing = REQUIRED.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`\n❌  Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Set them in Replit Secrets and restart the server.\n');
  process.exit(1);
}

const TG_TOKEN       = process.env.TG_TOKEN;
const TG_CHAT        = process.env.TG_CHAT;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;

// ── Static uploads ────────────────────────────────────────────────────────
app.use('/uploads', express.static(UPLOADS_DIR));

// ── Middleware ─────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : true; // allow all in dev

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    pool,
    tableName: "user_sessions",
    createTableIfMissing: true,
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// ── Telegram helper ────────────────────────────────────────────────────────
async function sendTelegram(text) {
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'Markdown' }),
    });
  } catch (_) {}
}

// ── Auth guards ────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {

  if (req.session?.isAdmin) return next();

  return res.status(401).json({ error: "Unauthorized" });
}

function requireUser(req, res, next) {
  if (req.session?.userId) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// ══════════════════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════════════

// Registration (landing page form)
app.post('/api/register', async (req, res) => {
  const { name, mobile, city, age } = req.body;
  const normalizedMobile = normalizeMobile(mobile);
  if (!name || !normalizedMobile) return res.status(400).json({ error: 'Name and mobile are required' });
  if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit mobile number', field: 'phone' });
  }

  try {
    const { rows: existing } = await pool.query(
      `SELECT id FROM submissions
       WHERE RIGHT(REGEXP_REPLACE(COALESCE(mobile, ''), '\\D', '', 'g'), 10) = $1
       UNION
       SELECT id FROM users
       WHERE RIGHT(REGEXP_REPLACE(COALESCE(mobile, ''), '\\D', '', 'g'), 10) = $1
       LIMIT 1`,
      [normalizedMobile]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        error: 'This mobile number is already registered. Please login or contact admin.',
        field: 'phone',
      });
    }

    const result = await pool.query(
      'INSERT INTO submissions (name, mobile, city, age) VALUES ($1, $2, $3, $4) RETURNING id',
      [name.trim(), normalizedMobile, city || '', age || '']
    );
    const newId = result.rows[0].id;

    const msg =
      `🔔 *New Gigolo Registration — Gigolomeet.in*\n\n` +
      `👤 Name:   ${name}\n` +
      `📱 Mobile: +91 ${normalizedMobile}\n` +
      `🏙 City:   ${city || 'N/A'}\n` +
      `🎂 Age:    ${age || 'N/A'}\n` +
      `🆔 Ref #${newId}`;

    sendTelegram(msg); // fire & forget

    res.json({ ok: true, id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) return res.status(400).json({ error: 'Mobile and password required' });

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE mobile = $1', [mobile.trim()]);
    const user = rows[0];
    if (!user || !user.is_active) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.userId = user.id;
    req.session.userMobile = user.mobile;

    // Ensure profile row exists
    await pool.query(
      'INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [user.id]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// Who am I?
app.get('/api/auth/me', async (req, res) => {
  if (req.session?.isAdmin) return res.json({ role: 'admin' });
  if (req.session?.userId) {
    try {
      const { rows } = await pool.query(
        'SELECT id, mobile FROM users WHERE id = $1',
        [req.session.userId]
      );
      const user = rows[0];
      return res.json({ role: 'user', ...user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  res.json({ role: 'guest' });
});

// Public cloned location page content
app.get('/api/location-pages/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, slug, source_slug, title, city, state, nickname,
              hero_description, meta_description, stats, areas, sections
       FROM location_pages
       WHERE slug = $1 AND is_active = TRUE`,
      [req.params.slug.toLowerCase()]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Location page not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public directory of all published location pages (state -> city), for site-wide navigation
app.get('/api/locations/directory', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT slug, city, state
       FROM location_pages
       WHERE is_active = TRUE
       ORDER BY state, city`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }

  req.session.isAdmin = true;


  req.session.save((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Session save failed" });
    }

    res.json({ ok: true });
  });
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════════════════
//  USER ROUTES
// ══════════════════════════════════════════════════════════════════════════

// Photo upload
app.post('/api/user/upload-photo', requireUser, upload.single('photo'), async (req, res) => {
  console.log("Saved:", req.file.path);

  console.log(
    "Current uploads:",
    fs.readdirSync(UPLOADS_DIR)
  );
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  const url = `/uploads/${req.file.filename}`;
  try {
    await pool.query(
      `INSERT INTO profiles (user_id, photo_url) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET photo_url = EXCLUDED.photo_url, updated_at = NOW()`,
      [req.session.userId, url]
    );
    res.json({ ok: true, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Available women (not yet swiped by this user)
app.get('/api/user/women', requireUser, async (req, res) => {
  try {
    const { rows: profileRows } = await pool.query(
      'SELECT subscription_status FROM profiles WHERE user_id = $1',
      [req.session.userId]
    );
    const subscriptionStatus = profileRows[0]?.subscription_status || 'unpaid';

    const { rows } = await pool.query(
      `WITH assigned AS (
         SELECT woman_id FROM user_women_assignments WHERE user_id = $1
       )
       SELECT w.* FROM women w
       WHERE w.is_active = TRUE
         AND (
           NOT EXISTS (SELECT 1 FROM assigned)
           OR w.id IN (SELECT woman_id FROM assigned)
         )
         AND w.id NOT IN (
           SELECT woman_id FROM swipe_actions WHERE user_id = $1
         )
       ORDER BY w.id`,
      [req.session.userId]
    );
    res.json({ subscription_status: subscriptionStatus, women: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/user/subscription-interest', requireUser, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.mobile, p.full_name, p.city, p.state, p.joining_plan, p.subscription_status
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [req.session.userId]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    sendTelegram(
      `*Subscription Payment Interest*\n\n` +
      `User ID: ${user.id}\n` +
      `Name: ${user.full_name || 'N/A'}\n` +
      `Mobile: +91 ${user.mobile}\n` +
      `City: ${[user.city, user.state].filter(Boolean).join(', ') || 'N/A'}\n` +
      `Joining Plan: ${user.joining_plan || 'N/A'}\n` +
      `Current Subscription: ${user.subscription_status || 'unpaid'}\n\n` +
      `User clicked Pay Subscription from Available Women.`
    );

    res.json({ ok: true, message: 'Our admin will contact you on Telegram to initiate the payment process.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record a swipe
app.post('/api/user/swipe', requireUser, async (req, res) => {
  const { woman_id, action } = req.body;
  if (!woman_id || !['like', 'pass'].includes(action)) {
    return res.status(400).json({ error: 'Invalid swipe data' });
  }
  try {
    await pool.query(
      `INSERT INTO swipe_actions (user_id, woman_id, action) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, woman_id) DO NOTHING`,
      [req.session.userId, woman_id, action]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Swipe history
app.get('/api/user/swipe-history', requireUser, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT w.*, sa.action, sa.created_at as swiped_at
       FROM swipe_actions sa
       JOIN women w ON w.id = sa.woman_id
       WHERE sa.user_id = $1
       ORDER BY sa.created_at DESC`,
      [req.session.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/user/profile', requireUser, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.mobile
       FROM profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $1`,
      [req.session.userId]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/user/profile', requireUser, async (req, res) => {
  const {
    full_name, category, date_of_birth, height, weight,
    marks_on_face, complexion, state, city, city_area,
    address, email, alt_mobile, more_info,
    joining_plan, date_of_paying, payment_mode, photo_url
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO profiles (
         user_id, full_name, category, date_of_birth, height, weight,
         marks_on_face, complexion, state, city, city_area, address, email, alt_mobile,
         more_info, joining_plan, date_of_paying, payment_mode, photo_url, profile_step, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,1,NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         full_name      = EXCLUDED.full_name,
         category       = EXCLUDED.category,
         date_of_birth  = EXCLUDED.date_of_birth,
         height         = EXCLUDED.height,
         weight         = EXCLUDED.weight,
         marks_on_face  = EXCLUDED.marks_on_face,
         complexion     = EXCLUDED.complexion,
         state          = EXCLUDED.state,
         city           = EXCLUDED.city,
         city_area      = EXCLUDED.city_area,
         address        = EXCLUDED.address,
         email          = EXCLUDED.email,
         alt_mobile     = EXCLUDED.alt_mobile,
         more_info      = EXCLUDED.more_info,
         joining_plan   = EXCLUDED.joining_plan,
         date_of_paying = EXCLUDED.date_of_paying,
         payment_mode   = EXCLUDED.payment_mode,
         photo_url      = EXCLUDED.photo_url,
         profile_step   = GREATEST(profiles.profile_step, 1),
         updated_at     = NOW()`,
      [
        req.session.userId, full_name, category, date_of_birth, height, weight,
        marks_on_face, complexion, state, city, city_area, address, email, alt_mobile,
        more_info, joining_plan, date_of_paying, payment_mode, photo_url
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Save failed. Please try again.' });
  }
});

app.post('/api/user/submit-review', requireUser, async (req, res) => {
  try {
    await pool.query(
      `UPDATE profiles
       SET profile_step = 2, member_status = 'pending_review', submitted_at = NOW()
       WHERE user_id = $1`,
      [req.session.userId]
    );

    const { rows } = await pool.query(
      'SELECT mobile FROM users WHERE id = $1',
      [req.session.userId]
    );
    const user = rows[0];
    if (user) {
      sendTelegram(
        `📋 *Profile Submitted for Review*\n\n📱 Mobile: +91 ${user.mobile}\n\nPlease review and approve.`
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/admin/submissions', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*,
              u.id as user_id,
              u.is_active,
              p.member_status,
              p.subscription_status,
              p.profile_step
       FROM submissions s
       LEFT JOIN users u ON u.submission_id = s.id
       LEFT JOIN profiles p ON p.user_id = u.id
       ORDER BY s.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/set-credentials', requireAdmin, async (req, res) => {
  const { submission_id, password } = req.body;
  if (!submission_id || !password) return res.status(400).json({ error: 'submission_id and password required' });

  try {
    const { rows: subRows } = await pool.query(
      'SELECT * FROM submissions WHERE id = $1',
      [submission_id]
    );
    const sub = subRows[0];
    if (!sub) return res.status(404).json({ error: 'Submission not found' });

    const hash = await bcrypt.hash(password, 10);

    const { rows: existingRows } = await pool.query(
      'SELECT id FROM users WHERE mobile = $1',
      [sub.mobile]
    );
    const existing = existingRows[0];

    let userId;
    if (existing) {
      await pool.query(
        'UPDATE users SET password_hash = $1, is_active = TRUE WHERE id = $2',
        [hash, existing.id]
      );
      userId = existing.id;
    } else {
      const { rows: inserted } = await pool.query(
        'INSERT INTO users (submission_id, mobile, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [submission_id, sub.mobile, hash]
      );
      userId = inserted[0].id;
    }

    // Ensure profile row exists
    await pool.query(
      'INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [userId]
    );

    // Mark submission approved
    await pool.query(
      "UPDATE submissions SET status = 'approved' WHERE id = $1",
      [submission_id]
    );

    sendTelegram(
      `✅ *Credentials Set — Gigolomeet.in*\n\n` +
      `👤 Name:     ${sub.name}\n` +
      `📱 Username: +91 ${sub.mobile}\n` +
      `🔑 Password: ${password}\n\n` +
      `User can now login at gigolomeet.in`
    );

    res.json({ ok: true, mobile: sub.mobile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/update-status', requireAdmin, async (req, res) => {
  const { submission_id, status } = req.body;
  try {
    await pool.query(
      'UPDATE submissions SET status = $1 WHERE id = $2',
      [status, submission_id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/subscription-status', requireAdmin, async (req, res) => {
  const { user_id, subscription_status } = req.body;
  if (!Number.isInteger(Number(user_id)) || !['paid', 'unpaid'].includes(subscription_status)) {
    return res.status(400).json({ error: 'user_id and subscription_status are required' });
  }

  try {
    await pool.query(
      'UPDATE profiles SET subscription_status = $1, updated_at = NOW() WHERE user_id = $2',
      [subscription_status, Number(user_id)]
    );
    if (subscription_status === 'paid') {
      await pool.query('DELETE FROM swipe_actions WHERE user_id = $1', [Number(user_id)]);
    }

    const { rows } = await pool.query(
      `SELECT u.mobile, p.full_name, p.city, p.joining_plan
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [Number(user_id)]
    );
    const user = rows[0];
    if (user) {
      sendTelegram(
        `*Subscription ${subscription_status === 'paid' ? 'Payment Done' : 'Marked Unpaid'}*\n\n` +
        `Name: ${user.full_name || 'N/A'}\n` +
        `Mobile: +91 ${user.mobile}\n` +
        `City: ${user.city || 'N/A'}\n` +
        `Plan: ${user.joining_plan || 'N/A'}`
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/users/:userId/women-assignments', requireAdmin, async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Invalid user ID' });

  try {
    const { rows } = await pool.query(
      `SELECT w.*
       FROM user_women_assignments uwa
       JOIN women w ON w.id = uwa.woman_id
       WHERE uwa.user_id = $1
       ORDER BY uwa.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/user-women-assignments', requireAdmin, async (req, res) => {
  const { user_id, woman_id } = req.body;
  if (!Number.isInteger(Number(user_id)) || !Number.isInteger(Number(woman_id))) {
    return res.status(400).json({ error: 'user_id and woman_id are required' });
  }

  try {
    await pool.query(
      `INSERT INTO user_women_assignments (user_id, woman_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, woman_id) DO NOTHING`,
      [Number(user_id), Number(woman_id)]
    );
    await pool.query(
      'DELETE FROM swipe_actions WHERE user_id = $1 AND woman_id = $2',
      [Number(user_id), Number(woman_id)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/users/:userId/women-assignments/:womanId', requireAdmin, async (req, res) => {
  const userId = Number(req.params.userId);
  const womanId = Number(req.params.womanId);
  if (!Number.isInteger(userId) || !Number.isInteger(womanId)) {
    return res.status(400).json({ error: 'Invalid assignment' });
  }

  try {
    await pool.query(
      'DELETE FROM user_women_assignments WHERE user_id = $1 AND woman_id = $2',
      [userId, womanId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Admin location page management ─────────────────────────────────────────
app.get('/api/admin/location-pages', requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, slug, source_slug, title, city, state, nickname,
              hero_description, meta_description, stats, areas, sections,
              is_active, created_at, updated_at
       FROM location_pages
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/location-pages/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid page ID' });
  try {
    const { rows } = await pool.query(
      `SELECT id, slug, source_slug, title, city, state, nickname,
              hero_description, meta_description, stats, areas, sections,
              is_active, created_at, updated_at
       FROM location_pages
       WHERE id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Page not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const HERO_DESCRIPTION_SANITIZE_OPTIONS = {
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'h4', 'blockquote'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

const PLAIN_SANITIZE_OPTIONS = { allowedTags: [], allowedAttributes: {} };

function cleanPlain(value, maxLen = 300) {
  return sanitizeHtml(String(value ?? ''), PLAIN_SANITIZE_OPTIONS).trim().slice(0, maxLen);
}

function cleanRich(value) {
  const sanitized = sanitizeHtml(String(value ?? ''), HERO_DESCRIPTION_SANITIZE_OPTIONS).trim();
  // Rich text editors (Quill) can emit a content-free wrapper like "<p><br></p>" just from
  // mounting — treat that the same as empty so it doesn't override a field's default text.
  const hasVisibleText = sanitized.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
  return hasVisibleText ? sanitized : '';
}

function cleanItems(list, max, fields) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, max)
    .map(item => {
      const cleaned = {};
      for (const [key, kind] of Object.entries(fields)) {
        cleaned[key] = kind === 'rich' ? cleanRich(item?.[key]) : cleanPlain(item?.[key], kind === 'long' ? 600 : 200);
      }
      return cleaned;
    })
    .filter(item => Object.values(item).some(Boolean));
}

const FEATURE_FIELDS = { title: 'plain', description: 'long' };

function normalizeSections(raw) {
  const s = raw && typeof raw === 'object' ? raw : {};
  const sec = (key) => (s[key] && typeof s[key] === 'object' ? s[key] : {});

  return {
    overview: {
      heading: cleanPlain(sec('overview').heading),
      intro: cleanRich(sec('overview').intro),
      body1: cleanRich(sec('overview').body1),
      body2: cleanRich(sec('overview').body2),
      features: cleanItems(sec('overview').features, 4, FEATURE_FIELDS),
    },
    gallery: {
      heading: cleanPlain(sec('gallery').heading),
      intro: cleanRich(sec('gallery').intro),
    },
    whyChooseUs: {
      heading: cleanPlain(sec('whyChooseUs').heading),
      intro: cleanRich(sec('whyChooseUs').intro),
      features: cleanItems(sec('whyChooseUs').features, 4, FEATURE_FIELDS),
    },
    benefits: {
      heading: cleanPlain(sec('benefits').heading),
      intro: cleanRich(sec('benefits').intro),
      plans: cleanItems(sec('benefits').plans, 3, { type: 'plain', range: 'plain', per: 'plain', description: 'long' }),
      highlights: Array.isArray(sec('benefits').highlights)
        ? sec('benefits').highlights.map(v => cleanPlain(v, 120)).filter(Boolean).slice(0, 6)
        : [],
    },
    opportunities: {
      heading: cleanPlain(sec('opportunities').heading),
      intro: cleanRich(sec('opportunities').intro),
      memberTypes: cleanItems(sec('opportunities').memberTypes, 4, FEATURE_FIELDS),
    },
    trust: {
      features: cleanItems(sec('trust').features, 3, FEATURE_FIELDS),
    },
    areasIntro: {
      heading: cleanPlain(sec('areasIntro').heading),
      intro: cleanRich(sec('areasIntro').intro),
    },
    faqs: {
      heading: cleanPlain(sec('faqs').heading),
      intro: cleanRich(sec('faqs').intro),
      items: cleanItems(sec('faqs').items, 12, { question: 'plain', answer: 'long' }),
    },
    guide: {
      heading: cleanPlain(sec('guide').heading),
      leftBlocks: cleanItems(sec('guide').leftBlocks, 2, { title: 'plain', body: 'rich' }),
      rightBlocks: cleanItems(sec('guide').rightBlocks, 2, { title: 'plain', body: 'rich' }),
    },
    cta: {
      heading: cleanPlain(sec('cta').heading),
      intro: cleanRich(sec('cta').intro),
    },
  };
}

function normalizeLocationPage(body) {
  const slug = String(body.slug || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-');
  const city = String(body.city || '').trim();
  if (!slug || !city) return { error: 'City and URL slug are required' };
  if (slug.length > 80) return { error: 'URL slug must be 80 characters or fewer' };

  const stats = Array.isArray(body.stats)
    ? body.stats.slice(0, 8).map(item => ({
        label: String(item.label || '').trim(),
        value: String(item.value || '').trim(),
      })).filter(item => item.label && item.value)
    : [];
  const areas = Array.isArray(body.areas)
    ? body.areas.map(area => String(area).trim()).filter(Boolean).slice(0, 30)
    : [];

  return {
    value: {
      slug,
      source_slug: String(body.source_slug || '').trim() || null,
      title: String(body.title || `${city} Location Page`).trim(),
      city,
      state: String(body.state || '').trim(),
      nickname: String(body.nickname || '').trim(),
      hero_description: cleanRich(body.hero_description),
      meta_description: String(body.meta_description || '').trim(),
      stats: JSON.stringify(stats),
      areas: JSON.stringify(areas),
      sections: JSON.stringify(normalizeSections(body.sections)),
      is_active: body.is_active !== false,
    },
  };
}

app.post('/api/admin/location-pages', requireAdmin, async (req, res) => {
  const normalized = normalizeLocationPage(req.body);
  if (normalized.error) return res.status(400).json({ error: normalized.error });
  const page = normalized.value;

  try {
    const { rows } = await pool.query(
      `INSERT INTO location_pages
         (slug, source_slug, title, city, state, nickname,
          hero_description, meta_description, stats, areas, sections, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12)
       RETURNING *`,
      [
        page.slug, page.source_slug, page.title, page.city, page.state, page.nickname,
        page.hero_description, page.meta_description, page.stats, page.areas, page.sections, page.is_active,
      ]
    );
    await regenerateSitemap();
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'That URL slug is already in use' });
    console.error(err);
    res.status(500).json({ error: 'Save failed' });
  }
});

app.put('/api/admin/location-pages/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid page ID' });
  const normalized = normalizeLocationPage(req.body);
  if (normalized.error) return res.status(400).json({ error: normalized.error });
  const page = normalized.value;

  try {
    const { rows } = await pool.query(
      `UPDATE location_pages
          SET slug=$1, source_slug=$2, title=$3, city=$4, state=$5, nickname=$6,
              hero_description=$7, meta_description=$8, stats=$9::jsonb,
              areas=$10::jsonb, sections=$11::jsonb, is_active=$12, updated_at=NOW()
        WHERE id=$13
        RETURNING *`,
      [
        page.slug, page.source_slug, page.title, page.city, page.state, page.nickname,
        page.hero_description, page.meta_description, page.stats, page.areas, page.sections, page.is_active, id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Page not found' });
    await regenerateSitemap();
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'That URL slug is already in use' });
    console.error(err);
    res.status(500).json({ error: 'Save failed' });
  }
});

app.delete('/api/admin/location-pages/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid page ID' });
  try {
    const { rowCount } = await pool.query('DELETE FROM location_pages WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Page not found' });
    await regenerateSitemap();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Disable or re-enable a user's login without deleting their profile.
app.post('/api/admin/user-status', requireAdmin, async (req, res) => {
  const { user_id, is_active } = req.body;
  if (!Number.isInteger(Number(user_id)) || typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'user_id and boolean is_active are required' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, is_active',
      [is_active, Number(user_id)]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, is_active: rows[0].is_active });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Permanently delete a submission and all data belonging to its user.
app.delete('/api/admin/submissions/:submissionId', requireAdmin, async (req, res) => {
  const submissionId = Number(req.params.submissionId);
  if (!Number.isInteger(submissionId)) {
    return res.status(400).json({ error: 'Invalid submission ID' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: users } = await client.query(
      'SELECT id FROM users WHERE submission_id = $1',
      [submissionId]
    );

    for (const user of users) {
      await client.query('DELETE FROM swipe_actions WHERE user_id = $1', [user.id]);
      await client.query('DELETE FROM user_women_assignments WHERE user_id = $1', [user.id]);
      await client.query('DELETE FROM profiles WHERE user_id = $1', [user.id]);
      await client.query('DELETE FROM users WHERE id = $1', [user.id]);
    }

    const { rowCount } = await client.query(
      'DELETE FROM submissions WHERE id = $1',
      [submissionId]
    );
    if (!rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Submission not found' });
    }

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  } finally {
    client.release();
  }
});

app.get('/api/admin/profile/:userId', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.mobile
       FROM profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $1`,
      [req.params.userId]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/review-profile', requireAdmin, async (req, res) => {
  const { user_id, action } = req.body;
  const status = action === 'approve' ? 'active' : 'inactive';
  try {
    await pool.query(
      'UPDATE profiles SET member_status = $1 WHERE user_id = $2',
      [status, user_id]
    );

    const { rows } = await pool.query(
      'SELECT mobile FROM users WHERE id = $1',
      [user_id]
    );
    const user = rows[0];
    if (user) {
      sendTelegram(
        `${action === 'approve' ? '✅' : '❌'} *Profile ${action === 'approve' ? 'Approved' : 'Rejected'}*\n\n📱 Mobile: +91 ${user.mobile}`
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  ADMIN — WOMEN MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════

// Upload a photo for a woman profile (admin)
app.post('/api/admin/upload-photo', requireAdmin, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ ok: true, url });
});

// List all women profiles
app.get('/api/admin/women', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM women ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a woman profile
app.post('/api/admin/women', requireAdmin, async (req, res) => {
  const { name, age, city, state, bio, photo_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO women (name, age, city, state, bio, photo_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name.trim(), age || null, city || '', state || '', bio || '', photo_url || '']
    );
    res.json({ ok: true, woman: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a woman profile
app.put('/api/admin/women/:id', requireAdmin, async (req, res) => {
  const { name, age, city, state, bio, photo_url, is_active } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE women
         SET name=$1, age=$2, city=$3, state=$4, bio=$5, photo_url=$6, is_active=$7
       WHERE id=$8
       RETURNING *`,
      [name, age || null, city, state, bio, photo_url, is_active ?? true, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, woman: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a woman profile
app.delete('/api/admin/women/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM swipe_actions WHERE woman_id = $1', [req.params.id]);
    await pool.query('DELETE FROM user_women_assignments WHERE woman_id = $1', [req.params.id]);
    await pool.query('DELETE FROM women WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────
await regenerateSitemap();

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
