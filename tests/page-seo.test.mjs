import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import express from 'express';
import Database from 'better-sqlite3';
import { registerPageSeo } from '../server/page-seo.js';
import { resolveSeo, renderSeoHtml } from '../server/seo-core.js';

test('metadata defaults, overrides and HTML escaping', () => {
  const home = resolveSeo('/'); const city = resolveSeo('/coimbatore/');
  assert.notEqual(home.title,city.title); assert.notEqual(home.description,city.description);
  assert.equal(city.canonical,'https://gigolomeet.in/coimbatore');
  const custom = resolveSeo('/chennai',{city:'Chennai',state:'Tamil Nadu',title:'Chennai City',meta_description:'City description'}, {title:'Custom <title>',og_title:'Share Chennai',canonical:'https://gigolomeet.in/chennai'});
  assert.equal(custom.og_title,'Share Chennai'); assert.equal(custom.twitter_title,'Share Chennai');
  assert.equal(custom.description,'City description');
  assert.equal(resolveSeo('/dashboard',null,{robots:'index, follow'}).robots,'noindex, nofollow');
  assert.equal(resolveSeo('/not-a-real-page').found,false);
  const html = renderSeoHtml(readFileSync(new URL('../index.html',import.meta.url),'utf8'),custom);
  assert.equal((html.match(/<title>/g)||[]).length,1);
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert.match(html,/<title>Custom &lt;title&gt;<\/title>/);
  assert.match(html,/property="og:url" content="https:\/\/gigolomeet.in\/chennai"/);
  assert.ok(html.includes('gtag')); assert.ok(html.includes('name="viewport"'));
});

test('SEO API persists admin overrides and refuses unauthorized or unsafe changes', async () => {
  const db = new Database(':memory:'); db.exec("CREATE TABLE page_seo(path TEXT PRIMARY KEY,data TEXT NOT NULL DEFAULT '{}')");
  const app=express();app.use(express.json());
  registerPageSeo(app,{requireAdmin:(req,res,next)=>req.headers.authorization==='test'?next():res.sendStatus(401),store:{
    read:async path=>db.prepare('SELECT data FROM page_seo WHERE path=?').get(path),
    list:async()=>db.prepare('SELECT path FROM page_seo').all(),
    save:async(path,data)=>db.prepare('INSERT INTO page_seo VALUES (?,?) ON CONFLICT(path) DO UPDATE SET data=excluded.data').run(path,data),
    locations:async()=>[{slug:'chennai'}],location:async slug=>slug==='chennai'?{city:'Chennai',title:'Chennai Page'}:null,
  }});
  const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
  const base=`http://127.0.0.1:${server.address().port}`;
  const save=body=>fetch(base+'/api/admin/page-seo',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'test'},body:JSON.stringify(body)});
  try {
    assert.equal((await fetch(base+'/api/admin/page-seo')).status,401);
    assert.equal((await save({path:'/chennai',overrides:{canonical:'javascript:alert(1)'}})).status,400);
    assert.equal((await save({path:'//evil.test',overrides:{}})).status,400);
    assert.equal((await save({path:'/chennai',overrides:{title:'Unique Chennai',description:'Unique description',og_image:'https://gigolomeet.in/image.jpg'}})).status,200);
    let data=await(await fetch(base+'/api/page-seo?path=/chennai')).json();
    assert.equal(data.title,'Unique Chennai');assert.equal(data.og_title,data.title);assert.equal(data.twitter_image,data.og_image);
    assert.equal((await save({path:'/chennai',overrides:{}})).status,200);
    data=await(await fetch(base+'/api/page-seo?path=/chennai')).json();assert.equal(data.title,'Chennai Page');assert.equal(data.og_image,'');
  } finally {server.close();db.close();}
});

test('Pages worker serves page-specific source HTML before JavaScript, without affecting assets', async () => {
  const core=readFileSync(new URL('../server/seo-core.js',import.meta.url),'utf8').replace(/^export /gm,'');
  const source=core+'\n'+readFileSync(new URL('../server/pages-proxy.js',import.meta.url),'utf8');
  const worker=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;
  const shell=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const env={API_ORIGIN:'https://backend.example.test',SITE_URL:'https://gigolomeet.in',ASSETS:{fetch:async request=>new Response(request.url.endsWith('.png')?'image':shell,{headers:{'Content-Type':request.url.endsWith('.png')?'image/png':'text/html'}})}};
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async input=>Response.json(resolveSeo(new URL(input).searchParams.get('path'),null,{title:'Custom served title'}));
  try {
    const response=await worker.fetch(new Request('https://preview.example.test/coimbatore?utm_source=test'),env);
    const html=await response.text();assert.equal(response.status,200);
    assert.match(html,/<title>Custom served title<\/title>/);assert.match(html,/href="https:\/\/gigolomeet.in\/coimbatore"/);
    assert.ok(!html.includes('preview.example.test'));assert.ok(!html.includes('utm_source'));
    assert.equal((await worker.fetch(new Request('https://gigolomeet.in/not-a-real-page'),env)).status,404);
    const privateHtml=await(await worker.fetch(new Request('https://gigolomeet.in/dashboard'),env)).text();assert.match(privateHtml,/content="noindex, nofollow"/);
    assert.equal(await(await worker.fetch(new Request('https://gigolomeet.in/test.png'),env)).text(),'image');
    globalThis.fetch=async()=>{throw new Error('offline');};
    assert.equal((await worker.fetch(new Request('https://gigolomeet.in/coimbatore'),env)).status,503);
  } finally {globalThis.fetch=originalFetch;}
});
