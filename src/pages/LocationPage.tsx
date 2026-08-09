import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { MapPin, ChevronRight, CheckCircle, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar, RegisterSection, Footer } from '@/components/sections';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

type LocationStat = { label: string; value: string };

type LocationPageData = {
  slug: string;
  title: string;
  city: string;
  state?: string;
  nickname?: string;
  hero_description?: string;
  meta_description?: string;
  stats?: LocationStat[];
  areas?: string[];
};

export default function LocationPage() {
  const [, params] = useRoute('/:slug');
  const [page, setPage] = useState<LocationPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const slug = params?.slug;
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    apiFetch(`/api/location-pages/${encodeURIComponent(slug)}`)
      .then(async res => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        setPage(await res.json());
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params?.slug]);

  useEffect(() => {
    if (!page) return;
    document.title = page.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && page.meta_description) {
      metaDescription.setAttribute('content', page.meta_description);
    }
    window.scrollTo(0, 0);
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <Globe className="w-12 h-12 text-primary mb-5" />
        <h1 className="text-3xl font-serif font-bold text-white mb-3">Location page not found</h1>
        <p className="text-muted-foreground mb-6">This page may have been unpublished or the URL may be incorrect.</p>
        <Button className="bg-primary text-black font-bold" asChild><a href="/">Go Home</a></Button>
      </div>
    );
  }

  const stats = page.stats || [];
  const areas = page.areas || [];
  const locationLabel = [page.city, page.state].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">{page.city}</span>
            </div>
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
              <MapPin className="w-3.5 h-3.5 mr-2" /> {locationLabel}{page.nickname ? ` — "${page.nickname}"` : ''}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Gigolo Service in <span className="text-primary">{page.city}</span>
              <br />Premier Male Escort &amp; Call Boy Jobs
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
              {page.hero_description || `Discover professional companionship opportunities in ${page.city}.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <Button size="lg" className="bg-primary text-black font-bold text-base px-10 h-12" asChild>
                <a href="#register">Register Free — Start Today →</a>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/40 text-white hover:bg-primary/10 h-12" asChild>
                <a href="#areas">View Areas We Serve</a>
              </Button>
            </div>
            {stats.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(stat => (
                  <div key={`${stat.label}-${stat.value}`} className="bg-card border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
                Professional Companionship in <span className="text-primary">{page.city}</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Gigolomeet.in connects adults seeking respectful, consensual companionship with verified members in {page.city}. Build your profile, choose your schedule, and connect privately.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: CheckCircle, title: 'Verified Community', desc: 'Profiles are reviewed to help create a more trustworthy experience.' },
                { icon: Users, title: 'Local Opportunities', desc: `Discover members and opportunities across ${page.city}.` },
                { icon: Globe, title: 'Private & Flexible', desc: 'Set your boundaries and manage your profile on your terms.' },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex gap-4 bg-background border border-white/10 rounded-xl p-5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm">{title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {areas.length > 0 && (
          <section id="areas" className="py-16 bg-background">
            <div className="container mx-auto px-4 md:px-6">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                  Local Areas in <span className="text-primary">{page.city}</span> We Serve
                </h2>
                <p className="text-muted-foreground">Members from major localities across {page.city}.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {areas.map(area => (
                  <a key={area} href="#register" className="px-4 py-2 bg-card border border-white/10 rounded-full text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                    {area}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <RegisterSection />
      </main>
      <Footer />
    </div>
  );
}