import React from 'react';
import { IndianRupee } from 'lucide-react';

const TIERS = [
  { label: 'Starter', range: '₹20,000–₹40,000', meetings: '4–8 meetings/month', color: 'from-gray-600 to-gray-800' },
  { label: 'Regular', range: '₹40,000–₹80,000', meetings: '8–15 meetings/month', color: 'from-amber-700 to-yellow-600' },
  { label: 'Premium', range: '₹80,000–₹1,50,000', meetings: '15–25 meetings/month', color: 'from-yellow-500 to-amber-400' },
  { label: 'Elite', range: '₹1,50,000–₹2,00,000+', meetings: '25+ meetings/month', color: 'from-primary to-yellow-300' },
];

export function EarningsOpportunity() {
  return (
    <section className="py-20 bg-background border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Your <span className="text-gradient-gold">Earning Potential</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Earnings grow with your rating and activity level.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {TIERS.map((tier, i) => (
            <div key={i} className="bg-card rounded-xl border border-white/10 overflow-hidden hover:border-primary/40 transition-colors">
              <div className={`h-2 bg-gradient-to-r ${tier.color}`} />
              <div className="p-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <IndianRupee className="w-5 h-5 text-primary" />
                </div>
                <p className="text-primary font-bold text-xs mb-1">{tier.label}</p>
                <p className="text-white font-bold text-lg mb-2">{tier.range}</p>
                <p className="text-muted-foreground text-sm">{tier.meetings}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
