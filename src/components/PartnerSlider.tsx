import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Partner } from './PartnersEditor';

export default function PartnerSlider() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [paused, setPaused] = useState(false);
  const interacting = useRef(false);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    apiFetch('/api/partners', { signal: controller.signal }).then(r => r.ok ? r.json() : []).then(setPartners).catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (paused || partners.length < 2) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer = window.setInterval(() => {
      const el = track.current;
      if (!el || motion.matches || interacting.current || document.hidden || el.scrollWidth <= el.clientWidth) return;
      el.scrollTo({ left: el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 ? 0 : el.scrollLeft + 224, behavior: 'smooth' });
    }, 3000);
    return () => window.clearInterval(timer);
  }, [paused, partners.length]);
  if (!partners.length) return null;
  return <section aria-label="Our partners" className="bg-card border-t border-white/10 py-8">
    <div className="container mx-auto px-4 md:px-6">
      <div className="flex items-center justify-between gap-4 mb-5"><h2 className="font-serif text-xl font-bold text-white">Our Partners</h2>
        {partners.length > 1 && <button type="button" aria-pressed={paused} onClick={() => setPaused(p => !p)} className="text-sm text-primary underline underline-offset-4">{paused ? 'Resume scrolling' : 'Pause scrolling'}</button>}
      </div>
      <div ref={track} tabIndex={0} aria-label="Partner links; scroll to explore" className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-3"
        onMouseEnter={() => { interacting.current = true; }} onMouseLeave={() => { interacting.current = false; }}
        onFocusCapture={() => { interacting.current = true; }} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) interacting.current = false; }}
        onTouchStart={() => setPaused(true)}>
        {partners.map(p => <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="shrink-0 snap-start w-[200px] h-28 flex items-center justify-center bg-white rounded-xl p-4 focus-visible:outline-2 focus-visible:outline-primary">
          <img src={`/api/partners/${p.id}/image`} alt={p.alt} loading="lazy" className="max-w-full max-h-full object-contain" />
        </a>)}
      </div>
    </div>
  </section>;
}
