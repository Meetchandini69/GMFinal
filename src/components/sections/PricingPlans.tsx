import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANS = [
  {
    name: "1 Month",
    price: "Rs. 2,500",
    period: "/ month",
    description: "Short-term membership plan.",
    features: [
      { text: "Create your public profile", included: true },
      { text: "Appear in city search results", included: true },
      { text: "Receive connection requests", included: true },
      { text: "Valid for 1 month", included: true },
    ],
    buttonText: "Choose 1 Month",
    buttonVariant: "outline",
    featured: false,
    badge: null,
  },
  {
    name: "2 Months",
    price: "Rs. 4,000",
    period: "/ 2 months",
    description: "Better value for two months.",
    features: [
      { text: "Create your public profile", included: true },
      { text: "Appear in city search results", included: true },
      { text: "Receive connection requests", included: true },
      { text: "Valid for 2 months", included: true },
    ],
    buttonText: "Choose 2 Months",
    buttonVariant: "default",
    featured: true,
    badge: "Popular",
  },
  {
    name: "6 Months",
    price: "Rs. 9,000",
    period: "/ 6 months",
    description: "Longer plan with stronger savings.",
    features: [
      { text: "Create your public profile", included: true },
      { text: "Appear in city search results", included: true },
      { text: "Receive connection requests", included: true },
      { text: "Valid for 6 months", included: true },
    ],
    buttonText: "Choose 6 Months",
    buttonVariant: "outline",
    featured: false,
    badge: null,
  },
  {
    name: "1 Year",
    price: "Rs. 12,000",
    period: "/ year",
    description: "Best value annual membership.",
    features: [
      { text: "Create your public profile", included: true },
      { text: "Appear in city search results", included: true },
      { text: "Receive connection requests", included: true },
      { text: "Valid for 1 year", included: true },
    ],
    buttonText: "Choose 1 Year",
    buttonVariant: "outline",
    featured: false,
    badge: "Best Value",
  },
];

export function PricingPlans() {
  return (
    <section className="py-24 bg-card" id="pricing">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Choose Your <span className="text-primary">Gigolo Membership</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the membership duration that works best for you and complete your profile after registration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 relative flex flex-col ${
                plan.featured
                  ? 'bg-background border-2 border-primary shadow-[0_0_40px_rgba(212,175,55,0.15)] transform md:-translate-y-4'
                  : 'bg-background border border-white/10'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-muted-foreground mb-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-primary mr-3 shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 mr-3 shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-300' : 'text-muted-foreground/50'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-12 font-semibold ${
                  plan.featured
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-primary/50 text-white hover:bg-primary/10'
                }`}
                variant={plan.buttonVariant as any}
                asChild
              >
                <a href="#register">{plan.buttonText}</a>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8">
          Complete registration first, then choose any one membership plan from your dashboard.
        </p>
      </div>
    </section>
  );
}
