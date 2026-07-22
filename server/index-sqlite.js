import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { mkdirSync } from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

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
console.log("SESSION_SECRET =", process.env.SESSION_SECRET);
const app = express();
const PORT = 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// ── Require secrets — fail fast if missing ────────────────────────────────
const REQUIRED = ['SESSION_SECRET', 'ADMIN_PASSWORD', 'TG_TOKEN', 'TG_CHAT'];
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
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,             // HTTPS-only in production
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
  return res.status(401).json({ error: 'Unauthorized' });
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
    const stmt = db.prepare(
      'INSERT INTO submissions (name, mobile, city, age) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(name.trim(), mobile.trim(), city || '', age || '');

    const msg =
      `🔔 *New Gigolo Registration — Gigolomeet.in*\n\n` +
      `👤 Name:   ${name}\n` +
      `📱 Mobile: +91 ${mobile}\n` +
      `🏙 City:   ${city || 'N/A'}\n` +
      `🎂 Age:    ${age || 'N/A'}\n` +
      `🆔 Ref #${result.lastInsertRowid}`;

    sendTelegram(msg); // fire & forget

    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) return res.status(400).json({ error: 'Mobile and password required' });

  const user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile.trim());
  if (!user || !user.is_active) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  req.session.userId = user.id;
  req.session.userMobile = user.mobile;

  // Ensure profile row exists
  db.prepare('INSERT OR IGNORE INTO profiles (user_id) VALUES (?)').run(user.id);

  res.json({ ok: true });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// Who am I?
app.get('/api/auth/me', (req, res) => {
  if (req.session?.isAdmin) return res.json({ role: 'admin' });
  if (req.session?.userId) {
    const user = db.prepare('SELECT id, mobile FROM users WHERE id = ?').get(req.session.userId);
    return res.json({ role: 'user', ...user });
  }
  res.json({ role: 'guest' });
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Invalid admin password' });
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
app.post('/api/user/upload-photo', requireUser, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  const url = `/uploads/${req.file.filename}`;
  // Save to profile immediately
  db.prepare(`
    INSERT INTO profiles (user_id, photo_url) VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET photo_url = excluded.photo_url, updated_at = datetime('now')
  `).run(req.session.userId, url);
  res.json({ ok: true, url });
});

// Available women (not yet swiped by this user)
app.get('/api/user/women', requireUser, (req, res) => {
  const rows = db.prepare(`
    SELECT w.* FROM women w
    WHERE w.is_active = 1
      AND w.id NOT IN (
        SELECT woman_id FROM swipe_actions WHERE user_id = ?
      )
    ORDER BY w.id
  `).all(req.session.userId);
  res.json(rows);
});

// Record a swipe
app.post('/api/user/swipe', requireUser, (req, res) => {
  const { woman_id, action } = req.body;
  if (!woman_id || !['like', 'pass'].includes(action)) {
    return res.status(400).json({ error: 'Invalid swipe data' });
  }
  db.prepare(`
    INSERT OR IGNORE INTO swipe_actions (user_id, woman_id, action) VALUES (?, ?, ?)
  `).run(req.session.userId, woman_id, action);
  res.json({ ok: true });
});

// Swipe history
app.get('/api/user/swipe-history', requireUser, (req, res) => {
  const rows = db.prepare(`
    SELECT w.*, sa.action, sa.created_at as swiped_at
    FROM swipe_actions sa
    JOIN women w ON w.id = sa.woman_id
    WHERE sa.user_id = ?
    ORDER BY sa.created_at DESC
  `).all(req.session.userId);
  res.json(rows);
});

app.get('/api/user/profile', requireUser, (req, res) => {
  const profile = db.prepare(`
    SELECT p.*, u.mobile
    FROM profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ?
  `).get(req.session.userId);
  res.json(profile || {});
});

app.put('/api/user/profile', requireUser, (req, res) => {
  const {
    full_name, category, date_of_birth, height, weight,
    marks_on_face, complexion, state, city, city_area,
    address, email, alt_mobile, more_info,
    joining_plan, date_of_paying, payment_mode, photo_url
  } = req.body;

  db.prepare(`
    INSERT INTO profiles (user_id, full_name, category, date_of_birth, height, weight,
      marks_on_face, complexion, state, city, city_area, address, email, alt_mobile,
      more_info, joining_plan, date_of_paying, payment_mode, photo_url, profile_step, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      full_name = excluded.full_name,
      category = excluded.category,
      date_of_birth = excluded.date_of_birth,
      height = excluded.height,
      weight = excluded.weight,
      marks_on_face = excluded.marks_on_face,
      complexion = excluded.complexion,
      state = excluded.state,
      city = excluded.city,
      city_area = excluded.city_area,
      address = excluded.address,
      email = excluded.email,
      alt_mobile = excluded.alt_mobile,
      more_info = excluded.more_info,
      joining_plan = excluded.joining_plan,
      date_of_paying = excluded.date_of_paying,
      payment_mode = excluded.payment_mode,
      photo_url = excluded.photo_url,
      profile_step = MAX(profiles.profile_step, 1),
      updated_at = datetime('now')
  `).run(
    req.session.userId, full_name, category, date_of_birth, height, weight,
    marks_on_face, complexion, state, city, city_area, address, email, alt_mobile,
    more_info, joining_plan, date_of_paying, payment_mode, photo_url
  );

  res.json({ ok: true });
});

app.post('/api/user/submit-review', requireUser, (req, res) => {
  db.prepare(`
    UPDATE profiles
    SET profile_step = 2, member_status = 'pending_review', submitted_at = datetime('now')
    WHERE user_id = ?
  `).run(req.session.userId);

  const user = db.prepare('SELECT mobile FROM users WHERE id = ?').get(req.session.userId);
  sendTelegram(`📋 *Profile Submitted for Review*\n\n📱 Mobile: +91 ${user.mobile}\n\nPlease review and approve.`);

  res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/admin/submissions', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT s.*,
           u.id as user_id,
           u.is_active,
           p.member_status,
           p.profile_step
    FROM submissions s
    LEFT JOIN users u ON u.submission_id = s.id
    LEFT JOIN profiles p ON p.user_id = u.id
    ORDER BY s.created_at DESC
  `).all();
  res.json(rows);
});

app.post('/api/admin/set-credentials', requireAdmin, async (req, res) => {
  const { submission_id, password } = req.body;
  if (!submission_id || !password) return res.status(400).json({ error: 'submission_id and password required' });

  const sub = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submission_id);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });

  const hash = await bcrypt.hash(password, 10);

  try {
    const existing = db.prepare('SELECT id FROM users WHERE mobile = ?').get(sub.mobile);
    if (existing) {
      db.prepare('UPDATE users SET password_hash = ?, is_active = 1 WHERE id = ?').run(hash, existing.id);
      db.prepare('INSERT OR IGNORE INTO profiles (user_id) VALUES (?)').run(existing.id);
    } else {
      const r = db.prepare(
        'INSERT INTO users (submission_id, mobile, password_hash) VALUES (?, ?, ?)'
      ).run(submission_id, sub.mobile, hash);
      db.prepare('INSERT OR IGNORE INTO profiles (user_id) VALUES (?)').run(r.lastInsertRowid);
    }

    db.prepare("UPDATE submissions SET status = 'approved' WHERE id = ?").run(submission_id);

    sendTelegram(
      `✅ *Credentials Set*\n\n📱 Mobile: +91 ${sub.mobile}\n👤 Name: ${sub.name}\n\nUser can now login.`
    );

    res.json({ ok: true, mobile: sub.mobile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/update-status', requireAdmin, (req, res) => {
  const { submission_id, status } = req.body;
  db.prepare('UPDATE submissions SET status = ? WHERE id = ?').run(status, submission_id);
  res.json({ ok: true });
});

app.get('/api/admin/profile/:userId', requireAdmin, (req, res) => {
  const profile = db.prepare(`
    SELECT p.*, u.mobile
    FROM profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ?
  `).get(req.params.userId);
  res.json(profile || {});
});

app.post('/api/admin/review-profile', requireAdmin, (req, res) => {
  const { user_id, action } = req.body;
  const status = action === 'approve' ? 'active' : 'inactive';
  db.prepare('UPDATE profiles SET member_status = ? WHERE user_id = ?').run(status, user_id);

  const user = db.prepare('SELECT mobile FROM users WHERE id = ?').get(user_id);
  if (user) {
    sendTelegram(
      `${action === 'approve' ? '✅' : '❌'} *Profile ${action === 'approve' ? 'Approved' : 'Rejected'}*\n\n📱 Mobile: +91 ${user.mobile}`
    );
  }
  res.json({ ok: true });
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
