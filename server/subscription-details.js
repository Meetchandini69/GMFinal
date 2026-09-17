export function registerSubscriptionDetails(app, { requireAdmin, requireUser, upload, read, save }) {
  const getDetails = (member = false) => async (_req, res) => {
    try {
      const details = await read() || { image_url: '', content: '' };
      const enabled = details.enabled == null ? true : Boolean(details.enabled);
      res.json(member && !enabled ? { enabled, image_url: '', content: '' } : { ...details, enabled });
    } catch {
      res.status(500).json({ error: 'Unable to load subscription details.' });
    }
  };
  app.get('/api/admin/subscription-details', requireAdmin, getDetails());
  app.get('/api/user/subscription-details', requireUser, getDetails(true));
  app.put('/api/admin/subscription-details', requireAdmin, async (req, res) => {
    const { image_url, content, enabled } = req.body;
    if (enabled !== undefined && typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Enabled must be true or false.' });
    }
    if (typeof content !== 'string' || content.length > 10000 || typeof image_url !== 'string' ||
        (image_url !== '' && !/^\/uploads\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp|gif)$/i.test(image_url))) {
      return res.status(400).json({ error: 'Use an uploaded image and text up to 10,000 characters.' });
    }
    try {
      const sharingEnabled = enabled ?? Boolean((await read())?.enabled ?? true);
      await save(image_url, content, sharingEnabled);
      res.json({ image_url, content, enabled: sharingEnabled });
    } catch {
      res.status(500).json({ error: 'Unable to save subscription details.' });
    }
  });
  app.post('/api/admin/subscription-details/image', requireAdmin, (req, res) => {
    upload.single('photo')(req, res, error => {
      if (error) return res.status(400).json({ error: error.message });
      if (!req.file || !/^image\/(png|jpeg|webp|gif)$/.test(req.file.mimetype) ||
          !/\.(png|jpe?g|webp|gif)$/i.test(req.file.filename)) {
        return res.status(400).json({ error: 'Choose a PNG, JPEG, WebP or GIF image.' });
      }
      res.json({ url: `/uploads/${req.file.filename}` });
    });
  });
}
