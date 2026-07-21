import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            India's #1 Gigolo Job Platform
          </div>
          <h1 className="text-4xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            Earn <span className="text-gradient-gold">₹50K–₹2L</span><br />
            Per Month Meeting Women
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join India's most trusted gigolo platform. Connect with verified women, maintain complete privacy, and earn premium income on your schedule.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              className="h-14 px-8 text-lg font-bold bg-primary text-primary-foreground gold-glow"
              onClick={() => scrollTo('register')}
            >
              Join Free & Start Earning <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/5"
              onClick={() => scrollTo('how-it-works')}
            >
              How It Works
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> 100% Private</div>
            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Free to Join</div>
            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> 2,847+ Members</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
