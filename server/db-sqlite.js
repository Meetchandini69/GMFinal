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
    subscription_status TEXT DEFAULT 'unpaid',
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

  CREATE TABLE IF NOT EXISTS user_women_assignments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id),
    woman_id   INTEGER NOT NULL REFERENCES women(id),
    created_at DATETIME DEFAULT (datetime('now')),
    UNIQUE(user_id, woman_id)
  );
`);

try {
  db.exec("ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'unpaid'");
} catch (err) {
  if (!String(err?.message || '').includes('duplicate column')) throw err;
}

// ── Seed women profiles ────────────────────────────────────────────────────
const count = db.prepare('SELECT COUNT(*) as n FROM women').get().n;
if (count === 0) {
  const insert = db.prepare(
    'INSERT INTO women (name, age, city, state, bio, photo_url) VALUES (?,?,?,?,?,?)'
  );
  const modelPhotos = [
    '/models/gigolo-girl-1.jpeg',
    '/models/gigolo-girl-2.jpeg',
    '/models/gigolo-girl-3.jpeg',
    '/models/gigolo-girl-4.jpeg',
    '/models/gigolo-girl-5.jpeg',
    '/models/gigolo-girl-6.jpeg',
    '/models/gigolo-girl-7.jpeg',
    '/models/gigolo-girl-8.jpeg',
    '/models/gigolo-girl-9.jpeg',
    '/models/gigolo-girl-10.jpeg',
    '/models/gigolo-girl-11.jpeg',
    '/models/gigolo-girl-12.jpeg',
  ];
  const women = [
    ['Priya S.',   26, 'Chennai',   'Tamil Nadu',     'Loves travel, music and long drives. Looking for genuine company.',        modelPhotos[0]],
    ['Neha R.',    29, 'Mumbai',    'Maharashtra',    'Corporate professional. Weekend adventures are my thing.',                  modelPhotos[1]],
    ['Aisha M.',   24, 'Hyderabad', 'Telangana',      'Foodie at heart. Always up for a nice dinner and great conversation.',     modelPhotos[2]],
    ['Kavya T.',   31, 'Bangalore', 'Karnataka',      'Yoga instructor. Seeking mindful connections.',                            modelPhotos[3]],
    ['Riya K.',    27, 'Delhi',     'Delhi',           'Fashion blogger. Love art galleries and cozy cafés.',                     modelPhotos[4]],
    ['Sneha P.',   25, 'Pune',      'Maharashtra',    'Software engineer by day, dancer by night.',                               modelPhotos[5]],
    ['Divya L.',   28, 'Coimbatore','Tamil Nadu',     'Runs her own boutique. Enjoys weekends by the hills.',                    modelPhotos[6]],
    ['Meera V.',   30, 'Kolkata',   'West Bengal',    'Literature lover and travel photographer.',                                modelPhotos[7]],
    ['Ananya B.',  23, 'Jaipur',    'Rajasthan',      'Art student. Vibrant, curious, and full of energy.',                      modelPhotos[8]],
    ['Shruti D.',  32, 'Ahmedabad', 'Gujarat',        'Entrepreneur. Enjoys fine dining and wellness retreats.',                  modelPhotos[9]],
    ['Pooja N.',   27, 'Lucknow',   'Uttar Pradesh',  'Classical dancer and fitness enthusiast.',                                 modelPhotos[10]],
    ['Tara S.',    29, 'Chennai',   'Tamil Nadu',     'Architect who appreciates design in everything.',                          modelPhotos[11]],
  ];
  women.forEach(w => insert.run(...w));
}

export default db;
