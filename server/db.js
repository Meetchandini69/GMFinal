import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH   = path.join(__dirname, '../data/gigolo.db');

mkdirSync(path.join(__dirname, '../data'),    { recursive: true });
mkdirSync(path.join(__dirname, '../uploads'), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ─────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    mobile      TEXT    NOT NULL,
    city        TEXT,
    age         TEXT,
    status      TEXT    DEFAULT 'pending',
    created_at  DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id   INTEGER REFERENCES submissions(id),
    mobile          TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    is_active       INTEGER DEFAULT 1,
    created_at      DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
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
    submitted_at    DATETIME,
    created_at      DATETIME DEFAULT (datetime('now')),
    updated_at      DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS women (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    age        INTEGER,
    city       TEXT,
    state      TEXT,
    bio        TEXT,
    photo_url  TEXT,
    is_active  INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS swipe_actions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id),
    woman_id   INTEGER NOT NULL REFERENCES women(id),
    action     TEXT NOT NULL CHECK(action IN ('like','pass')),
    created_at DATETIME DEFAULT (datetime('now')),
    UNIQUE(user_id, woman_id)
  );
`);

// ── Seed women profiles ────────────────────────────────────────────────────
const count = db.prepare('SELECT COUNT(*) as n FROM women').get().n;
if (count === 0) {
  const insert = db.prepare(
    'INSERT INTO women (name, age, city, state, bio, photo_url) VALUES (?,?,?,?,?,?)'
  );
  const women = [
    ['Priya S.',   26, 'Chennai',   'Tamil Nadu',     'Loves travel, music and long drives. Looking for genuine company.',        'https://randomuser.me/api/portraits/women/44.jpg'],
    ['Neha R.',    29, 'Mumbai',    'Maharashtra',    'Corporate professional. Weekend adventures are my thing.',                  'https://randomuser.me/api/portraits/women/68.jpg'],
    ['Aisha M.',   24, 'Hyderabad', 'Telangana',      'Foodie at heart. Always up for a nice dinner and great conversation.',     'https://randomuser.me/api/portraits/women/65.jpg'],
    ['Kavya T.',   31, 'Bangalore', 'Karnataka',      'Yoga instructor. Seeking mindful connections.',                            'https://randomuser.me/api/portraits/women/47.jpg'],
    ['Riya K.',    27, 'Delhi',     'Delhi',           'Fashion blogger. Love art galleries and cozy cafés.',                     'https://randomuser.me/api/portraits/women/90.jpg'],
    ['Sneha P.',   25, 'Pune',      'Maharashtra',    'Software engineer by day, dancer by night.',                               'https://randomuser.me/api/portraits/women/26.jpg'],
    ['Divya L.',   28, 'Coimbatore','Tamil Nadu',     'Runs her own boutique. Enjoys weekends by the hills.',                    'https://randomuser.me/api/portraits/women/33.jpg'],
    ['Meera V.',   30, 'Kolkata',   'West Bengal',    'Literature lover and travel photographer.',                                'https://randomuser.me/api/portraits/women/17.jpg'],
    ['Ananya B.',  23, 'Jaipur',    'Rajasthan',      'Art student. Vibrant, curious, and full of energy.',                      'https://randomuser.me/api/portraits/women/55.jpg'],
    ['Shruti D.',  32, 'Ahmedabad', 'Gujarat',        'Entrepreneur. Enjoys fine dining and wellness retreats.',                  'https://randomuser.me/api/portraits/women/72.jpg'],
    ['Pooja N.',   27, 'Lucknow',   'Uttar Pradesh',  'Classical dancer and fitness enthusiast.',                                 'https://randomuser.me/api/portraits/women/11.jpg'],
    ['Tara S.',    29, 'Chennai',   'Tamil Nadu',     'Architect who appreciates design in everything.',                          'https://randomuser.me/api/portraits/women/62.jpg'],
  ];
  women.forEach(w => insert.run(...w));
}

export default db;
