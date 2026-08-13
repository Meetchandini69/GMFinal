import React, { useEffect, useState } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { ChevronDown, X, Save, ArrowLeft, ExternalLink, Globe, LayoutTemplate } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RICH_TEXT_QUILL_MODULES } from '@/lib/quillConfig';
import type { PageSections, SectionFeature, SectionPlan, SectionFaq, SectionGuideBlock } from '@/lib/locationSections';

type LocationStat = { label: string; value: string };

type BuilderPage = {
  id: number;
  slug: string;
  source_slug?: string | null;
  title: string;
  city: string;
  state: string;
  nickname: string;
  hero_description: string;
  meta_description: string;
  stats: LocationStat[];
  areas: string[];
  sections: PageSections;
  is_active: boolean;
};

// ── Field primitives ─────────────────────────────────────────────────────

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-10 bg-background border-white/10 text-white" />
    </div>
  );
}

function RichField({ label, value, onChange }: { label: string; value: string; onChange: (html: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      <div className="admin-quill">
        <ReactQuill theme="snow" value={value} onChange={onChange} modules={RICH_TEXT_QUILL_MODULES} />
      </div>
    </div>
  );
}

// ── Repeatable items editor (features, plans, faqs, guide blocks) ──────────

type ItemFieldSpec = { key: string; label: string; type: 'text' | 'textarea' | 'rich' };

function ItemsEditor<T extends Record<string, string>>({
  label, items, fields, max, emptyItem, onChange,
}: {
  label: string;
  items: T[];
  fields: ItemFieldSpec[];
  max: number;
  emptyItem: T;
  onChange: (items: T[]) => void;
}) {
  const updateItem = (index: number, key: string, value: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));
  const addItem = () => { if (items.length < max) onChange([...items, { ...emptyItem }]); };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
        {items.length < max && (
          <button type="button" onClick={addItem} className="text-xs text-primary hover:text-white">+ Add ({items.length}/{max})</button>
        )}
      </div>
      {items.length === 0 && (
        <p className="text-muted-foreground text-xs italic mb-2">Using the default content shown on the live page. Click "+ Add" to override it.</p>
      )}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="bg-background border border-white/10 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">#{index + 1}</span>
              <button type="button" onClick={() => removeItem(index)} className="text-muted-foreground hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
            </div>
            {fields.map(field => (
              field.type === 'textarea' ? (
                <Textarea key={field.key} value={item[field.key] || ''} onChange={e => updateItem(index, field.key, e.target.value)} placeholder={field.label} className="bg-card border-white/10 text-white text-sm min-h-[60px]" />
              ) : field.type === 'rich' ? (
                <div key={field.key} className="admin-quill">
                  <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{field.label}</label>
                  <ReactQuill theme="snow" value={item[field.key] || ''} onChange={html => updateItem(index, field.key, html)} modules={RICH_TEXT_QUILL_MODULES} />
                </div>
              ) : (
                <Input key={field.key} value={item[field.key] || ''} onChange={e => updateItem(index, field.key, e.target.value)} placeholder={field.label} className="h-9 bg-card border-white/10 text-white text-sm" />
              )
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StringListEditor({ label, items, max, onChange }: { label: string; items: string[]; max: number; onChange: (items: string[]) => void }) {
  const update = (index: number, value: string) => onChange(items.map((v, i) => (i === index ? value : v)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const add = () => { if (items.length < max) onChange([...items, '']); };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
        {items.length < max && <button type="button" onClick={add} className="text-xs text-primary hover:text-white">+ Add ({items.length}/{max})</button>}
      </div>
      {items.length === 0 && <p className="text-muted-foreground text-xs italic mb-2">Using the default list shown on the live page. Click "+ Add" to override it.</p>}
      <div className="space-y-2">
        {items.map((value, index) => (
          <div key={index} className="flex gap-2">
            <Input value={value} onChange={e => update(index, e.target.value)} className="h-9 bg-background border-white/10 text-white text-sm" />
            <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-red-400 px-2"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Collapsible section card ────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-5 text-left">
        <div className="min-w-0">
          <h3 className="text-white font-semibold truncate">{title}</h3>
          {subtitle && <p className="text-muted-foreground text-xs mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 ml-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-5 pt-0 space-y-4 border-t border-white/10">{children}</div>}
    </div>
  );
}

const FEATURE_FIELDS: ItemFieldSpec[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
];
const EMPTY_FEATURE: SectionFeature = { title: '', description: '' };

const PLAN_FIELDS: ItemFieldSpec[] = [
  { key: 'type', label: 'Type', type: 'text' },
  { key: 'range', label: 'Price range (e.g. ₹5,000 – ₹15,000)', type: 'text' },
  { key: 'per', label: 'Per (e.g. per event)', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
];
const EMPTY_PLAN: SectionPlan = { type: '', range: '', per: '', description: '' };

const FAQ_FIELDS: ItemFieldSpec[] = [
  { key: 'question', label: 'Question', type: 'text' },
  { key: 'answer', label: 'Answer', type: 'textarea' },
];
const EMPTY_FAQ: SectionFaq = { question: '', answer: '' };

const GUIDE_FIELDS: ItemFieldSpec[] = [
  { key: 'title', label: 'Block title', type: 'text' },
  { key: 'body', label: 'Body', type: 'rich' },
];
const EMPTY_GUIDE_BLOCK: SectionGuideBlock = { title: '', body: '' };

export default function AdminPageBuilder() {
  const [, params] = useRoute('/admin/builder/:id');
  const [, navigate] = useLocation();
  const [page, setPage] = useState<BuilderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    setLoading(true);
    apiFetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(async d => {
        if (d.role !== 'admin') { navigate('/admin'); return; }
        const res = await apiFetch(`/api/admin/location-pages/${id}`, { credentials: 'include' });
        if (!res.ok) { setNotFound(true); return; }
        setPage(await res.json());
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const setSections = (updater: (prev: PageSections) => PageSections) => {
    setPage(prev => (prev ? { ...prev, sections: updater(prev.sections || {}) } : prev));
  };

  const save = async () => {
    if (!page) return;
    setSaving(true);
    setError('');
    setSavedMsg('');
    try {
      const res = await apiFetch(`/api/admin/location-pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(page),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setPage(data);
      setSavedMsg('Saved.');
    } catch (err: any) {
      setError(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <Globe className="w-12 h-12 text-primary mb-5" />
        <h1 className="text-2xl font-serif font-bold text-white mb-3">Page not found</h1>
        <Link href="/admin"><Button className="bg-primary text-black font-bold">Back to Admin</Button></Link>
      </div>
    );
  }

  const s = page.sections || {};
  const city = page.city;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <LayoutTemplate className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="text-white font-bold truncate">Page Builder — {page.title}</h1>
              <p className="text-muted-foreground text-xs">/{page.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/admin"><Button variant="outline" size="sm"><ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Admin</Button></Link>
            {page.is_active && (
              <a href={`/${page.slug}`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm"><ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View live</Button>
              </a>
            )}
            {savedMsg && <span className="text-green-400 text-xs">{savedMsg}</span>}
            <Button size="sm" className="bg-primary text-black font-bold" onClick={save} disabled={saving}>
              <Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl space-y-4">
        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

        <SectionCard title="Hero" subtitle="Top of page — headline and intro paragraph">
          <RichField label="Hero description" value={page.hero_description} onChange={html => setPage(prev => prev && { ...prev, hero_description: html })} />
        </SectionCard>

        <SectionCard title={`Understanding Companionship in ${city}`} subtitle="Overview section">
          <TextField label="Heading" value={s.overview?.heading || ''} placeholder={`Understanding Companionship in ${city}`} onChange={v => setSections(sec => ({ ...sec, overview: { ...sec.overview, heading: v } }))} />
          <RichField label="Intro paragraph" value={s.overview?.intro || ''} onChange={html => setSections(sec => ({ ...sec, overview: { ...sec.overview, intro: html } }))} />
          <RichField label="Body paragraph 1" value={s.overview?.body1 || ''} onChange={html => setSections(sec => ({ ...sec, overview: { ...sec.overview, body1: html } }))} />
          <RichField label="Body paragraph 2" value={s.overview?.body2 || ''} onChange={html => setSections(sec => ({ ...sec, overview: { ...sec.overview, body2: html } }))} />
          <ItemsEditor label="Feature cards" items={s.overview?.features || []} fields={FEATURE_FIELDS} max={4} emptyItem={EMPTY_FEATURE}
            onChange={items => setSections(sec => ({ ...sec, overview: { ...sec.overview, features: items } }))} />
        </SectionCard>

        <SectionCard title={`Members in ${city}`} subtitle="Member gallery section">
          <TextField label="Heading" value={s.gallery?.heading || ''} placeholder={`Members in ${city}`} onChange={v => setSections(sec => ({ ...sec, gallery: { ...sec.gallery, heading: v } }))} />
          <RichField label="Intro paragraph" value={s.gallery?.intro || ''} onChange={html => setSections(sec => ({ ...sec, gallery: { ...sec.gallery, intro: html } }))} />
        </SectionCard>

        <SectionCard title={`Why Choose Gigolomeet.in in ${city}?`} subtitle="Why choose us section">
          <TextField label="Heading" value={s.whyChooseUs?.heading || ''} placeholder={`Why Choose Gigolomeet.in in ${city}?`} onChange={v => setSections(sec => ({ ...sec, whyChooseUs: { ...sec.whyChooseUs, heading: v } }))} />
          <RichField label="Intro paragraph" value={s.whyChooseUs?.intro || ''} onChange={html => setSections(sec => ({ ...sec, whyChooseUs: { ...sec.whyChooseUs, intro: html } }))} />
          <ItemsEditor label="Feature cards" items={s.whyChooseUs?.features || []} fields={FEATURE_FIELDS} max={4} emptyItem={EMPTY_FEATURE}
            onChange={items => setSections(sec => ({ ...sec, whyChooseUs: { ...sec.whyChooseUs, features: items } }))} />
        </SectionCard>

        <SectionCard title={`Benefits of Companionship Jobs in ${city}`} subtitle="Earnings and benefits section">
          <TextField label="Heading" value={s.benefits?.heading || ''} placeholder={`Benefits of Companionship Jobs in ${city}`} onChange={v => setSections(sec => ({ ...sec, benefits: { ...sec.benefits, heading: v } }))} />
          <RichField label="Intro paragraph" value={s.benefits?.intro || ''} onChange={html => setSections(sec => ({ ...sec, benefits: { ...sec.benefits, intro: html } }))} />
          <ItemsEditor label="Pricing cards" items={s.benefits?.plans || []} fields={PLAN_FIELDS} max={3} emptyItem={EMPTY_PLAN}
            onChange={items => setSections(sec => ({ ...sec, benefits: { ...sec.benefits, plans: items } }))} />
          <StringListEditor label="Benefit highlights" items={s.benefits?.highlights || []} max={6}
            onChange={items => setSections(sec => ({ ...sec, benefits: { ...sec.benefits, highlights: items } }))} />
        </SectionCard>

        <SectionCard title={`Local Opportunities in ${city}`} subtitle='"Who are our members?" section'>
          <TextField label="Heading" value={s.opportunities?.heading || ''} placeholder={`Local Opportunities in ${city}`} onChange={v => setSections(sec => ({ ...sec, opportunities: { ...sec.opportunities, heading: v } }))} />
          <RichField label="Intro paragraph" value={s.opportunities?.intro || ''} onChange={html => setSections(sec => ({ ...sec, opportunities: { ...sec.opportunities, intro: html } }))} />
          <ItemsEditor label="Member type cards" items={s.opportunities?.memberTypes || []} fields={FEATURE_FIELDS} max={4} emptyItem={EMPTY_FEATURE}
            onChange={items => setSections(sec => ({ ...sec, opportunities: { ...sec.opportunities, memberTypes: items } }))} />
        </SectionCard>

        <SectionCard title="Trust badges" subtitle="Private & Discreet / Verified Members / Free Registration">
          <ItemsEditor label="Trust badge cards" items={s.trust?.features || []} fields={FEATURE_FIELDS} max={3} emptyItem={EMPTY_FEATURE}
            onChange={items => setSections(sec => ({ ...sec, trust: { features: items } }))} />
        </SectionCard>

        <SectionCard title={`Local Areas in ${city} We Serve`} subtitle="Areas section heading (the area list itself is edited in the Clone/Edit modal)">
          <TextField label="Heading" value={s.areasIntro?.heading || ''} placeholder={`Local Areas in ${city} We Serve`} onChange={v => setSections(sec => ({ ...sec, areasIntro: { ...sec.areasIntro, heading: v } }))} />
          <RichField label="Intro paragraph" value={s.areasIntro?.intro || ''} onChange={html => setSections(sec => ({ ...sec, areasIntro: { ...sec.areasIntro, intro: html } }))} />
        </SectionCard>

        <SectionCard title="Local FAQs" subtitle="Frequently asked questions">
          <TextField label="Heading" value={s.faqs?.heading || ''} placeholder="Local FAQs" onChange={v => setSections(sec => ({ ...sec, faqs: { ...sec.faqs, heading: v } }))} />
          <RichField label="Intro paragraph" value={s.faqs?.intro || ''} onChange={html => setSections(sec => ({ ...sec, faqs: { ...sec.faqs, intro: html } }))} />
          <ItemsEditor label="FAQ items" items={s.faqs?.items || []} fields={FAQ_FIELDS} max={12} emptyItem={EMPTY_FAQ}
            onChange={items => setSections(sec => ({ ...sec, faqs: { ...sec.faqs, items } }))} />
        </SectionCard>

        <SectionCard title={`Companionship Opportunities in ${city} — Complete Guide`} subtitle="SEO guide section (left and right columns)">
          <TextField label="Heading" value={s.guide?.heading || ''} placeholder={`Companionship Opportunities in ${city} — Complete Guide`} onChange={v => setSections(sec => ({ ...sec, guide: { ...sec.guide, heading: v } }))} />
          <ItemsEditor label="Left column blocks" items={s.guide?.leftBlocks || []} fields={GUIDE_FIELDS} max={2} emptyItem={EMPTY_GUIDE_BLOCK}
            onChange={items => setSections(sec => ({ ...sec, guide: { ...sec.guide, leftBlocks: items } }))} />
          <ItemsEditor label="Right column blocks" items={s.guide?.rightBlocks || []} fields={GUIDE_FIELDS} max={2} emptyItem={EMPTY_GUIDE_BLOCK}
            onChange={items => setSections(sec => ({ ...sec, guide: { ...sec.guide, rightBlocks: items } }))} />
        </SectionCard>

        <SectionCard title="Ready to start your journey?" subtitle="Final call-to-action section">
          <TextField label="Heading" value={s.cta?.heading || ''} placeholder="Ready to start your journey?" onChange={v => setSections(sec => ({ ...sec, cta: { ...sec.cta, heading: v } }))} />
          <RichField label="Intro paragraph" value={s.cta?.intro || ''} onChange={html => setSections(sec => ({ ...sec, cta: { ...sec.cta, intro: html } }))} />
        </SectionCard>

        <div className="flex justify-end pb-8">
          <Button size="lg" className="bg-primary text-black font-bold" onClick={save} disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving…' : 'Save all changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
