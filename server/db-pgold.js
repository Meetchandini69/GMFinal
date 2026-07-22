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