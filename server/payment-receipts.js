import multer from 'multer';

const receiptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

function imageType(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'image/jpeg';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export function registerPaymentReceipts(app, { requireUser, requireAdmin, read, save, onUploaded }) {
  const getReceipt = userId => async (req, res) => {
    try {
      const id = Number(userId(req));
      if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid user.' });
      const receipt = await read(id);
      res.set('Cache-Control', 'private, no-store');
      if (!receipt) return res.status(404).json({ error: 'No receipt uploaded yet.' });
      res.set('Content-Type', receipt.mime_type);
      res.set('X-Content-Type-Options', 'nosniff');
      res.send(Buffer.from(receipt.image_data));
    } catch {
      res.status(500).json({ error: 'Unable to load the receipt.' });
    }
  };
  app.get('/api/user/payment-receipt', requireUser, getReceipt(req => req.session.userId));
  app.get('/api/admin/users/:userId/payment-receipt', requireAdmin, getReceipt(req => req.params.userId));
  app.post('/api/user/payment-receipt', requireUser, (req, res) => {
    receiptUpload.single('receipt')(req, res, async error => {
      if (error) return res.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Receipt must be 10 MB or smaller.' : 'Choose one receipt image.' });
      const type = req.file && imageType(req.file.buffer);
      if (!type) return res.status(400).json({ error: 'Choose a PNG, JPEG or WebP receipt image.' });
      try {
        await save(req.session.userId, type, req.file.buffer);
        if (onUploaded) {
          try { await onUploaded(req.session.userId); }
          catch { console.error('Unable to send payment receipt notification.'); }
        }
        res.json({ ok: true });
      } catch {
        res.status(500).json({ error: 'Unable to save the receipt. Please try again.' });
      }
    });
  });
}
