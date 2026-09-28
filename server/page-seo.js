import { SEO_FIELDS, seoPath, resolveSeo } from './seo-core.js';

export function registerPageSeo(app, { requireAdmin, store }) {
  const metadata = async path => resolveSeo(path, await store.location(path.slice(1)), JSON.parse((await store.read(path))?.data || '{}'), process.env.SITE_URL || 'https://gigolomeet.in');
  app.get('/api/page-seo', async (req, res) => {
    let path; try { path = seoPath(req.query.path || '/'); } catch (e) { return res.status(400).json({ error: e.message }); }
    try { res.set('Cache-Control','no-store').json(await metadata(path)); }
    catch { res.status(503).json({ error: 'Unable to load page metadata.' }); }
  });
  app.get('/api/admin/page-seo', requireAdmin, async (_req, res) => {
    try {
      const paths = new Set(['/', '/coimbatore','/hyderabad','/kolkata','/free-registration','/login','/dashboard', ...(await store.locations()).map(p => '/'+p.slug), ...(await store.list()).map(p => p.path)]);
      res.json([...paths].sort());
    } catch { res.status(500).json({ error: 'Unable to load pages.' }); }
  });
  app.get('/api/admin/page-seo/details', requireAdmin, async (req, res) => {
    let path; try { path = seoPath(req.query.path || '/'); } catch (e) { return res.status(400).json({ error:e.message }); }
    try { res.json({ path, overrides: JSON.parse((await store.read(path))?.data || '{}'), resolved: await metadata(path) }); }
    catch { res.status(500).json({ error: 'Unable to load SEO settings.' }); }
  });
  app.put('/api/admin/page-seo', requireAdmin, async (req, res) => {
    let path; try { path = seoPath(req.body.path); } catch (e) { return res.status(400).json({ error:e.message }); }
    const data = {};
    for (const field of SEO_FIELDS) {
      const value = req.body.overrides?.[field] ?? '';
      if (typeof value !== 'string' || value.length > 2048) return res.status(400).json({ error: 'SEO values must be text up to 2048 characters.' });
      data[field] = value.trim();
    }
    if (data.robots && !['index, follow','noindex, follow','noindex, nofollow'].includes(data.robots)) return res.status(400).json({ error: 'Choose a supported robots setting.' });
    for (const field of ['canonical','og_image','twitter_image']) {
      if (!data[field]) continue;
      try { const url = new URL(data[field]); if (!['http:','https:'].includes(url.protocol) || url.username || url.password || url.hash) throw new Error(); }
      catch { return res.status(400).json({ error: `${field}: enter a full http(s) URL without credentials or a fragment.` }); }
    }
    try { await store.save(path, JSON.stringify(data)); res.json({ path, overrides: data, resolved: await metadata(path) }); }
    catch { res.status(500).json({ error: 'Unable to save SEO settings.' }); }
  });
}
