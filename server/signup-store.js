import { profileFields } from './self-registration.js';
const duplicateError = () => Object.assign(new Error('Already registered'), { code: 'DUPLICATE' });
const pgDuplicate = async (db, mobile, email) => (await db.query(`SELECT id FROM users WHERE mobile=$1 OR LOWER(email)=$2 UNION SELECT id FROM submissions WHERE RIGHT(REGEXP_REPLACE(mobile, '\\D', '', 'g'), 10)=$1 LIMIT 1`, [mobile, email])).rows.length > 0;

export function postgresSignupStore(pool) {
  return {
    duplicate: (mobile, email) => pgDuplicate(pool, mobile, email),
    read: async id => (await pool.query('SELECT p.*, u.mobile FROM profiles p JOIN users u ON u.id=p.user_id WHERE u.id=$1', [id])).rows[0],
    create: async (draft, profile) => {
      const db = await pool.connect();
      try {
        await db.query('BEGIN');
        await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [draft.mobile]);
        if (await pgDuplicate(db, draft.mobile, draft.email)) throw duplicateError();
        const submission = (await db.query("INSERT INTO submissions (name,mobile,city,age,status) VALUES ($1,$2,$3,$4,'approved') RETURNING id", [profile.full_name,draft.mobile,profile.city,profile.date_of_birth])).rows[0];
        const user = (await db.query('INSERT INTO users (submission_id,mobile,email,password_hash,is_active) VALUES ($1,$2,$3,$4,TRUE) RETURNING id', [submission.id,draft.mobile,draft.email,draft.hash])).rows[0];
        const values = [user.id, ...profileFields.map(key => profile[key])];
        await db.query(`INSERT INTO profiles (user_id,${profileFields.join(',')},profile_step,member_status,subscription_status,submitted_at) VALUES (${values.map((_, i) => '$'+(i+1)).join(',')},2,'pending_review','unpaid',NOW())`, values);
        await db.query('COMMIT');
        return user;
      } catch (error) { await db.query('ROLLBACK'); throw error; }
      finally { db.release(); }
    },
  };
}

export function sqliteSignupStore(db) {
  const duplicate = (mobile, email) => !!db.prepare('SELECT id FROM users WHERE mobile=? OR LOWER(email)=?').get(mobile,email) || db.prepare('SELECT mobile FROM submissions').all().some(row => String(row.mobile).replace(/\D/g,'').slice(-10) === mobile);
  return {
    duplicate: async (mobile, email) => duplicate(mobile, email),
    read: async id => db.prepare('SELECT p.*,u.mobile FROM profiles p JOIN users u ON u.id=p.user_id WHERE u.id=?').get(id),
    create: async (draft, profile) => db.transaction(() => {
      if (duplicate(draft.mobile, draft.email)) throw duplicateError();
      const sub = db.prepare("INSERT INTO submissions (name,mobile,city,age,status) VALUES (?,?,?,?,'approved')").run(profile.full_name,draft.mobile,profile.city,profile.date_of_birth);
      const user = db.prepare('INSERT INTO users (submission_id,mobile,email,password_hash,is_active) VALUES (?,?,?,?,1)').run(sub.lastInsertRowid,draft.mobile,draft.email,draft.hash);
      const values = [Number(user.lastInsertRowid), ...profileFields.map(key => profile[key])];
      db.prepare(`INSERT INTO profiles (user_id,${profileFields.join(',')},profile_step,member_status,subscription_status,submitted_at) VALUES (${values.map(() => '?').join(',')},2,'pending_review','unpaid',datetime('now'))`).run(...values);
      return { id: Number(user.lastInsertRowid) };
    })(),
  };
}
