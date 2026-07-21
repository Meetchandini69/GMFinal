import React from 'react';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "I was earning ₹18,000/month at my office job. After joining Gigolomeet.in I made ₹65,000 my first month. The women are real, respectful, and generous. Best decision of my life.",
    name: "Rohit K.",
    city: "Mumbai",
    earning: "₹65,000 first month",
    initial: "R",
    color: "from-amber-500 to-orange-600",
  },
  {
    quote: "I was nervous but the process was so smooth. Within 3 days of registering I had my first meeting request. The lady was sweet, paid on time, and already booked me again. It's crazy how easy it is.",
    name: "Arjun S.",
    city: "Delhi",
    earning: "4 meetings in Week 1",
    initial: "A",
    color: "from-blue-500 to-indigo-700",
  },
  {
    quote: "As a gym trainer I had good looks but zero income from it. Now I do 6–8 meets per month through this platform, each paying ₹8,000–₹15,000. I quit my day job and I'm not looking back.",
    name: "Vikram T.",
    city: "Bangalore",
    earning: "₹90,000 last month",
    initial: "V",
    color: "from-emerald-500 to-teal-700",
  },
  {
    quote: "The women I've met through here are lonely, genuine, and very thankful for good company. One divorced lady became a regular client. She pays me ₹12,000 per visit and we enjoy great times.",
    name: "Suresh P.",
    city: "Hyderabad",
    earning: "1 regular client ₹48K/mo",
    initial: "S",
    color: "from-rose-500 to-pink-700",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-background overflow-hidden relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Real Men, <span className="text-primary">Real Earnings</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These are genuine success stories from men who joined Gigolomeet.in and transformed their income and social life. Names abbreviated for privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t, index) => (
            <div
              key={index}
              className="bg-card border border-white/5 p-8 rounded-2xl relative group hover:border-primary/30 transition-colors flex flex-col"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-white/5 group-hover:text-primary/10 transition-colors" />

              <div className="flex text-primary mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-gray-300 italic mb-6 relative z-10 text-sm leading-relaxed flex-1">
                "{t.quote}"
              </p>

              {/* Earning highlight */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 mb-5 text-center">
                <span className="text-primary text-xs font-bold">💰 {t.earning}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.initial}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
