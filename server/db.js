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
    action     TEXT NOT NULL CHECK (action IN ('like', 'pass')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, woman_id)
  );
`);

// ── Seed women profiles ────────────────────────────────────────────────────
const { rows } = await pool.query('SELECT COUNT(*) AS n FROM women');
if (parseInt(rows[0].n, 10) === 0) {
  const women = [
    ['Priya S.',   26, 'Chennai',    'Tamil Nadu',    'Loves travel, music and long drives. Looking for genuine company.',       'https://randomuser.me/api/portraits/women/44.jpg'],
    ['Neha R.',    29, 'Mumbai',     'Maharashtra',   'Corporate professional. Weekend adventures are my thing.',                 'https://randomuser.me/api/portraits/women/68.jpg'],
    ['Aisha M.',   24, 'Hyderabad',  'Telangana',     'Foodie at heart. Always up for a nice dinner and great conversation.',    'https://randomuser.me/api/portraits/women/65.jpg'],
    ['Kavya T.',   31, 'Bangalore',  'Karnataka',     'Yoga instructor. Seeking mindful connections.',                           'https://randomuser.me/api/portraits/women/47.jpg'],
    ['Riya K.',    27, 'Delhi',      'Delhi',          'Fashion blogger. Love art galleries and cozy cafés.',                    'https://randomuser.me/api/portraits/women/90.jpg'],
    ['Sneha P.',   25, 'Pune',       'Maharashtra',   'Software engineer by day, dancer by night.',                              'https://randomuser.me/api/portraits/women/26.jpg'],
    ['Divya L.',   28, 'Coimbatore', 'Tamil Nadu',    'Runs her own boutique. Enjoys weekends by the hills.',                   'https://randomuser.me/api/portraits/women/33.jpg'],
    ['Meera V.',   30, 'Kolkata',    'West Bengal',   'Literature lover and travel photographer.',                               'https://randomuser.me/api/portraits/women/17.jpg'],
    ['Ananya B.',  23, 'Jaipur',     'Rajasthan',     'Art student. Vibrant, curious, and full of energy.',                     'https://randomuser.me/api/portraits/women/55.jpg'],
    ['Shruti D.',  32, 'Ahmedabad',  'Gujarat',       'Entrepreneur. Enjoys fine dining and wellness retreats.',                 'https://randomuser.me/api/portraits/women/72.jpg'],
    ['Pooja N.',   27, 'Lucknow',    'Uttar Pradesh', 'Classical dancer and fitness enthusiast.',                                'https://randomuser.me/api/portraits/women/11.jpg'],
    ['Tara S.',    29, 'Chennai',    'Tamil Nadu',    'Architect who appreciates design in everything.',                         'https://randomuser.me/api/portraits/women/62.jpg'],
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
