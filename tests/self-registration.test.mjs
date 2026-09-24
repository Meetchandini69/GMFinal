import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import express from 'express';
import session from 'express-session';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { registerSelfRegistration } from '../server/self-registration.js';
import { sqliteSignupStore } from '../server/signup-store.js';

test('self-registration creates isolated unpaid accounts, preserves login and keeps passwords out of notifications', async () => {
  const db = new Database(':memory:');
  const schema = readFileSync(new URL('../server/db-sqlite.js', import.meta.url), 'utf8');
  for (const table of ['submissions','users','profiles']) db.exec(schema.match(new RegExp(`CREATE TABLE IF NOT EXISTS ${table} \\([\\s\\S]*?\\);`))[0]);
  db.exec('ALTER TABLE users ADD COLUMN email TEXT; CREATE UNIQUE INDEX users_signup_email ON users(LOWER(email));');
  const notifications = [];
  const app = express(); app.use(express.json());
  app.use(session({ secret: 'test-only-registration-secret', resave: false, saveUninitialized: false }));
  const store = sqliteSignupStore(db);
  let failNotify = false;
  registerSelfRegistration(app, { store, upload: multer(), siteUrl: 'https://example.test', notify: async text => { if (failNotify) throw new Error('offline'); notifications.push(text); } });
  // Exercise the actual existing SQLite login handler with the newly created account.
  const source = readFileSync(new URL('../server/index-sqlite.js', import.meta.url), 'utf8');
  new Function('app','db','bcrypt',source.slice(source.indexOf("app.post('/api/auth/login'"),source.indexOf('// Logout')))(app,db,bcrypt);
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening',resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = '';
  const call = async (path, body, useCookie = true) => {
    const r = await fetch(base+path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type':'application/json', ...(useCookie && cookie ? { Cookie:cookie } : {}) }, ...(body ? { body:JSON.stringify(body) } : {}) });
    if (useCookie && r.headers.get('set-cookie')) cookie=r.headers.get('set-cookie').split(';')[0];
    return r;
  };
  const credentials = { mobile:'9876543210',email:'member@example.test',password:'Testing!123',confirm_password:'Testing!123',plan:'1 Month Plan' };
  const profile = { full_name:'Test Member',category:'Gigolo',date_of_birth:'1995-01-01',state:'Tamil Nadu',city:'Chennai',adult_confirmed:true,subscription_status:'paid',member_status:'active',email:'tampered@example.test',joining_plan:'1 Year Plan' };
  try {
    assert.equal((await call('/api/signup/complete',profile)).status,401);
    assert.equal((await call('/api/signup/start',{...credentials,confirm_password:'wrong'})).status,400);
    assert.equal((await call('/api/signup/start',{...credentials,plan:'free'})).status,400);
    assert.equal((await call('/api/signup/start',credentials)).status,200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM users').get().n,0);
    const draft=await (await call('/api/signup/draft')).json();
    assert.equal(draft.email,credentials.email); assert.equal(draft.hash,undefined); assert.equal(draft.password,undefined);
    assert.equal(notifications.length,1); assert.ok(!notifications[0].includes(credentials.password));
    assert.equal((await call('/api/signup/complete',{...profile,date_of_birth:'2020-01-01'})).status,400);
    const completed=await call('/api/signup/complete',profile); assert.equal(completed.status,200);
    const result=await completed.json(); assert.equal(result.profile_url,'https://example.test/member-profile/1');
    const stored=await store.read(result.id);
    assert.equal(stored.subscription_status,'unpaid'); assert.equal(stored.member_status,'pending_review'); assert.equal(stored.profile_step,2);
    assert.equal(stored.email,credentials.email); assert.equal(stored.joining_plan,credentials.plan);
    assert.equal(db.prepare('SELECT status FROM submissions').get().status,'approved');
    const user=db.prepare('SELECT * FROM users').get(); assert.equal(user.is_active,1); assert.notEqual(user.password_hash,credentials.password); assert.ok(await bcrypt.compare(credentials.password,user.password_hash));
    assert.equal((await call('/api/member-profile/1')).status,200);
    assert.equal((await call('/api/member-profile/1',null,false)).status,403);
    assert.equal((await call('/api/member-profile/2')).status,403);
    assert.equal((await call('/api/signup/complete',profile)).status,401);
    assert.equal(notifications.length,2); assert.ok(notifications.every(n=>!n.includes(credentials.password)));
    cookie=''; assert.equal((await call('/api/auth/login',{mobile:credentials.mobile,password:credentials.password})).status,200);
    assert.equal((await call('/api/member-profile/1')).status,200);
    cookie=''; assert.equal((await call('/api/signup/start',credentials)).status,409);
    assert.equal((await call('/api/signup/start',{...credentials,mobile:'9876543211'})).status,409);
    failNotify=true;
    assert.equal((await call('/api/signup/start',{...credentials,mobile:'9876543212',email:'second@example.test'})).status,200);
    assert.equal((await call('/api/signup/complete',profile)).status,200);
    assert.equal((await call('/api/member-profile/1')).status,403);
    assert.equal((await call('/api/member-profile/2')).status,200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM users').get().n,2);
  } finally { server.close(); db.close(); }
});
