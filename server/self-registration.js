import bcrypt from 'bcryptjs';
import { memberProfileUrl } from './profile-url.js';
import { randomUUID } from 'node:crypto';

export const signupPlans = ['1 Month Plan', '2 Months Plan', '6 Months Plan', '1 Year Plan'];
export const profileFields = ['full_name', 'category', 'date_of_birth', 'height', 'weight', 'marks_on_face', 'complexion', 'state', 'city', 'city_area', 'address', 'email', 'alt_mobile', 'more_info', 'joining_plan', 'photo_url'];
const persistSession = req => new Promise((resolve, reject) => req.session.save(e => e ? reject(e) : resolve()));
const regenerate = req => new Promise((resolve, reject) => req.session.regenerate(e => e ? reject(e) : resolve()));
const currentDraft = req => req.session.signupDraft && Date.now() - req.session.signupDraft.created < 2 * 60 * 60 * 1000 ? req.session.signupDraft : null;

export function registerSelfRegistration(app, { store, upload, notify, siteUrl }) {
  const send = async text => { try { await notify(text); return true; } catch { return false; } };
  app.get('/api/signup/draft', (req, res) => {
    res.set('Cache-Control', 'no-store');
    const draft = currentDraft(req);
    res.json(draft ? { mobile: draft.mobile, email: draft.email, joining_plan: draft.plan, photo_url: draft.photo || '' } : null);
  });
  app.post('/api/signup/start', async (req, res) => {
    if (req.session.userId || req.session.isAdmin) return res.status(409).json({ error: 'Log out before creating a new account.' });
    const { mobile, email, password, confirm_password, plan } = req.body;
    if (typeof mobile !== 'string' || !/^[6-9]\d{9}$/.test(mobile.trim())) return res.status(400).json({ error: 'Enter a valid 10-digit phone number.' });
    if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72 || password !== confirm_password) return res.status(400).json({ error: 'Use a password of at least 8 characters (up to 72 bytes), and confirm it correctly.' });
    if (!signupPlans.includes(plan)) return res.status(400).json({ error: 'Select a joining plan.' });
    try {
      const cleanMobile = mobile.trim(), cleanEmail = email.trim().toLowerCase();
      if (await store.duplicate(cleanMobile, cleanEmail)) return res.status(409).json({ error: 'This phone number or email is already registered. Log in or contact our team.' });
      const previous = currentDraft(req);
      if (previous && Date.now() - previous.created < 15000) return res.status(429).json({ error: 'Please wait a moment before resubmitting your account details.' });
      const draft = { ref: randomUUID(), mobile: cleanMobile, email: cleanEmail, plan, hash: await bcrypt.hash(password, 12), created: Date.now() };
      await regenerate(req);
      req.session.signupDraft = draft;
      await persistSession(req);
      const notified = await send(`Registration started (Step 1)\nReference: ${draft.ref}\nPhone: +91 ${draft.mobile}\nEmail: ${draft.email}\nPlan: ${draft.plan}\nProfile not submitted yet. Joining fees pending. Password is stored securely and is not shared.`);
      res.json({ ok: true, notification_sent: notified });
    } catch { res.status(500).json({ error: 'Unable to start registration. Please try again.' }); }
  });
  app.post('/api/signup/photo', (req, res) => {
    if (!currentDraft(req)) return res.status(401).json({ error: 'Complete step 1 first.' });
    upload.single('photo')(req, res, async error => {
      if (error || !req.file || !/^image\/(jpeg|png|webp)$/.test(req.file.mimetype) || !/\.(jpe?g|png|webp)$/i.test(req.file.filename)) return res.status(400).json({ error: 'Choose a PNG, JPEG or WebP image up to 10 MB.' });
      try {
        req.session.signupDraft.photo = `/uploads/${req.file.filename}`;
        await persistSession(req);
        res.json({ url: req.session.signupDraft.photo });
      } catch { res.status(500).json({ error: 'Unable to save photo. Please retry.' }); }
    });
  });
  app.post('/api/signup/complete', async (req, res) => {
    const draft = currentDraft(req);
    if (!draft) return res.status(401).json({ error: 'Your registration session expired. Please complete step 1 again.' });
    const profile = {};
    for (const key of profileFields) {
      if (req.body[key] != null && (typeof req.body[key] !== 'string' || req.body[key].length > 2000)) return res.status(400).json({ error: 'Please check your profile details.' });
      profile[key] = (req.body[key] || '').trim();
    }
    profile.email = draft.email; profile.joining_plan = draft.plan; profile.photo_url = draft.photo || '';
    const dob = new Date(profile.date_of_birth), adult = new Date(); adult.setFullYear(adult.getFullYear() - 18);
    if (profile.full_name.length < 2 || !profile.city || !profile.state || !profile.category || !/^\d{4}-\d{2}-\d{2}$/.test(profile.date_of_birth) || !Number.isFinite(dob.getTime()) || dob.toISOString().slice(0, 10) !== profile.date_of_birth || dob > adult || req.body.adult_confirmed !== true) return res.status(400).json({ error: 'Enter your name, category, date of birth (18+), state and city, and confirm you are an adult.' });
    try {
      const user = await store.create(draft, profile);
      // Commit account creation before creating an authenticated session. A saved account
      // remains recoverable through normal login if the session store is unavailable.
      await regenerate(req);
      req.session.userId = user.id; req.session.userMobile = draft.mobile;
      await persistSession(req);
      const profileUrl = memberProfileUrl(user.id, siteUrl);
      const notified = await send(`New member profile submitted\nName: ${profile.full_name}\nPhone: +91 ${draft.mobile}\nEmail: ${draft.email}\nCity: ${profile.city}\nPlan: ${draft.plan}\nProfile: ${profileUrl}\nAccount created; login enabled. Joining fees unpaid. Telegram verification pending.`);
      res.json({ ok: true, id: user.id, profile_url: profileUrl, notification_sent: notified });
    } catch (error) {
      if (error.code === 'DUPLICATE' || error.code === '23505' || String(error.code).startsWith('SQLITE_CONSTRAINT')) return res.status(409).json({ error: 'This phone number or email is already registered. Please log in.' });
      res.status(500).json({ error: 'Unable to complete registration. If your account was saved, you can log in using your phone number and password.' });
    }
  });
  app.get('/api/member-profile/:id', async (req, res) => {
    const id = Number(req.params.id);
    res.set('Cache-Control', 'private, no-store');
    if (!req.session.isAdmin && req.session.userId !== id) return res.status(403).json({ error: 'Sign in as this member or as an admin to view this profile.' });
    if (!Number.isSafeInteger(id) || id < 1) return res.sendStatus(400);
    try {
      const profile = await store.read(id);
      if (!profile) return res.sendStatus(404);
      res.json(profile);
    } catch { res.status(500).json({ error: 'Unable to load profile.' }); }
  });
}

export function signupNotifier(token, chat) {
  return async text => {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text }), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok || !(await response.json()).ok) throw new Error('Telegram notification failed');
  };
}
