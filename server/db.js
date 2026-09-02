import pg from 'pg';
const { Pool } = pg;

// ── Connection pool ────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon') ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

console.log("DATABASE_URL =", process.env.DATABASE_URL);

// ── Schema ─────────────────────────────────────────────────────────────────
await pool.query(`
  CREATE TABLE IF NOT EXISTS submissions (
    id         SERIAL PRIMARY KEY,
    name       TEXT    NOT NULL,
    mobile     TEXT    NOT NULL,
    city       TEXT,
    age        TEXT,
    status     TEXT    DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
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
    subscription_status TEXT DEFAULT 'unpaid',
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

  CREATE TABLE IF NOT EXISTS location_pages (
    id                SERIAL PRIMARY KEY,
    slug              TEXT UNIQUE NOT NULL,
    source_slug       TEXT,
    title             TEXT NOT NULL,
    city              TEXT NOT NULL,
    state             TEXT,
    nickname          TEXT,
    hero_description  TEXT,
    meta_description  TEXT,
    stats             JSONB NOT NULL DEFAULT '[]'::jsonb,
    areas             JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE location_pages ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL DEFAULT '{}'::jsonb;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'unpaid';

  CREATE TABLE IF NOT EXISTS swipe_actions (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id),
    woman_id   INTEGER NOT NULL REFERENCES women(id),
    action     TEXT NOT NULL CHECK (action IN ('like', 'pass')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, woman_id)
  );

  CREATE TABLE IF NOT EXISTS user_women_assignments (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id),
    woman_id   INTEGER NOT NULL REFERENCES women(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, woman_id)
  );
`);

// ── Seed women profiles ────────────────────────────────────────────────────
const { rows } = await pool.query('SELECT COUNT(*) AS n FROM women');
if (parseInt(rows[0].n, 10) === 0) {
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
    ['Priya S.',   26, 'Chennai',    'Tamil Nadu',    'Loves travel, music and long drives. Looking for genuine company.',       modelPhotos[0]],
    ['Neha R.',    29, 'Mumbai',     'Maharashtra',   'Corporate professional. Weekend adventures are my thing.',                 modelPhotos[1]],
    ['Aisha M.',   24, 'Hyderabad',  'Telangana',     'Foodie at heart. Always up for a nice dinner and great conversation.',    modelPhotos[2]],
    ['Kavya T.',   31, 'Bangalore',  'Karnataka',     'Yoga instructor. Seeking mindful connections.',                           modelPhotos[3]],
    ['Riya K.',    27, 'Delhi',      'Delhi',          'Fashion blogger. Love art galleries and cozy cafés.',                    modelPhotos[4]],
    ['Sneha P.',   25, 'Pune',       'Maharashtra',   'Software engineer by day, dancer by night.',                              modelPhotos[5]],
    ['Divya L.',   28, 'Coimbatore', 'Tamil Nadu',    'Runs her own boutique. Enjoys weekends by the hills.',                   modelPhotos[6]],
    ['Meera V.',   30, 'Kolkata',    'West Bengal',   'Literature lover and travel photographer.',                               modelPhotos[7]],
    ['Ananya B.',  23, 'Jaipur',     'Rajasthan',     'Art student. Vibrant, curious, and full of energy.',                     modelPhotos[8]],
    ['Shruti D.',  32, 'Ahmedabad',  'Gujarat',       'Entrepreneur. Enjoys fine dining and wellness retreats.',                 modelPhotos[9]],
    ['Pooja N.',   27, 'Lucknow',    'Uttar Pradesh', 'Classical dancer and fitness enthusiast.',                                modelPhotos[10]],
    ['Tara S.',    29, 'Chennai',    'Tamil Nadu',    'Architect who appreciates design in everything.',                         modelPhotos[11]],
  ];
  for (const w of women) {
    await pool.query(
      'INSERT INTO women (name, age, city, state, bio, photo_url) VALUES ($1,$2,$3,$4,$5,$6)',
      w
    );
  }
  console.log('✅ Seeded 12 women profiles');
}

console.log('✅ PostgreSQL connected and schema ready');

export default pool;
