import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function PaymentReceipt({ userId }: { userId?: number }) {
  const [image, setImage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [version, setVersion] = useState(0);
  const endpoint = userId === undefined ? '/api/user/payment-receipt' : `/api/admin/users/${userId}/payment-receipt`;

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    setLoading(true);
    setImage('');
    setError('');
    (async () => {
      try {
        const res = await apiFetch(endpoint);
        if (res.status === 404 && res.headers.get('content-type')?.includes('application/json')) return;
        if (res.status === 401) throw new Error('Please sign in again to view your receipt.');
        if (!res.headers.get('content-type')?.startsWith('image/')) throw new Error('Receipt service is unavailable. Please restart the backend and retry.');
        if (!res.ok) throw new Error('Unable to load the receipt. Please retry.');
        const blob = await res.blob();
        if (active) { objectUrl = URL.createObjectURL(blob); setImage(objectUrl); }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load the receipt.');
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [endpoint, version]);

  const upload = async () => {
    if (!file) return;
    setError('');
    setSuccess('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError('Choose a PNG, JPEG or WebP image up to 10 MB.');
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append('receipt', file);
      const res = await apiFetch(endpoint, { method: 'POST', body });
      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Receipt service is unavailable. Please restart the backend and retry.');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to upload the receipt.');
      setSuccess('Receipt uploaded. Your payment is awaiting admin verification.');
      setFile(null);
      setVersion(v => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload the receipt. Please try again.');
    } finally { setUploading(false); }
  };

  return (
    <div className="space-y-3 border-t border-white/10 pt-4 mt-4">
      <h4 className="font-semibold text-white">Payment receipt</h4>
      {loading ? <p className="text-sm text-muted-foreground">Loading receipt...</p> : image ? (
        <a href={image} target="_blank" rel="noopener noreferrer" className="block w-fit">
          <img src={image} alt="Uploaded payment receipt" className="max-h-64 max-w-full rounded-lg object-contain" />
          <span className="text-sm text-primary underline">View full receipt</span>
        </a>
      ) : !error && <p className="text-sm text-muted-foreground">No receipt uploaded yet.</p>}
      {userId === undefined && (
        <div className="space-y-2">
          <label className="block text-sm text-white">
            {image ? 'Replace receipt' : 'Attach payment receipt'} (PNG, JPEG or WebP, max 10 MB)
            <input key={version} type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={e => { setFile(e.target.files?.[0] || null); setSuccess(''); }} className="block mt-2 w-full text-sm" />
          </label>
          <Button onClick={upload} disabled={!file || uploading} className="bg-primary text-black">
            {uploading ? 'Uploading...' : 'Upload Receipt'}
          </Button>
        </div>
      )}
      {success && <p role="status" className="text-sm text-green-400">{success}</p>}
      {error && <div role="alert" className="text-sm text-red-400">{error} <button type="button" className="underline" onClick={() => setVersion(v => v + 1)}>Reload receipt</button></div>}
    </div>
  );
}
