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
