import React from 'react';
import { MapPin } from 'lucide-react';

const CITIES = [
  { name: 'Mumbai', count: '428' },
  { name: 'Delhi', count: '391' },
  { name: 'Bangalore', count: '312' },
  { name: 'Chennai', count: '287' },
  { name: 'Hyderabad', count: '256' },
  { name: 'Pune', count: '198' },
  { name: 'Kolkata', count: '176' },
  { name: 'Ahmedabad', count: '154' },
  { name: 'Coimbatore', count: '132' },
  { name: 'Jaipur', count: '119' },
  { name: 'Surat', count: '98' },
  { name: 'Lucknow', count: '87' },
];

export function CitiesCoverage() {
  return (
    <section className="py-20 bg-card border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Active in <span className="text-gradient-gold">12+ Cities</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Find women clients in your city and start earning from day one.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CITIES.map((city) => (
            <div key={city.name} className="bg-background rounded-xl border border-white/10 p-4 text-center hover:border-primary/50 transition-colors">
              <MapPin className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-white font-semibold text-sm">{city.name}</p>
              <p className="text-muted-foreground text-xs">{city.count}+ members</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
