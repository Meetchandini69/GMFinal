# GigoloMeet.in — Deployment Guide

## Overview

| Layer | Tech | Where |
|---|---|---|
| Frontend | React + Vite (static build) | **Cloudflare Pages** |
| Backend API | Node.js + Express | Your server / Railway / Render |
| Database | SQLite (dev) → PostgreSQL/Neon (prod) | Neon (cloud Postgres) |

---

## Part 1 — Build the Frontend

### Step 1 — Set the API URL before building

Create a file called `.env.production` in the project root:

```
VITE_API_URL=https://your-backend-domain.com
```

Replace `https://your-backend-domain.com` with the URL where your Express server will be running (e.g. `https://api.gigolomeet.in` or a Railway/Render URL).

**Leave this empty** if you want to test locally first — the Vite dev proxy handles `/api/*` automatically.

### Step 2 — Build

```bash
npm run build
```

This creates a `dist/` folder with the compiled static site.

### Step 3 — Download the dist folder

Zip it:
```bash
zip -r gigolomeet-frontend.zip dist/
```

---

## Part 2 — Deploy Frontend to Cloudflare Pages

### Option A — Drag & Drop (easiest)

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click **"Create a project"** → **"Direct Upload"**
3. Give it a name (e.g. `gigolomeet`)
4. Drag and drop the entire `dist/` folder
5. Click **Deploy**
6. Your site is live at `https://gigolomeet.pages.dev`

### Option B — Git-connected (auto-deploys on push)

1. Push this repo to GitHub
2. Cloudflare Pages → **"Connect to Git"** → select the repo
3. Build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Under **Environment Variables**, add:
   ```
   VITE_API_URL = https://your-backend-domain.com
   ```
5. Click **Save and Deploy**

### Custom domain (optional)

1. Cloudflare Pages → your project → **Custom domains**
2. Add `gigolomeet.in` (or whatever domain you have)
3. If domain is on Cloudflare DNS: auto-configured
4. If not: add the CNAME record Cloudflare gives you to your DNS registrar

---

## Part 3 — Run the Backend Locally (Phase 1)

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Create `.env` file in project root

```env
SESSION_SECRET=any-long-random-string-here
ADMIN_PASSWORD=your-admin-password
TG_TOKEN=your-telegram-bot-token
TG_CHAT=your-telegram-chat-id
```

### Step 3 — Start the API server

```bash
node server/index.js
```

API runs at `http://localhost:3001`

Uploaded photos are saved to `uploads/` folder.

### Step 4 — Test the API

```bash
# Health check
curl http://localhost:3001/api/auth/me

# Test registration
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","mobile":"9876543210","city":"Chennai","age":"25"}'
```

### Step 5 — Connect your Cloudflare frontend to localhost (for local testing)

If you want to test the full stack locally, set the Cloudflare Pages environment variable:
```
VITE_API_URL = http://localhost:3001
```
> ⚠️ This only works when you access the site from the same machine. For public testing you need the server on a public URL (see Part 4).

---

## Part 4 — Move Backend to a Live Server

You need your Express API publicly accessible so the Cloudflare frontend can reach it.

### Option A — Railway (recommended, free tier available)

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select this repository
3. Railway auto-detects Node.js
4. Under **Settings → Start Command**, set: `node server/index.js`
5. Under **Variables**, add all your env vars:
   ```
   SESSION_SECRET=...
   ADMIN_PASSWORD=...
   TG_TOKEN=...
   TG_CHAT=...
   NODE_ENV=production
   ALLOWED_ORIGINS=https://gigolomeet.pages.dev,https://gigolomeet.in
   ```
6. Railway gives you a URL like `https://gigolomeet-api.up.railway.app`
7. Update your Cloudflare Pages env var: `VITE_API_URL=https://gigolomeet-api.up.railway.app`

### Option B — Render (also free tier)

1. [render.com](https://render.com) → **New Web Service** → connect repo
2. **Start command**: `node server/index.js`
3. Add same environment variables as above
4. Copy the Render URL and set it as `VITE_API_URL` in Cloudflare Pages

### Option C — Your own VPS (Nginx + PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start server/index.js --name gigolomeet-api

# Auto-restart on reboot
pm2 save && pm2 startup
```

Nginx config (`/etc/nginx/sites-available/api.gigolomeet.in`):
```nginx
server {
    listen 80;
    server_name api.gigolomeet.in;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Allow uploaded photos to be served
    location /uploads/ {
        alias /path/to/project/uploads/;
    }
}
```

Then get SSL with Let's Encrypt:
```bash
certbot --nginx -d api.gigolomeet.in
```

---

## Part 5 — Migrate Database from SQLite to Neon (PostgreSQL)

### Step 1 — Create a Neon project

1. Go to [neon.tech](https://neon.tech) → **New Project**
2. Choose region closest to your users (e.g. `ap-southeast-1` for India/Asia)
3. Copy the **Connection string** — looks like:
   ```
   postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2 — Install the Postgres client

```bash
npm install pg
```

### Step 3 — Replace `server/db.js` with the Neon version

Create `server/db.js` with this content (replacing the SQLite version):

```js
import pg from 'pg';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(__dirname, '../uploads'), { recursive: true });

const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Helper: run a query
export const query = (text, params) => pool.query(text, params);

// Create tables on startup
await pool.query(`
  CREATE TABLE IF NOT EXISTS submissions (
    id          SERIAL PRIMARY KEY,
    name        TEXT    NOT NULL,
    mobile      TEXT    NOT NULL,
    city        TEXT,
    age         TEXT,
    status      TEXT    DEFAULT 'pending',
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    submission_id   INTEGER REFERENCES submissions(id),
    mobile          TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER UNIQUE REFERENCES users(id),
    full_name       TEXT,
    category        TEXT,
    date_of_birth   TEXT,
    height          TEXT,
    weight          TEXT,
    marks_on_face   TEXT,
    complexion      TEXT,
    state           TEXT,
    city            TEXT,
    city_area       TEXT,
    address         TEXT,
    email           TEXT,
    alt_mobile      TEXT,
    more_info       TEXT,
    joining_plan    TEXT,
    date_of_paying  TEXT,
    payment_mode    TEXT,
    photo_url       TEXT,
    member_status   TEXT DEFAULT 'inactive',
    profile_step    INTEGER DEFAULT 0,
    submitted_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS women (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    age        INTEGER,
    city       TEXT,
    state      TEXT,
    bio        TEXT,
    photo_url  TEXT,
    is_active  BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS swipe_actions (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id),
    woman_id   INTEGER NOT NULL REFERENCES women(id),
    action     TEXT NOT NULL CHECK(action IN ('like','pass')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, woman_id)
  );
`);

export default { query, pool };
```

### Step 4 — Update `server/index.js` to use PostgreSQL queries

The main differences between SQLite and PostgreSQL query syntax:

| SQLite | PostgreSQL |
|---|---|
| `db.prepare(sql).run(...params)` | `await pool.query(sql, [params])` |
| `db.prepare(sql).get(param)` | `(await pool.query(sql, [param])).rows[0]` |
| `db.prepare(sql).all(param)` | `(await pool.query(sql, [param])).rows` |
| `?` placeholder | `$1, $2, $3` placeholders |
| `result.lastInsertRowid` | `result.rows[0].id` (add `RETURNING id`) |
| `INTEGER DEFAULT 1` | `BOOLEAN DEFAULT TRUE` |
| `datetime('now')` | `NOW()` |
| `INSERT OR IGNORE` | `INSERT ... ON CONFLICT DO NOTHING` |

Example conversion:
```js
// SQLite
const user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile);

// PostgreSQL
const { rows } = await pool.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
const user = rows[0];
```

### Step 5 — Add DATABASE_URL to your environment

On Railway/Render, add:
```
DATABASE_URL=postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### Step 6 — Seed the women profiles

Run this once after switching to Neon (paste into Neon's SQL editor at console.neon.tech):

```sql
INSERT INTO women (name, age, city, state, bio, photo_url) VALUES
('Priya S.',   26, 'Chennai',   'Tamil Nadu',    'Loves travel, music and long drives.', 'https://randomuser.me/api/portraits/women/44.jpg'),
('Neha R.',    29, 'Mumbai',    'Maharashtra',   'Corporate professional. Weekend adventures.', 'https://randomuser.me/api/portraits/women/68.jpg'),
('Aisha M.',   24, 'Hyderabad', 'Telangana',     'Foodie at heart. Loves dinner and conversation.', 'https://randomuser.me/api/portraits/women/65.jpg'),
('Kavya T.',   31, 'Bangalore', 'Karnataka',     'Yoga instructor. Mindful connections.', 'https://randomuser.me/api/portraits/women/47.jpg'),
('Riya K.',    27, 'Delhi',     'Delhi',         'Fashion blogger. Art galleries and cafés.', 'https://randomuser.me/api/portraits/women/90.jpg'),
('Sneha P.',   25, 'Pune',      'Maharashtra',   'Engineer by day, dancer by night.', 'https://randomuser.me/api/portraits/women/26.jpg'),
('Divya L.',   28, 'Coimbatore','Tamil Nadu',    'Boutique owner. Weekends by the hills.', 'https://randomuser.me/api/portraits/women/33.jpg'),
('Meera V.',   30, 'Kolkata',   'West Bengal',   'Literature lover and photographer.', 'https://randomuser.me/api/portraits/women/17.jpg'),
('Ananya B.',  23, 'Jaipur',    'Rajasthan',     'Art student. Vibrant and curious.', 'https://randomuser.me/api/portraits/women/55.jpg'),
('Shruti D.',  32, 'Ahmedabad', 'Gujarat',       'Entrepreneur. Fine dining and wellness.', 'https://randomuser.me/api/portraits/women/72.jpg'),
('Pooja N.',   27, 'Lucknow',   'Uttar Pradesh', 'Classical dancer and fitness enthusiast.', 'https://randomuser.me/api/portraits/women/11.jpg'),
('Tara S.',    29, 'Chennai',   'Tamil Nadu',    'Architect who appreciates design.', 'https://randomuser.me/api/portraits/women/62.jpg');
```

---

## Quick Reference — Environment Variables

| Variable | Where to set | Purpose |
|---|---|---|
| `VITE_API_URL` | Cloudflare Pages env vars | Backend API base URL |
| `SESSION_SECRET` | Backend server env | Express session signing |
| `ADMIN_PASSWORD` | Backend server env | `/admin` panel password |
| `TG_TOKEN` | Backend server env | Telegram bot token |
| `TG_CHAT` | Backend server env | Telegram chat ID |
| `DATABASE_URL` | Backend server env | Neon PostgreSQL connection string |
| `ALLOWED_ORIGINS` | Backend server env | Comma-separated allowed CORS origins |
| `NODE_ENV` | Backend server env | Set to `production` on live server |

---

## Folder Structure Reference

```
project/
├── dist/              ← Built frontend (upload to Cloudflare Pages)
├── server/
│   ├── index.js       ← Express API server
│   └── db.js          ← Database (swap this file for Neon)
├── uploads/           ← User-uploaded photos (serve publicly on your VPS)
├── data/
│   └── gigolo.db      ← SQLite database (local only, not used with Neon)
└── src/               ← Frontend source (React/Vite)
```

---

## Common Issues

**"API calls return 404 on Cloudflare"**
→ You forgot to set `VITE_API_URL` in Cloudflare Pages environment variables, or the backend isn't running.

**"CORS error in browser"**
→ Add your Cloudflare domain to `ALLOWED_ORIGINS` on the backend:
```
ALLOWED_ORIGINS=https://gigolomeet.pages.dev,https://gigolomeet.in
```

**"Sessions don't persist (login resets)"**
→ Set `NODE_ENV=production` on your server — this enables `secure` cookies.
→ Make sure your backend is on HTTPS (required for secure cookies).

**"Uploaded photos don't show on Cloudflare"**
→ Photos are saved to your backend server's `uploads/` folder. The `<img>` src points to `https://your-backend-domain.com/uploads/filename.jpg`. Make sure your backend serves the `/uploads` static route publicly.

**"Neon connection refused"**
→ Check the DATABASE_URL includes `?sslmode=require` at the end.
→ Neon free tier pauses after inactivity — first request may take ~2 seconds to wake up.
