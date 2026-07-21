import React, { useEffect } from 'react';
import {
  Navbar,
  Hero,
  CitiesCoverage,
  MemberGallery,
  WhyChooseUs,
  HowItWorks,
  EarningsOpportunity,
  PricingPlans,
  Testimonials,
  SeoContent,
  FaqSection,
  RegisterSection,
  Footer
} from '@/components/sections';

export default function Home() {
  useEffect(() => {
    document.title = "Gigolomeet.in — Gigolo Job in India | Earn ₹50K–₹2L/Month Meeting Women";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Register for a Gigolo job in India on Gigolomeet.in. Earn ₹50,000–₹2,00,000/month meeting divorced, single, and lonely women near you. Free registration. 100% private and discreet."
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <CitiesCoverage />
        <MemberGallery />
        <WhyChooseUs />
        <HowItWorks />
        <EarningsOpportunity />
        <PricingPlans />
        <Testimonials />
        <SeoContent />
        <FaqSection />
        <RegisterSection />
      </main>
      <Footer />
    </div>
  );
}
