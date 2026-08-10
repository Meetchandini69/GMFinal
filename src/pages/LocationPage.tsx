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
import {
  getDefaultLocationContent,
  getDefaultLocationLinks,
  mergeLocationContent,
  type LocationContent,
  type LocationLinks,
} from '@/lib/locationContent';

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
  content?: LocationContent;
  links?: LocationLinks;
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
  const content = mergeLocationContent(page.city, primaryAreas, page.content);
  const links = { ...getDefaultLocationLinks(), ...(page.links || {}) };
  const hero = content.hero;
  const overview = content.overview;
  const gallery = content.gallery;
  const why = content.why;
  const earnings = content.earnings;
  const demand = content.demand;
  const trust = content.trust;
  const areaContent = content.areas;
  const faq = content.faq;
  const seo = content.seo;
  const finalCta = content.finalCta;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <a href={links.home} className="hover:text-primary transition-colors">Home</a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">{page.city}</span>
            </div>
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
              <MapPin className="w-3.5 h-3.5 mr-2" /> {hero.badge || locationLabel}{page.nickname ? ` — "${page.nickname}"` : ''}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              {hero.title || `Gigolo Service in ${page.city}`}
              <br />{hero.titleLine2 || 'Premier Male Escort & Call Boy Jobs'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
              {hero.description || page.hero_description || `Discover professional companionship opportunities in ${page.city}.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <Button size="lg" className="bg-primary text-black font-bold text-base px-10 h-12" asChild>
                <a href={links.heroPrimary}>{hero.primaryCtaText || 'Register Free — Start Today →'}</a>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/40 text-white hover:bg-primary/10 h-12" asChild>
                <a href={links.heroSecondary}>{hero.secondaryCtaText || 'View Areas We Serve'}</a>
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
                {overview.title || `Understanding Companionship in ${page.city}`}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {overview.intro}
              </p>
            </div>
            <div className="bg-background border border-white/10 rounded-2xl p-6 md:p-8 mb-8 text-muted-foreground leading-relaxed text-sm md:text-base">
              <p className="mb-4">
                {overview.body}
              </p>
              <p>
                {overview.body2}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: TrendingUp, ...overview.cards?.[0] },
                { icon: Clock, ...overview.cards?.[1] },
                { icon: Briefcase, ...overview.cards?.[2] },
              ].map(({ icon: Icon, title, description }) => (
                <motion.div key={title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex gap-4 bg-background border border-white/10 rounded-xl p-5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm">{title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
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
                {gallery.title || `Members in ${page.city}`}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {gallery.description}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {(gallery.profiles || PROFILE_DETAILS).slice(0, 12).map((profile: any, index: number) => (
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
                      <div className="text-white font-bold">{profile.name || 'Verified Member'}</div>
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
                      <a href={links.galleryProfile}><MessageCircle className="w-4 h-4 mr-2" /> {gallery.profileButtonText || 'Message Member'}</a>
                    </Button>
                  </div>
                    </motion.div>
                  ))}
            </div>
            <div className="text-center mt-10">
              <Button size="lg" className="bg-primary text-black font-bold px-10" asChild><a href={links.galleryAll}>{gallery.buttonText || `View All ${page.city} Profiles →`}</a></Button>
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                {why.title || `Why Choose Gigolomeet.in in ${page.city}?`}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{why.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Shield, ...why.cards?.[0] },
                { icon: CheckCircle, ...why.cards?.[1] },
                { icon: Sparkles, ...why.cards?.[2] },
                { icon: Heart, ...why.cards?.[3] },
              ].map(({ icon: Icon, title, description }) => (
                <motion.div key={title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex gap-4 bg-background border border-white/10 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-primary" /></div>
                  <div><h3 className="text-white font-semibold mb-2">{title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{description}</p></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Earnings and benefits */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">{earnings.title}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{earnings.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 max-w-4xl mx-auto">
              {(earnings.tiers || []).map((tier: any, index: number) => {
                const Icon = [Calendar, Plane, Heart][index % 3];
                return (
                <div key={tier.type} className="border border-primary/30 bg-primary/5 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4"><Icon className="w-5 h-5 text-primary" /></div>
                  <h3 className="text-white font-semibold mb-3">{tier.type}</h3>
                  <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-primary bg-primary/10 mb-1">{tier.range}</div>
                  <p className="text-muted-foreground text-xs mb-3">{tier.per}</p>
                  <p className="text-muted-foreground text-xs">{tier.description}</p>
                </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {(earnings.benefits || []).map((benefit: string) => (
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
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">{demand.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{demand.description}</p>
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
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {demand.clientTitle}</h3>
                <div className="space-y-4">
                  {(demand.clientTypes || []).map((type: string, index: number) => (
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
              {(trust.cards || []).map((card: any, index: number) => {
                const Icon = [Shield, Star, Clock][index % 3];
                return (
                <div key={card.title} className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-white/10"><div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><Icon className="w-5 h-5 text-primary" /></div><h3 className="text-white font-semibold mb-2">{card.title}</h3><p className="text-muted-foreground text-sm">{card.description}</p></div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Areas */}
        {primaryAreas.length > 0 && (
          <section id="areas" className="py-16 bg-card">
            <div className="container mx-auto px-4 md:px-6">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                  {areaContent.title}
                </h2>
                <p className="text-muted-foreground">{areaContent.description}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {primaryAreas.map(area => (
                  <a key={area} href={links.area} className="px-4 py-2 bg-card border border-white/10 rounded-full text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
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
            <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">{faq.title}</h2><p className="text-muted-foreground">{faq.description}</p></div>
            <div className="space-y-3">{(faq.items || []).map((item: any) => <FaqItem key={item.question} question={item.question} answer={item.answer} />)}</div>
          </div>
        </section>
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8">{seo.title}</h2>
            <div className="grid md:grid-cols-2 gap-8 text-muted-foreground text-sm leading-relaxed">
              <div><h3 className="text-white font-semibold text-base mb-3">{seo.column1Title}</h3><p className="mb-5">{seo.column1Text}</p><h3 className="text-white font-semibold text-base mb-3">{seo.column1Subtitle}</h3><p>{seo.column1Text2}</p></div>
              <div><h3 className="text-white font-semibold text-base mb-3">{seo.column2Title}</h3><p className="mb-5">{seo.column2Text}</p><h3 className="text-white font-semibold text-base mb-3">{seo.column2Subtitle}</h3><p>{seo.column2Text2}</p></div>
            </div>
            <p className="text-muted-foreground text-xs mt-8 border-t border-white/10 pt-6">{seo.disclaimer}</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center bg-card border border-primary/20 rounded-3xl p-10">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6"><Sparkles className="w-3.5 h-3.5 mr-2" /> {finalCta.badge}</div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">{finalCta.title}</h2>
              <p className="text-muted-foreground mb-8 text-lg">{finalCta.description}</p>
              <Button size="lg" className="bg-primary text-primary-foreground font-bold text-base px-12" asChild><a href={links.finalCta}>{finalCta.buttonText}</a></Button>
            </div>
          </div>
        </section>

        {/* Shared platform sections — every cloned page includes the complete source layout. */}
        <HowItWorks content={content.howItWorks} />
        <EarningsOpportunity content={content.earningsOpportunity} ctaHref={links.earningsCta} />
        <PricingPlans content={content.pricing} ctaHref={links.pricingCta} />
        <RegisterSection content={content.register} termsHref={links.terms} privacyHref={links.privacy} />
      </main>
      <Footer />
    </div>
  );
}