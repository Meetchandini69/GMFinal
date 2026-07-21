import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Heart, ShieldCheck, Clock, Smile, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: IndianRupee,
    title: "Earn ₹50K–₹2L/Month",
    description: "Get paid generously for your time and companionship. Top gigolos on our platform earn over ₹2 lakhs monthly — working flexible hours on their own terms."
  },
  {
    icon: Heart,
    title: "Meet Real, Lonely Women",
    description: "Connect with thousands of verified divorced, separated, and single women actively seeking a genuine male companion. These are real women, not bots."
  },
  {
    icon: ShieldCheck,
    title: "100% Identity Protected",
    description: "Your real name, address, and personal details are never disclosed to anyone. We use military-grade encryption so you stay completely safe and anonymous."
  },
  {
    icon: Clock,
    title: "Work on Your Schedule",
    description: "Morning, evening, weekends — you choose when you're available. Take as many or as few meetings as you like. Zero pressure, total freedom."
  },
  {
    icon: Smile,
    title: "No Experience Needed",
    description: "You don't need any special skills or background. If you are presentable, respectful, and charming — you already qualify. We guide you through every step."
  },
  {
    icon: Zap,
    title: "Instant Profile Activation",
    description: "Get verified and go live in under 24 hours. Once active, connection requests from women in your city start flowing in immediately. Zero waiting."
  }
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-card border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Why Join <span className="text-primary border-b-2 border-primary pb-1">Gigolomeet.in?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-6">
            Thousands of Indian men have already changed their lives by joining us. Here's exactly what you get when you register as a Gigolo.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={item}
                className="bg-background rounded-2xl p-8 border border-white/5 hover:border-primary/30 transition-colors relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-background transition-colors relative z-10">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
