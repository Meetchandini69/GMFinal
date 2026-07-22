import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';   // <-- Add thiss
import cors from 'cors';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { mkdirSync } from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../uploads');
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
  if (!name || !mobile) return res.status(400).json({ error: 'Name and mobile are required' });

  try {
    const result = await pool.query(
      'INSERT INTO submissions (name, mobile, city, age) VALUES ($1, $2, $3, $4) RETURNING id',
      [name.trim(), mobile.trim(), city || '', age || '']
    );
    const newId = result.rows[0].id;

    const msg =
      `🔔 *New Gigolo Registration — Gigolomeet.in*\n\n` +
      `👤 Name:   ${name}\n` +
      `📱 Mobile: +91 ${mobile}\n` +
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
    const { rows } = await pool.query(
      `SELECT w.* FROM women w
       WHERE w.is_active = TRUE
         AND w.id NOT IN (
           SELECT woman_id FROM swipe_actions WHERE user_id = $1
         )
       ORDER BY w.id`,
      [req.session.userId]
    );
    res.json(rows);
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
      `✅ *Credentials Set*\n\n📱 Mobile: +91 ${sub.mobile}\n👤 Name: ${sub.name}\n\nUser can now login.`
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

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
