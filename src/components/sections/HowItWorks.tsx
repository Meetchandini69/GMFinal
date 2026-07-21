import React, { useState } from 'react';
import { UserPlus, CheckCircle, MessageCircle, Star } from 'lucide-react';

const GIGOLO_STEPS = [
  { icon: UserPlus, title: 'Register Free', desc: 'Fill your basic details and submit the registration form. Takes 2 minutes.' },
  { icon: CheckCircle, title: 'Profile Activated', desc: 'Our team reviews and activates your profile within 24 hours. Login credentials sent to your mobile.' },
  { icon: MessageCircle, title: 'Get Requests', desc: 'Women in your city send you meeting requests directly through the platform.' },
  { icon: Star, title: 'Earn & Grow', desc: 'Complete meetings, earn ₹5,000–₹20,000 per session, and build your rating.' },
];

const WOMEN_STEPS = [
  { icon: UserPlus, title: 'Browse Profiles', desc: 'Explore verified male profiles in your city with detailed info and photos.' },
  { icon: MessageCircle, title: 'Select & Request', desc: 'Choose a companion that matches your preference and send a meeting request.' },
  { icon: CheckCircle, title: 'Confirm Meeting', desc: 'Agree on time, place, and terms directly with your chosen companion.' },
  { icon: Star, title: 'Enjoy & Rate', desc: 'Have a safe, discreet meeting and rate your experience afterward.' },
];

export function HowItWorks() {
  const [tab, setTab] = useState<'gigolo' | 'women'>('gigolo');

  return (
    <section id="how-it-works" className="py-20 bg-card border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
        </div>
        <div className="flex justify-center mb-10 gap-2">
          {(['gigolo', 'women'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${tab === t ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
            >
              {t === 'gigolo' ? 'For Gigolos' : 'For Women'}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {(tab === 'gigolo' ? GIGOLO_STEPS : WOMEN_STEPS).map((step, i) => (
            <div key={i} className="text-center p-6 bg-background rounded-xl border border-white/10">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-primary font-bold text-sm mb-1">Step {i + 1}</div>
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
