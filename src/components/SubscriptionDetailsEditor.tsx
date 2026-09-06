import { useEffect, useState } from 'react';
import { apiFetch, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function SubscriptionDetailsEditor() {
  const [details, setDetails] = useState({ image_url: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const load = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await apiFetch('/api/admin/subscription-details');
      if (!res.ok) throw new Error('Unable to load subscription details. Please retry.');
      setDetails(await res.json());
      setReady(true);
    } catch (err) { setMessage((err as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const upload = async (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setMessage('Choose a PNG, JPEG, WebP or GIF image under 10 MB.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const body = new FormData();
      body.append('photo', file);
      const res = await apiFetch('/api/admin/subscription-details/image', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setDetails(prev => ({ ...prev, image_url: data.url }));
      setMessage('Image uploaded. Save to publish your changes.');
    } catch (err) { setMessage((err as Error).message); }
    finally { setBusy(false); }
  };
  const save = async () => {
    setBusy(true);
    setMessage('');
    try {
      const res = await apiFetch('/api/admin/subscription-details', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      setMessage('Subscription details saved.');
    } catch (err) { setMessage((err as Error).message); }
    finally { setBusy(false); }
  };
  if (loading) return <p className="text-muted-foreground">Loading subscription details...</p>;
  return (
    <div className="bg-card border border-white/10 rounded-xl p-6 space-y-5">
      <div><h2 className="text-white text-lg font-bold">Subscription Details</h2>
        <p className="text-muted-foreground text-sm mt-1">These details appear when a member clicks Pay Subscription.</p></div>
      <fieldset disabled={busy || !ready} className="space-y-5 disabled:opacity-60">
        <div className="space-y-2">
          <label htmlFor="subscription-image" className="text-sm text-white">Payment image</label>
          <Input id="subscription-image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} />
          <p className="text-xs text-muted-foreground">PNG, JPEG, WebP or GIF, up to 10 MB.</p>
          {details.image_url && <div className="space-y-2">
            <img src={getImageUrl(details.image_url)} alt="Subscription payment details preview" className="max-h-80 max-w-full rounded-lg object-contain" />
            <Button variant="outline" onClick={() => setDetails(prev => ({ ...prev, image_url: '' }))}>Remove image</Button>
          </div>}
        </div>
        <div className="space-y-2">
          <label htmlFor="subscription-content" className="text-sm text-white">Payment details</label>
          <Textarea id="subscription-content" rows={8} maxLength={10000} value={details.content} onChange={e => setDetails(prev => ({ ...prev, content: e.target.value }))} placeholder="Enter subscription information and payment instructions" />
        </div>
        <Button onClick={save} className="bg-primary text-black font-bold">{busy ? 'Please wait...' : 'Save Subscription Details'}</Button>
      </fieldset>
      {message && <p role="status" className="text-sm text-white">{message}</p>}
      {!ready && <Button onClick={load}>Retry</Button>}
    </div>
  );
}
