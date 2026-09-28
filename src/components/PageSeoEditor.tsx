import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const fields = [
  ['title','SEO title'], ['description','Meta description'], ['canonical','Canonical URL'],
  ['og_title','Open Graph title'], ['og_description','Open Graph description'], ['og_image','Open Graph image URL'],
  ['twitter_title','Twitter title'], ['twitter_description','Twitter description'], ['twitter_image','Twitter image URL'],
];
export default function PageSeoEditor() {
  const [pages, setPages] = useState<string[]>([]);
  const [path, setPath] = useState('/');
  const [loadedPath, setLoadedPath] = useState('');
  const [values, setValues] = useState<Record<string,string>>({});
  const [resolved, setResolved] = useState<Record<string,string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = async (selected: string) => {
    setBusy(true); setLoadedPath(''); setMessage('');
    try {
      const res = await apiFetch(`/api/admin/page-seo/details?path=${encodeURIComponent(selected)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load page SEO.');
      setValues(data.overrides); setResolved(data.resolved); setLoadedPath(data.path); setPath(data.path);
    } catch (e) { setMessage((e as Error).message); }
    finally { setBusy(false); }
  };
  useEffect(() => {
    apiFetch('/api/admin/page-seo').then(async res => {
      if (!res.ok) throw new Error('Unable to load the page list. You can still enter a page path below.');
      setPages(await res.json());
    }).catch(e => setMessage(e.message));
    void load('/');
  }, []);
  const save = async () => {
    setBusy(true); setMessage('');
    try {
      const res = await apiFetch('/api/admin/page-seo', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: loadedPath, overrides: values }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save SEO.');
      setResolved(data.resolved); setValues(data.overrides); setMessage('SEO settings saved. Refresh the public page to see the updates.');
    } catch (e) { setMessage((e as Error).message); }
    finally { setBusy(false); }
  };
  return <section className="bg-card border border-white/10 rounded-xl p-6 space-y-5">
    <h2 className="text-xl font-bold">Page SEO</h2>
    <p className="text-sm text-muted-foreground">Defaults follow the page or location name and existing page title/description. Leave any override blank to use its automatic value. Editing SEO does not change page content or layout.</p>
    <label className="block text-sm">Choose page<select disabled={busy} value={pages.includes(path) ? path : ''} onChange={e => { setPath(e.target.value); void load(e.target.value); }} className="block w-full mt-2 p-3 bg-background border border-white/10 rounded-lg">
      {!pages.includes(path) && <option value="">Custom page</option>}
      {pages.map(p => <option key={p} value={p}>{p === '/' ? '/ (Home)' : p}</option>)}
    </select></label>
    <div className="flex gap-3"><Input aria-label="Page path" value={path} disabled={busy} onChange={e => setPath(e.target.value)} placeholder="/coimbatore" /><Button disabled={busy} onClick={() => load(path)}>Load</Button></div>
    <fieldset disabled={busy || !loadedPath || path !== loadedPath} className="space-y-4 disabled:opacity-50">
      {fields.map(([key,label]) => <label key={key} className="block text-sm">{label}
        {key.includes('description') ? <Textarea value={values[key] || ''} maxLength={2048} placeholder={resolved[key]} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))} className="mt-2" /> : <Input value={values[key] || ''} maxLength={2048} placeholder={resolved[key]} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))} className="mt-2" />}
      </label>)}
      <label className="block text-sm">Robots<select value={values.robots || ''} onChange={e => setValues(v => ({ ...v, robots: e.target.value }))} className="block w-full mt-2 p-3 bg-background border border-white/10 rounded-lg">
        <option value="">Automatic</option><option value="index, follow">Index, follow</option><option value="noindex, follow">Noindex, follow</option><option value="noindex, nofollow">Noindex, nofollow</option>
      </select></label>
      <p className="text-xs text-muted-foreground">Account, admin and unavailable pages always remain noindex.</p>
      <div className="flex flex-wrap gap-3"><Button onClick={save}>{busy ? 'Saving...' : 'Save SEO'}</Button><Button variant="outline" onClick={() => setValues({})}>Clear overrides (then Save)</Button></div>
    </fieldset>
    {message && <p role="status" className="text-sm text-primary">{message}</p>}
    {!!loadedPath && <div className="rounded-lg bg-background p-4 text-sm space-y-2 break-words"><p className="font-semibold">Current saved metadata for {loadedPath}</p><p>{resolved.title}</p><p className="text-muted-foreground">{resolved.description}</p><p>{resolved.canonical}</p></div>}
  </section>;
}
