import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type Partner = { id: number; alt: string; url: string; position: number };
const empty = { alt: '', url: '', position: 0 };
export default function PartnersEditor() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [draft, setDraft] = useState<Partial<Partner> & typeof empty>(empty);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState('');
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const load = async () => {
    try {
      const res = await apiFetch('/api/admin/partners');
      if (!res.ok) throw new Error('Unable to load partners. Please retry.');
      setPartners(await res.json()); setReady(true);
    } catch (e) { setMessage((e as Error).message); }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const reset = () => { setDraft(empty); setFile(undefined); setVersion(v => v + 1); };
  const save = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const body = new FormData();
      body.append('alt', draft.alt); body.append('url', draft.url); body.append('position', String(draft.position));
      if (file) body.append('image', file);
      const res = await apiFetch(`/api/admin/partners${draft.id ? `/${draft.id}` : ''}`, { method: draft.id ? 'PUT' : 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save partner.');
      reset(); await load(); setMessage('Partner saved and published above the footer.');
    } catch (e) { setMessage((e as Error).message); }
    finally { setBusy(false); }
  };
  const remove = async (partner: Partner) => {
    if (!window.confirm(`Remove ${partner.alt} from the partner slider?`)) return;
    setBusy(true); setMessage('');
    try {
      const res = await apiFetch(`/api/admin/partners/${partner.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Unable to remove partner.');
      if (draft.id === partner.id) reset();
      await load(); setMessage('Partner removed.');
    } catch (e) { setMessage((e as Error).message); }
    finally { setBusy(false); }
  };
  return <div className="bg-card border border-white/10 rounded-xl p-6 space-y-6">
    <div><h2 className="text-xl font-bold">Partner Links</h2><p className="text-sm text-muted-foreground mt-1">Images scroll above the footer on every public page. Lower display-order numbers appear first.</p></div>
    {message && <p role="status" className="text-sm text-primary">{message}</p>}
    {!ready && <Button onClick={load}>Retry loading partners</Button>}
    <form onSubmit={save}>
      <fieldset disabled={busy || !ready} className="space-y-4 disabled:opacity-60">
        <legend className="font-semibold mb-3">{draft.id ? 'Edit partner' : 'Add partner'}</legend>
        <label className="block text-sm">Partner image (PNG, JPEG or WebP, up to 5 MB)
          <Input key={version} type="file" accept="image/png,image/jpeg,image/webp" required={!draft.id} onChange={e => {
            const selected = e.target.files?.[0];
            if (selected && (selected.size > 5 * 1024 * 1024 || !['image/png','image/jpeg','image/webp'].includes(selected.type))) {
              setMessage('Choose a PNG, JPEG or WebP image up to 5 MB.'); e.target.value = ''; setFile(undefined); return;
            }
            setFile(selected);
          }} className="mt-2" />
        </label>
        {(preview || draft.id) && <img src={preview || `/api/partners/${draft.id}/image?v=${version}`} alt={draft.alt || 'Partner image preview'} className="h-24 max-w-full object-contain rounded bg-white p-2" />}
        <label className="block text-sm">Image alt text<Input required maxLength={200} value={draft.alt} onChange={e => setDraft(d => ({ ...d, alt: e.target.value }))} placeholder="Partner name or image description" className="mt-2" /></label>
        <label className="block text-sm">Partner link<Input required type="url" maxLength={2048} value={draft.url} onChange={e => setDraft(d => ({ ...d, url: e.target.value }))} placeholder="https://example.com" className="mt-2" /></label>
        <label className="block text-sm">Display order<Input required type="number" step="1" min="-2147483648" max="2147483647" value={draft.position} onChange={e => setDraft(d => ({ ...d, position: Number(e.target.value) }))} className="mt-2" /></label>
        <div className="flex gap-3"><Button type="submit">{busy ? 'Please wait...' : 'Save Partner'}</Button>{draft.id && <Button type="button" variant="outline" onClick={reset}>Cancel edit</Button>}</div>
      </fieldset>
    </form>
    <div className="space-y-3">
      {ready && !partners.length && <p className="text-sm text-muted-foreground">No partners yet. Add the first image to show the slider.</p>}
      {partners.map(p => <div key={p.id} className="flex flex-wrap items-center gap-4 border border-white/10 rounded-lg p-3">
        <img src={`/api/partners/${p.id}/image?v=${version}`} alt={p.alt} className="w-24 h-16 object-contain bg-white rounded p-2" />
        <div className="flex-1 min-w-0"><p className="font-medium break-words">{p.alt}</p><p className="text-xs text-muted-foreground break-all">{p.url}</p><p className="text-xs">Order: {p.position}</p></div>
        <Button disabled={busy} variant="outline" onClick={() => { setDraft(p); setFile(undefined); setVersion(v => v + 1); setMessage(''); }}>Edit</Button>
        <Button disabled={busy} variant="outline" onClick={() => remove(p)}>Remove</Button>
      </div>)}
    </div>
  </div>;
}
