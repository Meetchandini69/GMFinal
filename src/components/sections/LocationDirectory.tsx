import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { MapPin, ChevronDown, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type DirectoryRow = { slug: string; city: string; state: string | null };
type StateGroup = { state: string; cities: { slug: string; city: string }[] };

export function LocationDirectory() {
  const [groups, setGroups] = useState<StateGroup[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [expandedState, setExpandedState] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/locations/directory')
      .then(res => (res.ok ? res.json() : []))
      .then((rows: DirectoryRow[]) => {
        const byState = new Map<string, { slug: string; city: string }[]>();
        for (const row of rows) {
          const state = (row.state || '').trim() || 'Other';
          if (!byState.has(state)) byState.set(state, []);
          byState.get(state)!.push({ slug: row.slug, city: row.city });
        }
        const result = Array.from(byState.entries())
          .map(([state, cities]) => ({
            state,
            cities: [...cities].sort((a, b) => a.city.localeCompare(b.city)),
          }))
          .sort((a, b) => a.state.localeCompare(b.state));
        setGroups(result);
        if (result.length === 1) setExpandedState(result[0].state);
      })
      .catch(() => setGroups([]))
      .finally(() => setLoaded(true));
  }, []);

  if (loaded && groups.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-3 py-2.5 rounded-l-lg shadow-lg hover:px-4 transition-all"
        aria-label="Browse cities by state"
      >
        <MapPin className="w-3.5 h-3.5" /> Cities
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-40 bg-card border border-white/10 shadow-2xl overflow-y-auto
              max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:h-[75vh] max-md:w-full max-md:rounded-t-2xl
              md:right-0 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-72 md:max-h-[75vh] md:rounded-l-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-card">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <MapPin className="w-4 h-4 text-primary" /> India
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 pb-4">
              {groups.map(group => (
                <div key={group.state} className="border-b border-white/5 last:border-0">
                  <button
                    type="button"
                    onClick={() => setExpandedState(s => (s === group.state ? null : group.state))}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-white hover:text-primary transition-colors"
                  >
                    {group.state}
                    <span className="flex items-center gap-2 text-muted-foreground font-normal text-xs">
                      {group.cities.length}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedState === group.state ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  {expandedState === group.state && (
                    <div className="pb-2">
                      {group.cities.map(c => (
                        <Link
                          key={c.slug}
                          href={`/${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="block px-6 py-1.5 text-sm text-muted-foreground hover:text-primary rounded-md hover:bg-primary/5 transition-colors"
                        >
                          Gigolo Service in {c.city}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
