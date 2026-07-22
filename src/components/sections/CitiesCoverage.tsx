import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

const TN_CITIES = [
  { name: 'Coimbatore', count: 843, slug: '/coimbatore', featured: true },
  { name: 'Chennai', count: 1240, slug: null },
  { name: 'Madurai', count: 526, slug: null },
  { name: 'Trichy', count: 387, slug: null },
  { name: 'Salem', count: 312, slug: null },
  { name: 'Tirunelveli', count: 274, slug: null },
  { name: 'Erode', count: 198, slug: null },
  { name: 'Vellore', count: 165, slug: null },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function CitiesCoverage() {
  return (
    <section className="py-24 bg-card" id="cities">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            <MapPin className="w-3.5 h-3.5 mr-2" /> Tamil Nadu Coverage
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Women Waiting in <span className="text-primary">Tamil Nadu</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We have active women members across every major city in Tamil Nadu — lonely, verified, and ready to meet a gigolo like you. Pick your city and start earning.
          </p>
        </div>

        {/* State badge */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 bg-background border border-primary/20 rounded-full px-5 py-2 text-sm">
            <span className="text-primary font-bold">Tamil Nadu</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-white font-semibold">{TN_CITIES.reduce((a, c) => a + c.count, 0).toLocaleString('en-IN')} women registered</span>
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {TN_CITIES.map((city) => {
            const inner = (
              <motion.div
                variants={item}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 gold-glow-hover cursor-pointer ${
                  city.featured
                    ? 'border-primary/40 bg-primary/5 hover:border-primary'
                    : 'border-white/5 bg-background hover:border-primary/50'
                }`}
              >
                {city.featured && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}
                <div className="relative p-6 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-all ${city.featured ? 'bg-primary/20 group-hover:bg-primary/30' : 'bg-primary/10 group-hover:bg-primary/20'}`}>
                    <Heart className="w-5 h-5 text-primary fill-current" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-1">
                    {city.name}
                    {city.featured && <ChevronRight className="w-4 h-4 text-primary" />}
                  </h3>
                  <p className="text-sm text-primary/80 font-semibold">{city.count.toLocaleString('en-IN')} Women</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {city.featured ? 'View profiles ?' : 'seeking gigolo'}
                  </p>
                </div>
              </motion.div>
            );

            return city.slug ? (
              <Link key={city.name} href={city.slug}>
                {inner}
              </Link>
            ) : (
              <a key={city.name} href="#register">
                {inner}
              </a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
