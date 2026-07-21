import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Heart, X, Clock, Check, RotateCcw, Frown } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';

type Woman = {
  id: number;
  name: string;
  age: number;
  city: string;
  state: string;
  bio: string;
  photo_url: string;
};

type HistoryItem = Woman & { action: 'like' | 'pass'; swiped_at: string };

// ── Single swipeable card ──────────────────────────────────────────────────
function SwipeCard({
  woman,
  isTop,
  stackIndex,
  onSwipe,
}: {
  woman: Woman;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (id: number, action: 'like' | 'pass') => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const dragging = useRef(false);
  const animating = useRef(false);

  const applyTransform = (dx: number, isFlying = false) => {
    const el = cardRef.current;
    if (!el) return;
    const rotate = dx * 0.12;
    el.style.transition = isFlying ? 'transform 0.35s ease-out, opacity 0.35s ease-out' : 'none';
    el.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`;
    el.style.opacity = isFlying ? '0' : '1';
    // overlay visibility
    const yes = el.querySelector<HTMLElement>('.swipe-yes');
    const no = el.querySelector<HTMLElement>('.swipe-no');
    if (yes) yes.style.opacity = dx > 20 ? Math.min((dx - 20) / 80, 1).toFixed(2) : '0';
    if (no) no.style.opacity = dx < -20 ? Math.min((-dx - 20) / 80, 1).toFixed(2) : '0';
  };

  const resetCard = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.4s spring(200 20 0 0)';
    el.style.transform = 'translateX(0) rotate(0deg)';
    el.style.opacity = '1';
    const yes = el.querySelector<HTMLElement>('.swipe-yes');
    const no = el.querySelector<HTMLElement>('.swipe-no');
    if (yes) yes.style.opacity = '0';
    if (no) no.style.opacity = '0';
  };

  const flyOut = (direction: 'like' | 'pass') => {
    if (animating.current) return;
    animating.current = true;
    const dx = direction === 'like' ? 800 : -800;
    applyTransform(dx, true);
    setTimeout(() => onSwipe(woman.id, direction), 350);
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!isTop || animating.current) return;
    dragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    currentX.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [isTop]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    currentX.current = dx;
    applyTransform(dx);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = currentX.current;
    if (dx > 90) {
      flyOut('like');
    } else if (dx < -90) {
      flyOut('pass');
    } else {
      resetCard();
    }
  }, []);

  // expose flyOut via ref for button triggers
  (cardRef as any)._flyOut = flyOut;

  const scale = 1 - stackIndex * 0.04;
  const translateY = stackIndex * 12;

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        transform: `scale(${scale}) translateY(${translateY}px)`,
        zIndex: 20 - stackIndex,
        transformOrigin: 'center bottom',
      }}
    >
      <div
        ref={cardRef}
        className="w-full rounded-3xl overflow-hidden border border-white/10 select-none cursor-grab active:cursor-grabbing"
        style={{ height: 440, background: '#111', willChange: 'transform' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <img
          src={woman.photo_url}
          alt={woman.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Swipe overlays */}
        <div className="swipe-yes absolute top-8 left-6 opacity-0 transition-none rotate-[-20deg]">
          <span className="border-4 border-green-400 text-green-400 font-black text-2xl px-4 py-1.5 rounded-2xl uppercase tracking-widest bg-black/30">
            Request
          </span>
        </div>
        <div className="swipe-no absolute top-8 right-6 opacity-0 transition-none rotate-[20deg]">
          <span className="border-4 border-red-400 text-red-400 font-black text-2xl px-4 py-1.5 rounded-2xl uppercase tracking-widest bg-black/30">
            Pass
          </span>
        </div>

        {/* Info gradient */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-20 pb-5 px-5 pointer-events-none">
          <h3 className="text-white font-bold text-2xl leading-tight">
            {woman.name}<span className="font-normal text-xl">, {woman.age}</span>
          </h3>
          <div className="flex items-center gap-1 mt-1 mb-2">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-primary text-sm font-medium">{woman.city}, {woman.state}</span>
          </div>
          <p className="text-white/80 text-sm leading-snug line-clamp-2">{woman.bio}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function WomenTab() {
  const [women, setWomen] = useState<Woman[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [subTab, setSubTab] = useState<'swipe' | 'history'>('swipe');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'like' | 'pass'>('all');
  const [loading, setLoading] = useState(true);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [wRes, hRes] = await Promise.all([
      apiFetch('/api/user/women', { credentials: 'include' }),
      apiFetch('/api/user/swipe-history', { credentials: 'include' }),
    ]);
    if (wRes.ok) setWomen(await wRes.json());
    if (hRes.ok) setHistory(await hRes.json());
    setLoading(false);
  };

  const handleSwipe = async (womanId: number, action: 'like' | 'pass') => {
    await apiFetch('/api/user/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ woman_id: womanId, action }),
      credentials: 'include',
    });
    setWomen(prev => prev.filter(w => w.id !== womanId));
    const w = women.find(w => w.id === womanId);
    if (w) {
      setHistory(prev => [{ ...w, action, swiped_at: new Date().toISOString() }, ...prev]);
    }
  };

  const triggerButtonSwipe = (action: 'like' | 'pass') => {
    if (women.length === 0) return;
    const top = women[women.length - 1];
    const el = cardRefs.current[top.id] as any;
    if (el?._flyOut) el._flyOut(action);
  };

  const filteredHistory = historyFilter === 'all' ? history : history.filter(h => h.action === historyFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sub-tab pills */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubTab('swipe')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${subTab === 'swipe' ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
        >
          <Heart className="w-3.5 h-3.5" />
          Discover
          {women.length > 0 && (
            <span className={`rounded-full px-1.5 text-xs ${subTab === 'swipe' ? 'bg-black/30' : 'bg-primary/20 text-primary'}`}>{women.length}</span>
          )}
        </button>
        <button
          onClick={() => setSubTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${subTab === 'history' ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
        >
          <Clock className="w-3.5 h-3.5" />
          History
          {history.length > 0 && (
            <span className={`rounded-full px-1.5 text-xs ${subTab === 'history' ? 'bg-black/30' : 'bg-primary/20 text-primary'}`}>{history.length}</span>
          )}
        </button>
      </div>

      {/* ── Swipe Tab ──────────────────────────────────────────────────────── */}
      {subTab === 'swipe' && (
        <div>
          {women.length === 0 ? (
            <div className="bg-card border border-white/10 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Frown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-white font-bold text-lg">You've seen everyone!</h3>
              <p className="text-muted-foreground text-sm mt-2 mb-6">New women profiles are added regularly. Check back soon.</p>
              <Button onClick={fetchData} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {/* Card stack */}
              <div className="relative w-full max-w-sm mx-auto" style={{ height: 460 }}>
                {women.slice(-4).map((woman, i, arr) => {
                  const isTop = i === arr.length - 1;
                  const stackIndex = arr.length - 1 - i;
                  return (
                    <SwipeCard
                      key={woman.id}
                      woman={woman}
                      isTop={isTop}
                      stackIndex={stackIndex}
                      onSwipe={handleSwipe}
                    />
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-8">
                <button
                  onClick={() => triggerButtonSwipe('pass')}
                  className="w-14 h-14 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500 transition-all active:scale-90"
                  title="Pass"
                >
                  <X className="w-6 h-6 text-red-400" />
                </button>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">{women.length} left</p>
                </div>
                <button
                  onClick={() => triggerButtonSwipe('like')}
                  className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/60 flex items-center justify-center hover:bg-primary/20 hover:border-primary transition-all active:scale-90 shadow-lg shadow-primary/20"
                  title="Request Meetup"
                >
                  <Heart className="w-7 h-7 text-primary fill-primary" />
                </button>
              </div>

              <p className="text-muted-foreground text-xs text-center -mt-4">
                Drag <span className="text-green-400 font-medium">right</span> or tap ♥ to request · Drag <span className="text-red-400 font-medium">left</span> or tap ✕ to pass
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── History Tab ────────────────────────────────────────────────────── */}
      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { val: 'all' as const, label: 'All' },
              { val: 'like' as const, label: '♥ Requested' },
              { val: 'pass' as const, label: '✕ Passed' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setHistoryFilter(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  historyFilter === val
                    ? 'bg-primary text-black'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}
              >
                {label}
                {val !== 'all' && (
                  <span className="ml-1.5 opacity-60">{history.filter(h => h.action === val).length}</span>
                )}
              </button>
            ))}
          </div>

          {filteredHistory.length === 0 ? (
            <div className="bg-card border border-white/10 rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                {historyFilter === 'all' ? "You haven't swiped anyone yet." : historyFilter === 'like' ? 'No requested profiles yet.' : 'No passed profiles yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredHistory.map((w, idx) => (
                <div key={`${w.id}-${idx}`} className="bg-card border border-white/10 rounded-xl overflow-hidden flex gap-3 p-3">
                  <img src={w.photo_url} alt={w.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white font-semibold text-sm">{w.name}, {w.age}</p>
                        <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />{w.city}
                        </p>
                      </div>
                      <span className={`shrink-0 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${
                        w.action === 'like'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {w.action === 'like'
                          ? <><Check className="w-3 h-3" />Requested</>
                          : <><X className="w-3 h-3" />Passed</>
                        }
                      </span>
                    </div>
                    <p className="text-white/60 text-xs mt-1 line-clamp-1">{w.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
