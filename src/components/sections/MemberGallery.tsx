import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PROFILES = [
  { initials: 'P', gradient: 'from-rose-500 to-pink-700', city: 'Mumbai', age: 32 },
  { initials: 'A', gradient: 'from-violet-500 to-purple-700', city: 'Delhi', age: 28 },
  { initials: 'S', gradient: 'from-blue-500 to-indigo-700', city: 'Bangalore', age: 35 },
  { initials: 'M', gradient: 'from-emerald-500 to-teal-700', city: 'Chennai', age: 30 },
  { initials: 'R', gradient: 'from-amber-500 to-orange-600', city: 'Hyderabad', age: 27 },
  { initials: 'N', gradient: 'from-cyan-500 to-sky-700', city: 'Pune', age: 33 },
  { initials: 'K', gradient: 'from-fuchsia-500 to-pink-700', city: 'Kolkata', age: 29 },
  { initials: 'D', gradient: 'from-lime-500 to-green-700', city: 'Ahmedabad', age: 31 },
];

export function MemberGallery() {
  return (
    <section id="gallery" className="py-20 bg-background border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Women <span className="text-gradient-gold">Looking For You</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Register to unlock full profiles and start connecting.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {PROFILES.map((p, i) => (
            <div key={i} className="bg-card rounded-xl border border-white/10 overflow-hidden group">
              <div className={`h-40 bg-gradient-to-br ${p.gradient} flex items-center justify-center relative`}>
                <span className="text-5xl font-bold text-white/80">{p.initials}</span>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-white font-medium text-sm">{p.city}</p>
                <p className="text-muted-foreground text-xs">{p.age} years • Verified</p>
                <Button size="sm" className="w-full mt-3 h-8 text-xs" onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}>
                  Unlock Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
