import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EARNINGS = [
  { tier: "Part-Time", amount: "₹20,000", hours: "Weekends only", desc: "2–4 meetings/month — great for students & professionals with jobs", featured: false },
  { tier: "Regular", amount: "₹60,000", hours: "3–4 days/week", desc: "8–12 meetings/month — popular tier with steady income", featured: false },
  { tier: "Full-Time", amount: "₹1,20,000", hours: "Dedicated daily", desc: "Priority placement in search, top women pick you first", featured: true },
  { tier: "Elite VIP", amount: "₹2,00,000+", hours: "Exclusive HNI Clients", desc: "High net-worth women, luxury outings, travel companionship", featured: false },
];

export function EarningsOpportunity() {
  return (
    <section className="py-24 relative overflow-hidden bg-background border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-background to-background pointer-events-none"></div>
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-gold opacity-[0.03] transform skew-x-12 translate-x-32 pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <div className="inline-block rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
              💰 Life-Changing Income Opportunity
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              Earn <span className="text-primary">₹20,000 to ₹2,00,000</span> Per Month Doing Gigolo Job
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Why struggle with a 9-to-5 when real women in your city are <strong className="text-white">willing to pay you</strong> for your company? Thousands of Indian men are already earning this way — flexible, discreet, and genuinely enjoyable.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                "No experience required — just be presentable & confident",
                "You choose which women to meet & when",
                "Work locally in your city or accept travel assignments",
                "Zero investment — registration is 100% free",
                "Real cash payments — no delays, no commissions",
                "Complete identity protection at all times",
              ].map((point, i) => (
                <li key={i} className="flex items-center text-white">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {point}
                </li>
              ))}
            </ul>

            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 h-14 w-full md:w-auto font-bold" asChild>
              <a href="#register">Apply for Gigolo Job — Free <ArrowRight className="ml-2 w-5 h-5" /></a>
            </Button>
          </div>

          <div className="lg:w-1/2 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EARNINGS.map((tier, index) => (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl border ${
                  tier.featured
                    ? 'bg-gradient-to-br from-[#2A2410] to-card border-primary/50 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative transform sm:-translate-y-2'
                    : 'bg-card border-white/10'
                }`}
              >
                {tier.featured && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
                    Most Chosen
                  </div>
                )}
                <h4 className="text-white/60 font-medium mb-2 uppercase tracking-wide text-sm">{tier.tier}</h4>
                <div className="text-3xl font-bold text-primary mb-1">{tier.amount}</div>
                <div className="text-sm text-white font-medium mb-4">/ month</div>
                <div className="text-sm text-muted-foreground mb-4 border-b border-white/10 pb-4">{tier.hours}</div>
                <p className="text-xs text-gray-400">{tier.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
