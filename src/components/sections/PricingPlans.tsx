import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANS = [
  {
    name: 'CL Plan',
    price: '₹5,000',
    period: 'per month',
    validity: '30 Days',
    features: [
      '7 Services per month',
      'Rate ₹4,000–₹8,000 per meeting',
      'Min 2 hrs service',
      'Day timings only',
      'Middle class clients',
      'Age 25–55',
    ],
    highlight: false,
  },
  {
    name: 'PL Plan',
    price: '₹10,000',
    period: 'per year',
    validity: '365 Days',
    features: [
      '10 Services per month',
      'Rate ₹5,000–₹18,000 per meeting',
      'Min 2 hrs, max 24 hrs',
      'Day & Night, any time',
      'High class clients',
      'Age 28–45',
    ],
    highlight: true,
  },
];

export function PricingPlans() {
  return (
    <section id="pricing" className="py-20 bg-card border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Membership <span className="text-gradient-gold">Plans</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Choose your plan. Once selected, upgrades are not possible — choose wisely.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`rounded-xl border p-8 ${plan.highlight ? 'border-primary/60 bg-primary/5 shadow-[0_0_40px_rgba(212,175,55,0.1)]' : 'border-white/10 bg-background'}`}>
              {plan.highlight && (
                <span className="inline-block bg-primary text-black text-xs font-bold px-3 py-1 rounded-full mb-4">Recommended</span>
              )}
              <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
              <div className="mb-1">
                <span className="text-primary text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6">Validity: {plan.validity}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.highlight ? 'bg-primary text-black gold-glow' : 'bg-white/10 text-white hover:bg-white/20'}`}
                onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Join {plan.name}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-muted-foreground text-xs mt-8">
          We accept UPI payment via PhonePe, Google Pay (GPay), PayTM, Bhim App. No security deposits or hidden charges.
        </p>
      </div>
    </section>
  );
}
