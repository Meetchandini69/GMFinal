import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, CalendarHeart, FileText, CheckCircle, Wallet } from 'lucide-react';

const GIGOLO_STEPS = [
  {
    icon: UserPlus,
    title: "Register Free in 2 Min",
    description: "Fill a simple form with your name, city, age, and a short bio. No fee, no documents needed to start. Your privacy is guaranteed from day one."
  },
  {
    icon: CheckCircle,
    title: "Get Verified & Go Live",
    description: "Complete a quick ID check and get your ✅ Verified badge within 24 hours. Your profile then appears in search results for women in your city."
  },
  {
    icon: Wallet,
    title: "Receive Requests & Earn",
    description: "Women contact you directly. Agree on meeting details, have a great time, and collect your payment. Earn ₹5,000–₹20,000 per meeting."
  }
];

const WOMEN_STEPS = [
  {
    icon: FileText,
    title: "Browse Gigolo Profiles",
    description: "Search hundreds of verified, charming men by city, age, and personality type. View photos and read their bios to find your perfect match."
  },
  {
    icon: Search,
    title: "Send a Connection Request",
    description: "Found someone you like? Send him a message directly via our secure chat or WhatsApp. Premium members get instant access to phone numbers."
  },
  {
    icon: CalendarHeart,
    title: "Plan & Enjoy Your Date",
    description: "Agree on a time and place that suits you both. Enjoy quality company in complete privacy — on your terms, at your pace."
  }
];

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'gigolos' | 'women'>('gigolos');
  const steps = activeTab === 'gigolos' ? GIGOLO_STEPS : WOMEN_STEPS;

  return (
    <section className="py-24 bg-background" id="how-it-works">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simple. Secure. Rewarding. Start earning or start meeting in three easy steps.
          </p>
        </div>

        <div className="flex justify-center mb-16">
          <div className="inline-flex rounded-full p-1 bg-card border border-white/10">
            <button
              onClick={() => setActiveTab('gigolos')}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'gigolos'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              💰 For Gigolos (Men Earning)
            </button>
            <button
              onClick={() => setActiveTab('women')}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'women'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              💖 For Women (Seeking Company)
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center mb-6 shadow-xl relative group hover:border-primary transition-colors">
                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center border-4 border-background">
                          {index + 1}
                        </div>
                        <Icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
