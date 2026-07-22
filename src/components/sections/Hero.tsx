import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Heart, MapPin, Users, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune",
  "Kolkata", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Chandigarh"
];

const AGE_GROUPS = ["18–25 yrs", "26–32 yrs", "33–40 yrs", "Any Age"];

const WAITING_WOMEN = [
  { id: 1, name: "Priya", age: 31, city: "Mumbai", status: "Online now", tagline: "Divorced, looking for a caring man", color: "from-rose-500 to-pink-700", initial: "P" },
  { id: 2, name: "Seema", age: 36, city: "Delhi", status: "Active today", tagline: "Single professional, seeks genuine fun", color: "from-fuchsia-500 to-purple-700", initial: "S" },
  { id: 3, name: "Kajal", age: 28, city: "Bangalore", status: "Online now", tagline: "Young & free, wants exciting dates", color: "from-amber-500 to-orange-600", initial: "K" },
];

export function Hero() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => { setIsSearching(false); setIsOpen(true); }, 900);
  };

  return (
    <section className="relative pt-28 pb-20 md:pt-44 md:pb-32 overflow-hidden particles-bg min-h-[92vh] flex flex-col justify-center">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-background to-background"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-rose-900/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              🔥 2,400+ Women Waiting to Meet You Right Now
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-6 leading-tight">
              Get Paid to Date{' '}
              <span className="text-gradient-gold">Beautiful Women</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto font-light">
              India's #1 Gigolo Job Platform — Earn <strong className="text-white">₹50,000–₹2,00,000/month</strong> doing what you love. Meet gorgeous, lonely women near you who are <em>ready to pay</em> for real companionship.
            </p>

            <p className="text-sm text-primary/80 mb-10 font-medium">
              ✅ Free Registration &nbsp;•&nbsp; ✅ Real Verified Women &nbsp;•&nbsp; ✅ Your City, Your Schedule
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl max-w-3xl mx-auto"
          >
            <p className="text-sm text-muted-foreground mb-4 font-medium">👇 See women looking for a gigolo in your city</p>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select defaultValue="Mumbai">
                  <SelectTrigger className="h-12 bg-background border-white/10">
                    <SelectValue placeholder="Select Your City" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select defaultValue="Any Age">
                  <SelectTrigger className="h-12 bg-background border-white/10">
                    <SelectValue placeholder="Their Age Preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    {AGE_GROUPS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit" size="lg"
                className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto font-bold"
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin"></span>
                    Finding...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Show Women
                  </span>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto border-t border-white/5 pt-8"
          >
            {[
              { icon: Users, value: "2,40,000+", label: "Registered Women" },
              { icon: MapPin, value: "200+", label: "Cities Active" },
              { icon: IndianRupee, value: "₹2 Lakh", label: "Top Monthly Earn" },
              { icon: ShieldCheck, value: "100%", label: "Identity Safe" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-2">
                <Icon className="w-6 h-6 text-primary" />
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Peek results dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2 text-white">
              <Heart className="w-5 h-5 text-primary fill-current" />
              Women Near You — Members Only
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {WAITING_WOMEN.map(w => (
              <div key={w.id} className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-background/50 hover:border-primary/30 transition-colors">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${w.color} flex items-center justify-center text-white text-xl font-serif font-bold shadow-lg flex-shrink-0`}>
                  {w.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-white">{w.name}, {w.age}</h4>
                    <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">{w.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {w.city}
                  </div>
                  <p className="text-xs text-primary/80 mt-1 italic">"{w.tagline}"</p>
                </div>
                <div className="text-muted-foreground text-xs text-center shrink-0 blur-sm select-none pointer-events-none">
                  🔒 Photo
                </div>
              </div>
            ))}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center text-sm text-primary font-medium">
              🔐 Register free to see full profiles, photos & WhatsApp numbers
            </div>
            <Button className="w-full bg-primary text-primary-foreground font-bold text-base h-12" asChild>
              <a href="#register" onClick={() => setIsOpen(false)}>
                Register Free — See All Women →
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
