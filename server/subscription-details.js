export function registerSubscriptionDetails(app, { requireAdmin, requireUser, upload, read, save }) {
  const getDetails = async (_req, res) => {
    try {
      res.json(await read() || { image_url: '', content: '' });
    } catch {
      res.status(500).json({ error: 'Unable to load subscription details.' });
    }
  };
  app.get('/api/admin/subscription-details', requireAdmin, getDetails);
  app.get('/api/user/subscription-details', requireUser, getDetails);
  app.put('/api/admin/subscription-details', requireAdmin, async (req, res) => {
    const { image_url, content } = req.body;
    if (typeof content !== 'string' || content.length > 10000 || typeof image_url !== 'string' ||
        (image_url !== '' && !/^\/uploads\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp|gif)$/i.test(image_url))) {
      return res.status(400).json({ error: 'Use an uploaded image and text up to 10,000 characters.' });
    }
    try {
      await save(image_url, content);
      res.json({ image_url, content });
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
