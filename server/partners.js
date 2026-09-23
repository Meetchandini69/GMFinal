import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
function imageType(b) {
  if (b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if (b[0] === 255 && b[1] === 216 && b[2] === 255) return 'image/jpeg';
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}
export function registerPartners(app, { requireAdmin, list, image, save, remove }) {
  const getList = async (_req, res) => {
    try { res.set('Cache-Control', 'no-store').json(await list()); }
    catch { res.status(500).json({ error: 'Unable to load partners.' }); }
  };
  app.get('/api/partners', getList);
  app.get('/api/admin/partners', requireAdmin, getList);
  app.get('/api/partners/:id/image', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.sendStatus(400);
    try {
      const row = await image(id);
      if (!row) return res.sendStatus(404);
      res.set({ 'Content-Type': row.mime_type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' }).send(Buffer.from(row.image_data));
    } catch { res.sendStatus(500); }
  });
  const write = (req, res) => upload.single('image')(req, res, async error => {
    if (error) return res.status(400).json({ error: 'Choose one PNG, JPEG or WebP image up to 5 MB.' });
    const id = req.params.id ? Number(req.params.id) : null;
    const { alt, url, position } = req.body;
    if ((id !== null && (!Number.isSafeInteger(id) || id < 1)) || typeof alt !== 'string' || !alt.trim() || alt.length > 200 || typeof url !== 'string' || url.length > 2048 || !Number.isSafeInteger(Number(position)) || Number(position) < -2147483648 || Number(position) > 2147483647) {
      return res.status(400).json({ error: 'Enter alt text (up to 200 characters), a link and a whole-number display order.' });
    }
    let link;
    try { link = new URL(url); if (!['http:', 'https:'].includes(link.protocol) || link.username || link.password) throw new Error(); }
    catch { return res.status(400).json({ error: 'Enter a valid http:// or https:// partner link.' }); }
    const type = req.file && imageType(req.file.buffer);
    if ((!id && !req.file) || (req.file && !type)) return res.status(400).json({ error: 'Choose a PNG, JPEG or WebP image.' });
    try {
      const result = await save(id, alt.trim(), link.href, Number(position), req.file ? { type, buffer: req.file.buffer } : null);
      if (!result) return res.status(404).json({ error: 'Partner no longer exists.' });
      res.json(result);
    } catch { res.status(500).json({ error: 'Unable to save partner.' }); }
  });
  app.post('/api/admin/partners', requireAdmin, write);
  app.put('/api/admin/partners/:id', requireAdmin, write);
  app.delete('/api/admin/partners/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.sendStatus(400);
    try { await remove(id); res.json({ ok: true }); }
    catch { res.status(500).json({ error: 'Unable to remove partner.' }); }
  });
}
