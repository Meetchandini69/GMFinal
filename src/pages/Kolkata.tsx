import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Heart, MessageCircle, Lock, ChevronRight, Star,
  Shield, Clock, CheckCircle, TrendingUp, Users, Briefcase,
  ChevronDown, Calendar, Plane, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Navbar, HowItWorks, EarningsOpportunity, PricingPlans, RegisterSection, Footer,
} from '@/components/sections';

/* ─────────────────────────── data ─────────────────────────── */

const MODEL_PHOTOS = [
  '/models/gigolo-girl-1.jpeg',
  '/models/gigolo-girl-2.jpeg',
  '/models/gigolo-girl-3.jpeg',
  '/models/gigolo-girl-4.jpeg',
];

const KOL_PROFILES = [
  {
    id: 1, name: "Priya B.", age: 36, area: "Salt Lake",
    status: "divorced", statusLabel: "Divorced",
    tagline: "Looking for a warm, attentive man for regular companionship in Kolkata.",
    detail: "Age pref: 27–42 • Weekends • Well-groomed preferred",
    photo: MODEL_PHOTOS[0],
    online: true, reward: "Willing to pay ₹10,000/meet",
  },
  {
    id: 2, name: "Rina D.", age: 43, area: "Ballygunge",
    status: "widow", statusLabel: "Widow",
    tagline: "Seeking warmth and laughter after years of loneliness. No pressure.",
    detail: "Age pref: 32–46 • Evenings • Educated men preferred",
    photo: MODEL_PHOTOS[1],
    online: true, reward: "Willing to pay ₹12,000/meet",
  },
  {
    id: 3, name: "Sonali M.", age: 29, area: "New Town",
    status: "single", statusLabel: "Single",
    tagline: "IT professional craving fun dates and genuine company on weekends.",
    detail: "Age pref: 25–36 • Flexible • Fitness-oriented preferred",
    photo: MODEL_PHOTOS[2],
    online: false, reward: "Willing to pay ₹7,500/meet",
  },
  {
    id: 4, name: "Debarati S.", age: 39, area: "Park Street",
    status: "separated", statusLabel: "Separated",
    tagline: "Seeking a genuine, affectionate gigolo for long-term company in Kolkata.",
    detail: "Age pref: 29–43 • Afternoons • Homely type preferred",
    photo: MODEL_PHOTOS[3],
    online: true, reward: "Willing to pay ₹9,500/meet",
  },
];

const STATUS_COLORS: Record<string, string> = {
  divorced: "text-amber-400 bg-amber-400/10",
  widow: "text-purple-400 bg-purple-400/10",
  single: "text-green-400 bg-green-400/10",
  separated: "text-blue-400 bg-blue-400/10",
};

const STATS = [
  { label: 'Women Registered', value: '920+' },
  { label: 'Online Right Now', value: '143' },
  { label: 'New Profiles Today', value: '29' },
  { label: 'Avg. Earnings/Month', value: '₹80K' },
];

const AREAS = [
  'Park Street', 'Salt Lake', 'New Town', 'Ballygunge',
  'Alipore', 'Jadavpur', 'Howrah', 'Dum Dum',
  'Rajarhat', 'Behala', 'Tollygunge', 'Gariahat',
  'Bhawanipore', 'Lake Town', 'Kasba',
];

const WHY_CHOOSE = [
  {
    icon: Shield,
    title: 'Discretion & Confidentiality',
    desc: 'Privacy is our top priority. We use encrypted communication channels and secure booking systems to ensure your identity remains completely confidential — whether you are a client or a companion.',
  },
  {
    icon: CheckCircle,
    title: 'Professionally Verified Companions',
    desc: 'All male gigolos undergo identity verification, regular medical health check-ups, and professional training to meet the highest standards — ensuring a worry-free experience for both parties.',
  },
  {
    icon: Sparkles,
    title: 'Diverse & Customisable Services',
    desc: 'Every client is unique. Whether you need a call boy for a social event, a travel companion, an emotional confidant, or a playboy model for luxury dates — services are tailored to your needs.',
  },
  {
    icon: TrendingUp,
    title: 'Transparent & Competitive Earnings',
    desc: 'For those pursuing playboy or male escort jobs, we offer clear upfront earning structures, tools to manage profiles, set your own rates, and work entirely on your terms.',
  },
];

const EARNING_TIERS = [
  {
    icon: Calendar,
    type: 'Event Companionship',
    range: '₹5,000 – ₹15,000',
    per: 'per event',
    desc: 'Corporate events, weddings, social gatherings, parties',
    color: 'border-amber-500/30 bg-amber-500/5',
    badge: 'text-amber-400 bg-amber-400/10',
  },
  {
    icon: Plane,
    type: 'Travel Companionship',
    range: '₹10,000 – ₹25,000',
    per: 'per day',
    desc: 'Outstation trips, hotel stays, weekend getaways',
    color: 'border-primary/30 bg-primary/5',
    badge: 'text-primary bg-primary/10',
  },
  {
    icon: Heart,
    type: 'Personalised Sessions',
    range: '₹7,000 – ₹20,000',
    per: 'per session',
    desc: 'One-on-one companionship, dates, emotional support',
    color: 'border-rose-500/30 bg-rose-500/5',
    badge: 'text-rose-400 bg-rose-400/10',
  },
];

const BENEFITS = [
  { title: 'High Earning Potential', desc: 'Male gigolos serving Kolkata can earn significant income. Those serving tourists and professionals often earn higher hourly rates, while local clients offer steady, repeat engagements.' },
  { title: 'Flexible Working Hours', desc: 'Call boy jobs provide exceptional flexibility. Set your own schedule, balance other commitments, and pursue additional interests — ideal for students, freelancers, and professionals.' },
  { title: 'Professional Growth & Networking', desc: "The profession opens doors to high-profile events, travel opportunities, and valuable networking with successful individuals across Kolkata's vibrant cultural scene." },
  { title: 'Health & Safety Focus', desc: 'All companions undergo regular health screenings and maintain high hygiene standards. This professional approach builds trust with clients and protects companions.' },
  { title: 'Empowerment & Autonomy', desc: 'Build your career with dignity and professionalism. Manage your own profile, accept or decline bookings, and work independently with full control over your engagements.' },
];

const CLIENT_TYPES = [
  { label: 'Busy Professionals', desc: "Women with demanding careers in Kolkata's corporate and IT sectors who lack time for traditional dating." },
  { label: 'Single Women', desc: 'Those seeking emotional or physical companionship without long-term commitment.' },
  { label: 'Tourists', desc: 'Women visiting Kolkata who want a charming, knowledgeable local guide and companion.' },
  { label: 'Socialites', desc: 'Women who need an impressive date for high-profile events, cultural gatherings, or business functions.' },
];

const FAQS = [
  {
    q: 'Who are the women clients in Kolkata?',
    a: 'Our clients are a diverse group of successful, confident women — busy professionals, single women seeking companionship without commitment, tourists visiting Kolkata, and socialites who need an impressive companion for events and cultural gatherings.',
  },
  {
    q: 'Is it safe to work as a gigolo in Kolkata?',
    a: 'Yes, when working through a reputable platform that prioritises safety. This includes client verification, medical guidelines, strict confidentiality, and support systems. Our platform ensures both companions and clients are verified, and we encourage neutral, safe locations for first interactions.',
  },
  {
    q: 'Are call boy jobs legal in Kolkata?',
    a: 'The legality depends on the services provided. Professional companionship and escort services that do not involve explicit illegal activities operate within legal boundaries. Our platform focuses exclusively on professional, consensual, and non-explicit companionship services.',
  },
  {
    q: 'How do I get started as a call boy in Kolkata?',
    a: 'Simply register on our platform, complete your profile with a professional photo and description, and go through our verification process. Once approved, you can start receiving booking requests from women in Kolkata immediately.',
  },
  {
    q: 'How many women are seeking male companions in Kolkata?',
    a: 'Demand is robust and growing. With a population of over 14 million and a constant influx of tourists and business travellers, Kolkata sees consistently high demand year-round. Hundreds of verified women actively browse our platform for suitable male companions.',
  },
  {
    q: 'What is the earning potential for a gigolo in Kolkata?',
    a: 'Earnings vary by service type: Event companionship pays ₹5,000–₹15,000 per event, travel companionship ₹10,000–₹25,000 per day, and personalised sessions ₹7,000–₹20,000 per session. Top members consistently earn ₹80,000–₹2,00,000/month.',
  },
];

/* ─────────────────────────── FAQ accordion ─────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-xl transition-all duration-200 cursor-pointer ${open ? 'border-primary/40 bg-primary/5' : 'border-white/10 bg-card hover:border-white/20'}`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-5 gap-4">
        <span className="text-white font-medium text-sm md:text-base">{q}</span>
        <ChevronDown className={`w-4 h-4 text-primary flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-white/10 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── page ─────────────────────────── */
export default function Kolkata() {
  useEffect(() => {
    document.title = "Gigolo Service in Kolkata | Call Boy & Male Escort Jobs — Gigolomeet.in";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Premier gigolo service, call boy jobs & male escort opportunities in Kolkata. Meet women in Salt Lake, Ballygunge, Park Street. Earn ₹50K–₹2L/month. Free registration. 100% private."
      );
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <main>

        {/* ── Hero ── */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">Kolkata</span>
            </div>
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
              <MapPin className="w-3.5 h-3.5 mr-2" /> Kolkata, West Bengal — "City of Joy"
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Gigolo Service in{' '}
              <span className="text-primary">Kolkata</span>
              <br />Premier Male Escort &amp; Call Boy Jobs
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
              920+ lonely, divorced and single women in Kolkata are looking for a gigolo right now — in Salt Lake, Ballygunge, Park Street and all major areas. Register free and start earning today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <Button size="lg" className="bg-primary text-primary-foreground font-bold text-base px-10 h-12" asChild>
                <a href="#register">Register Free — Start Today →</a>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/40 text-white hover:bg-primary/10 h-12" asChild>
                <a href="#gallery">View Women Profiles</a>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="bg-card border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Intro / Overview ── */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
                Understanding Gigolo Services in <span className="text-primary">Kolkata</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to the definitive guide for gigolo services, call boy jobs, and playboy opportunities in Kolkata. As the City of Joy rapidly modernises, the demand for professional male companionship services has seen remarkable growth.
              </p>
            </div>
            <div className="bg-background border border-white/10 rounded-2xl p-6 md:p-8 mb-8 text-muted-foreground leading-relaxed text-sm md:text-base">
              <p className="mb-4">
                Our professional network connects discerning women with elite male escorts, models, and companions across Kolkata. From <strong className="text-white">Salt Lake to Ballygunge</strong>, we provide discreet, premium companionship services that prioritise safety, confidentiality, and genuine connection.
              </p>
              <p>
                Professional gigolo services in Kolkata represent a legitimate, consensual arrangement where male companions provide emotional and physical companionship to clients. Unlike common misconceptions, the profession is built on mutual respect, clear boundaries, and professional standards.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: TrendingUp, title: 'Financial Independence', desc: 'Substantial earning potential with rates depending on experience, skills, and client preferences.' },
                { icon: Clock, title: 'Flexible Schedule', desc: 'Set your own work hours — ideal for individuals seeking a healthy work-life balance.' },
                { icon: Briefcase, title: 'Diverse Opportunities', desc: 'From event companionship to travel and emotional support — the scope of work is varied and engaging.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 bg-background border border-white/10 rounded-xl p-5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm">{title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Women profiles ── */}
        <section className="py-20 bg-background" id="gallery">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Women in <span className="text-primary">Kolkata</span> Waiting Right Now
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                These women posted profiles on Gigolomeet.in looking for a gigolo in Kolkata. Register free to see their full contact.
              </p>
            </div>
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-3 bg-card border border-white/10 rounded-full px-5 py-2.5 text-sm">
                <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-400 font-semibold">143 women online in Kolkata</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {KOL_PROFILES.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group rounded-2xl bg-card border border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-300 gold-glow-hover flex flex-col"
                >
                  <div className="relative">
                    <div className="w-full h-44 overflow-hidden relative">
                      <img
                        src={profile.photo}
                        alt={profile.name}
                        className="w-full h-full object-cover object-top filter blur-[3px] scale-105 group-hover:blur-[2px] transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="text-white font-bold text-lg leading-tight">{profile.name}</div>
                        <div className="flex items-center text-white/70 text-xs gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {profile.area}, Kolkata
                        </div>
                      </div>
                      <div className={`absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-card ${profile.online ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                          <Lock className="w-5 h-5 text-white/60" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-3 flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-7 h-7 rounded bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white/40" />
                        </div>
                      ))}
                      <div className="w-7 h-7 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <span className="text-[9px] text-primary font-bold">+8</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[profile.status]}`}>{profile.statusLabel}</span>
                      <span className="text-sm text-muted-foreground">Age {profile.age}</span>
                    </div>
                    <p className="text-sm text-gray-300 italic leading-snug flex-1">"{profile.tagline}"</p>
                    <p className="text-[11px] text-muted-foreground">{profile.detail}</p>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 text-center">
                      <span className="text-primary text-xs font-bold">{profile.reward}</span>
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" asChild>
                      <a href="#register"><MessageCircle className="w-4 h-4 mr-2" /> Message Her</a>
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">Register free to unlock contact</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <Button size="lg" className="bg-primary text-primary-foreground font-bold px-10 h-12" asChild>
                <a href="#register">View All 920 Kolkata Profiles →</a>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Why Choose <span className="text-primary">Gigolomeet.in</span> in Kolkata?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                When seeking male escort services or exploring call boy jobs in Kolkata, choosing the right platform is paramount. Here's why we stand out as the premier choice.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {WHY_CHOOSE.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="flex gap-4 bg-background border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Earning Rates + Benefits ── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Benefits of <span className="text-primary">Gigolo Jobs</span> in Kolkata
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Considering a career as a male escort or call boy in Kolkata? This profession offers numerous benefits beyond financial gain.
              </p>
            </div>

            {/* Earning rate cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 max-w-4xl mx-auto">
              {EARNING_TIERS.map(({ icon: Icon, type, range, per, desc, color, badge }) => (
                <div key={type} className={`border rounded-2xl p-6 text-center ${color}`}>
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-white/70" />
                  </div>
                  <h3 className="text-white font-semibold mb-3">{type}</h3>
                  <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-1 ${badge}`}>{range}</div>
                  <p className="text-muted-foreground text-xs mb-3">{per}</p>
                  <p className="text-muted-foreground text-xs">{desc}</p>
                </div>
              ))}
            </div>

            {/* Benefits list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-4 bg-card border border-white/10 rounded-xl p-5">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-sm">{b.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Demand / Client types ── */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                  How Many Women Are Seeking Male Companions in <span className="text-primary">Kolkata</span>?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  The demand for male companionship in Kolkata is robust and growing. The city's cultural renaissance and shifting lifestyle preferences have made people more open to exploring companionship services.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    { stat: '14M+', label: 'Population with consistent demand year-round' },
                    { stat: '920+', label: 'Verified women registered in Kolkata' },
                    { stat: 'Daily', label: 'New profiles added every single day' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4 bg-background border border-white/10 rounded-xl px-5 py-3">
                      <span className="text-primary font-bold text-lg w-16 flex-shrink-0">{item.stat}</span>
                      <span className="text-muted-foreground text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
                <Button className="bg-primary text-primary-foreground font-bold px-8 h-11" asChild>
                  <a href="#register">Join the Platform →</a>
                </Button>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Who Are Our Clients?
                </h3>
                <div className="space-y-4">
                  {CLIENT_TYPES.map((c) => (
                    <div key={c.label} className="bg-background border border-white/10 rounded-xl p-4">
                      <div className="text-white font-semibold text-sm mb-1">{c.label}</div>
                      <div className="text-muted-foreground text-xs leading-relaxed">{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust badges ── */}
        <section className="py-14 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { icon: Shield, title: '100% Private & Discreet', desc: 'Your identity is never revealed. All profiles and conversations are completely confidential.' },
                { icon: Star, title: 'Verified Women Only', desc: 'All women profiles in Kolkata are manually reviewed and verified before publishing.' },
                { icon: Clock, title: 'Free Registration', desc: 'Sign up in 2 minutes and start browsing profiles in Kolkata instantly.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Areas covered ── */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                Local Areas in <span className="text-primary">Kolkata</span> We Serve
              </h2>
              <p className="text-muted-foreground">Women registered from every major locality in Kolkata city.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {AREAS.map((area) => (
                <a
                  key={area}
                  href="#register"
                  className="inline-flex items-center gap-1.5 bg-background border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-white cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-primary" />
                  {area}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Client &amp; Candidate <span className="text-primary">FAQs</span>
              </h2>
              <p className="text-muted-foreground">Everything you need to know about gigolo services and call boy jobs in Kolkata.</p>
            </div>
            <div className="space-y-3">
              {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>

        {/* ── SEO content ── */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8">
              Gigolo Jobs in Kolkata — Complete Guide
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-muted-foreground text-sm leading-relaxed">
              <div>
                <h3 className="text-white font-semibold text-base mb-3">What is a Gigolo Job in Kolkata?</h3>
                <p className="mb-5">A gigolo in Kolkata is a male companion who meets lonely, divorced, widowed or single women for paid companionship. Gigolomeet.in connects verified men with women across Salt Lake, Ballygunge, Park Street and other areas who seek genuine company and are willing to pay ₹5,000–₹20,000 per meeting.</p>
                <h3 className="text-white font-semibold text-base mb-3">Call Boy Jobs in Kolkata</h3>
                <p>Call boy and playboy jobs in Kolkata are in high demand. Many women — especially professionals, divorced women and widows in areas like New Town and Gariahat — are looking for discreet, paid male companionship through trusted platforms like Gigolomeet.in.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold text-base mb-3">Male Escort Jobs — Kolkata</h3>
                <p className="mb-5">Male escort and gigolo services in Kolkata are completely private. Your name, photo and contact are visible only to matched women members. Register free to get started today.</p>
                <h3 className="text-white font-semibold text-base mb-3">Playboy Jobs in Kolkata</h3>
                <p>Playboy model opportunities in Kolkata span luxury dates, cultural events, hotel companionship and outstation travel. The profession empowers men to build careers with dignity, full autonomy, and substantial income — all through our verified, secure platform.</p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs mt-8 border-t border-white/10 pt-6">
              This content provides general information and should not be considered legal or professional advice. All services are based on mutual consent and professionalism.
            </p>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center bg-card border border-primary/20 rounded-3xl p-10">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
                <Sparkles className="w-3.5 h-3.5 mr-2" /> Join the Largest Community in Kolkata
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Ready to Experience Premium Companionship or Start Your Career?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Whether you are a woman seeking an elite male companion or a talented individual looking for rewarding gigolo jobs in Kolkata — you've come to the right place.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-background border border-white/10 rounded-xl p-5">
                  <div className="text-primary font-bold mb-2">For Clients</div>
                  <p className="text-muted-foreground text-sm">Book a charming and professional male companion today for a truly exceptional experience in Kolkata.</p>
                </div>
                <div className="bg-background border border-white/10 rounded-xl p-5">
                  <div className="text-primary font-bold mb-2">For Candidates</div>
                  <p className="text-muted-foreground text-sm">Explore lucrative call boy, playboy, and gigolo job opportunities that offer financial freedom and career growth.</p>
                </div>
              </div>
              <Button size="lg" className="bg-primary text-primary-foreground font-bold text-base px-12 h-13" asChild>
                <a href="#register">Register Now — It's Free →</a>
              </Button>
            </div>
          </div>
        </section>

        <HowItWorks />
        <EarningsOpportunity />
        <PricingPlans />
        <RegisterSection />
      </main>
      <Footer />
    </div>
  );
}
