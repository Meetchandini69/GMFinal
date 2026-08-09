import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import {
  MapPin, ChevronRight, CheckCircle, Globe, Users, Shield, Clock,
  Briefcase, TrendingUp, Heart, Star, Sparkles, Lock, MessageCircle,
  ChevronDown, Calendar, Plane,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Navbar, HowItWorks, EarningsOpportunity, PricingPlans,
  RegisterSection, Footer,
} from '@/components/sections';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

type LocationStat = { label: string; value: string };

type LocationPageData = {
  slug: string;
  source_slug?: string | null;
  title: string;
  city: string;
  state?: string;
  nickname?: string;
  hero_description?: string;
  meta_description?: string;
  stats?: LocationStat[];
  areas?: string[];
};

const PROFILE_PHOTOS = [
  '/models/gigolo-girl-1.jpeg',
  '/models/gigolo-girl-2.jpeg',
  '/models/gigolo-girl-3.jpeg',
  '/models/gigolo-girl-4.jpeg',
];

const PROFILE_DETAILS = [
  { name: 'Verified Member', status: 'Available now', reward: 'Flexible companionship' },
  { name: 'Verified Member', status: 'Online today', reward: 'Professional & discreet' },
  { name: 'Verified Member', status: 'Available weekends', reward: 'Events & travel' },
  { name: 'Verified Member', status: 'Responds quickly', reward: 'Private connections' },
];

const FAQ_QUESTIONS = [
  {
    question: 'How do I get started in a gigolo job?',
    answer: 'Register free, complete your professional profile, and go through our verification process. Once approved, you can start receiving connection requests from people in your city.',
  },
  {
    question: 'Is the platform safe and confidential?',
    answer: 'We prioritise privacy, clear boundaries, and consensual professional companionship. Keep conversations on the platform, verify who you meet, and always choose a safe public location for a first meeting.',
  },
  {
    question: 'What kind of opportunities are available?',
    answer: 'Members can explore event companionship, travel companionship, social dates, and private one-to-one companionship based on their schedule and boundaries.',
  },
  {
    question: 'How much can I earn?',
    answer: 'Earnings vary by experience, availability, service type, and agreement with the client. Use the earning ranges on this page as general examples rather than guaranteed income.',
  },
  {
    question: 'Which areas do you serve?',
    answer: 'We connect members across the major localities listed below, as well as nearby areas. Your profile can mention the locations where you are comfortable working.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border rounded-xl transition-all duration-200 ${open ? 'border-primary/40 bg-primary/5' : 'border-white/10 bg-card hover:border-white/20'}`}>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="w-full flex items-center justify-between p-5 gap-4 text-left"
        aria-expanded={open}
      >
        <span className="text-white font-medium text-sm md:text-base">{question}</span>
        <ChevronDown className={`w-4 h-4 text-primary flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-white/10 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

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
  const primaryAreas = areas.length > 0 ? areas : [`Central ${page.city}`, `${page.city} North`, `${page.city} South`];

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

        {/* Overview */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
                Understanding Companionship in <span className="text-primary">{page.city}</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Gigolomeet.in connects adults seeking respectful, consensual companionship with verified members in {page.city}. Build your profile, choose your schedule, and connect privately.
              </p>
            </div>
            <div className="bg-background border border-white/10 rounded-2xl p-6 md:p-8 mb-8 text-muted-foreground leading-relaxed text-sm md:text-base">
              <p className="mb-4">
                Our professional network helps members discover discreet, premium companionship opportunities across {page.city}. Whether you are exploring event companionship, social dates, or a flexible new career path, clear communication and mutual respect come first.
              </p>
              <p>
                Create a polished profile, set your boundaries, and connect with people who are looking for genuine company in {page.city}. Every interaction should be professional, private, and consensual.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: TrendingUp, title: 'Earning Potential', desc: 'Explore flexible opportunities based on your availability and experience.' },
                { icon: Clock, title: 'Flexible Schedule', desc: 'Choose the times and types of companionship that suit your lifestyle.' },
                { icon: Briefcase, title: 'Professional Network', desc: `Discover local opportunities and connections across ${page.city}.` },
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

        {/* Member gallery */}
        <section id="gallery" className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Members in <span className="text-primary">{page.city}</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Discover verified members looking for professional companionship in {page.city}. Register free to unlock full profiles and start a conversation.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {PROFILE_DETAILS.map((profile, index) => (
                <motion.div
                  key={`${profile.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="group rounded-2xl bg-card border border-white/10 overflow-hidden hover:border-primary/50 transition-all"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={PROFILE_PHOTOS[index]} alt={`${profile.name} in ${page.city}`} className="w-full h-full object-cover object-top blur-[3px] scale-105 group-hover:blur-[2px] transition-all" />
                    <div className="absolute inset-0 bg-black/45" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 backdrop-blur-sm rounded-full p-2"><Lock className="w-5 h-5 text-white/70" /></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                      <div className="text-white font-bold">{profile.name}</div>
                      <div className="flex items-center text-white/70 text-xs gap-1 mt-1"><MapPin className="w-3 h-3" /> {primaryAreas[index % primaryAreas.length]}</div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-green-400 bg-green-400/10">{profile.status}</span>
                      <span className="text-xs text-muted-foreground">Verified</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">{profile.reward}</p>
                    <Button className="w-full bg-primary text-primary-foreground font-semibold" asChild>
                      <a href="#register"><MessageCircle className="w-4 h-4 mr-2" /> Message Member</a>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button size="lg" className="bg-primary text-black font-bold px-10" asChild><a href="#register">View All {page.city} Profiles →</a></Button>
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Why Choose <span className="text-primary">Gigolomeet.in</span> in {page.city}?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">A professional, private platform for meaningful local connections and flexible companionship opportunities.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Shield, title: 'Privacy & Confidentiality', desc: 'Keep your profile and conversations private while you decide who to connect with.' },
                { icon: CheckCircle, title: 'Verified Community', desc: 'Profiles are reviewed to help create a more trustworthy experience for everyone.' },
                { icon: Sparkles, title: 'Flexible Opportunities', desc: 'Choose from social events, travel, dates, and other professional companionship arrangements.' },
                { icon: Heart, title: 'Respectful Connections', desc: 'Set clear boundaries and connect with people who value professionalism and mutual consent.' },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex gap-4 bg-background border border-white/10 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-primary" /></div>
                  <div><h3 className="text-white font-semibold mb-2">{title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{desc}</p></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Earnings and benefits */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Benefits of <span className="text-primary">Companionship Jobs</span> in {page.city}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Build a flexible professional path with opportunities designed around your schedule and comfort.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 max-w-4xl mx-auto">
              {[
                { icon: Calendar, type: 'Event Companionship', range: '₹5,000 – ₹15,000', per: 'per event', desc: 'Corporate events, weddings, social gatherings' },
                { icon: Plane, type: 'Travel Companionship', range: '₹10,000 – ₹25,000', per: 'per day', desc: 'Outstation trips and weekend getaways' },
                { icon: Heart, type: 'Personalised Sessions', range: '₹7,000 – ₹20,000', per: 'per session', desc: 'One-to-one companionship and dates' },
              ].map(({ icon: Icon, type, range, per, desc }) => (
                <div key={type} className="border border-primary/30 bg-primary/5 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4"><Icon className="w-5 h-5 text-primary" /></div>
                  <h3 className="text-white font-semibold mb-3">{type}</h3>
                  <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-primary bg-primary/10 mb-1">{range}</div>
                  <p className="text-muted-foreground text-xs mb-3">{per}</p>
                  <p className="text-muted-foreground text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {['High earning potential', 'Flexible working hours', 'Professional growth and networking', 'Health, safety, and privacy focus'].map(benefit => (
                <div key={benefit} className="flex gap-4 bg-card border border-white/10 rounded-xl p-5"><CheckCircle className="w-5 h-5 text-primary shrink-0" /><span className="text-white font-semibold text-sm">{benefit}</span></div>
              ))}
            </div>
          </div>
        </section>

        {/* Demand and client types */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Local Opportunities in <span className="text-primary">{page.city}</span></h2>
                <p className="text-muted-foreground leading-relaxed mb-6">The demand for professional companionship continues to grow in {page.city}. A complete profile helps people discover your availability and interests.</p>
                <div className="space-y-3">
                  {[
                    { stat: stats[0]?.value || 'Growing', label: `members connected in ${page.city}` },
                    { stat: stats[1]?.value || 'Local', label: 'opportunities and connections' },
                    { stat: 'Daily', label: 'new conversations and profile activity' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-4 bg-background border border-white/10 rounded-xl px-5 py-3"><span className="text-primary font-bold text-lg w-20 shrink-0">{item.stat}</span><span className="text-muted-foreground text-sm">{item.label}</span></div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Who are our members?</h3>
                <div className="space-y-4">
                  {['Busy professionals', 'Single adults', 'Visitors and travellers', 'People seeking social companions'].map((type, index) => (
                    <div key={type} className="bg-background border border-white/10 rounded-xl p-4"><div className="text-white font-semibold text-sm mb-1">{type}</div><div className="text-muted-foreground text-xs leading-relaxed">People looking for respectful, flexible companionship in {primaryAreas[index % primaryAreas.length]} and nearby areas.</div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="py-14 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { icon: Shield, title: 'Private & Discreet', desc: 'Your profile and conversations remain under your control.' },
                { icon: Star, title: 'Verified Members', desc: 'Profiles are reviewed before they are published.' },
                { icon: Clock, title: 'Free Registration', desc: 'Create your profile in minutes and start exploring.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-white/10"><div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><Icon className="w-5 h-5 text-primary" /></div><h3 className="text-white font-semibold mb-2">{title}</h3><p className="text-muted-foreground text-sm">{desc}</p></div>
              ))}
            </div>
          </div>
        </section>

        {/* Areas */}
        {primaryAreas.length > 0 && (
          <section id="areas" className="py-16 bg-card">
            <div className="container mx-auto px-4 md:px-6">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                  Local Areas in <span className="text-primary">{page.city}</span> We Serve
                </h2>
                <p className="text-muted-foreground">Members from major localities across {page.city}.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {primaryAreas.map(area => (
                  <a key={area} href="#register" className="px-4 py-2 bg-card border border-white/10 rounded-full text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                    <MapPin className="w-3 h-3 text-primary inline mr-1" />{area}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs and SEO content */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Local <span className="text-primary">FAQs</span></h2><p className="text-muted-foreground">Everything you need to know about opportunities in {page.city}.</p></div>
            <div className="space-y-3">{FAQ_QUESTIONS.map(item => <FaqItem key={item.question} question={item.question} answer={item.answer} />)}</div>
          </div>
        </section>
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8">Companionship Opportunities in {page.city} — Complete Guide</h2>
            <div className="grid md:grid-cols-2 gap-8 text-muted-foreground text-sm leading-relaxed">
              <div><h3 className="text-white font-semibold text-base mb-3">What is a companionship job?</h3><p className="mb-5">A professional companion provides respectful company for social occasions, dates, travel, and other mutually agreed activities. Members in {page.city} can create a profile that describes their interests, availability, and boundaries.</p><h3 className="text-white font-semibold text-base mb-3">How to build a profile</h3><p>Use a clear photo, write an honest introduction, and explain what makes you a great companion. Good communication and reliability help build lasting professional connections.</p></div>
              <div><h3 className="text-white font-semibold text-base mb-3">Male companion opportunities in {page.city}</h3><p className="mb-5">Members can explore opportunities around {primaryAreas.slice(0, 3).join(', ')} and nearby localities. Availability, rates, and arrangements should always be discussed clearly before meeting.</p><h3 className="text-white font-semibold text-base mb-3">Safety and discretion</h3><p>Keep personal information private, verify new contacts, share your plans with someone you trust, and meet first in a safe public place. All arrangements should be legal, consensual, and professional.</p></div>
            </div>
            <p className="text-muted-foreground text-xs mt-8 border-t border-white/10 pt-6">This content provides general information and is not legal or professional advice. All services are based on mutual consent and professionalism.</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center bg-card border border-primary/20 rounded-3xl p-10">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6"><Sparkles className="w-3.5 h-3.5 mr-2" /> Join the {page.city} Community</div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Ready to start your journey?</h2>
              <p className="text-muted-foreground mb-8 text-lg">Create your profile and discover professional companionship opportunities in {page.city}.</p>
              <Button size="lg" className="bg-primary text-primary-foreground font-bold text-base px-12" asChild><a href="#register">Register Now — It's Free →</a></Button>
            </div>
          </div>
        </section>

        {/* Shared platform sections — every cloned page includes the complete source layout. */}
        <HowItWorks />
        <EarningsOpportunity />
        <PricingPlans />
        <RegisterSection />
      </main>
      <Footer />
    </div>
  );
}