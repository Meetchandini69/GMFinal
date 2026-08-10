export type LocationContent = Record<string, any>;
export type LocationLinks = Record<string, string>;

export function getDefaultLocationContent(city: string, areas: string[] = []): LocationContent {
  const localAreas = areas.length > 0 ? areas : [`Central ${city}`, `${city} North`, `${city} South`];

  return {
    hero: {
      badge: `${city}, India`,
      title: `Gigolo Service in ${city}`,
      titleLine2: 'Premier Male Escort & Call Boy Jobs',
      description: `Discover professional companionship opportunities in ${city} across ${localAreas.slice(0, 3).join(', ')} and surrounding areas.`,
      primaryCtaText: 'Register Free — Start Today →',
      secondaryCtaText: 'View Areas We Serve',
    },
    overview: {
      title: `Understanding Companionship in ${city}`,
      intro: `Gigolomeet.in connects adults seeking respectful, consensual companionship with verified members in ${city}. Build your profile, choose your schedule, and connect privately.`,
      body: `Our professional network helps members discover discreet, premium companionship opportunities across ${city}. Whether you are exploring event companionship, social dates, or a flexible new career path, clear communication and mutual respect come first.`,
      body2: `Create a polished profile, set your boundaries, and connect with people who are looking for genuine company in ${city}. Every interaction should be professional, private, and consensual.`,
      cards: [
        { title: 'Earning Potential', description: 'Explore flexible opportunities based on your availability and experience.' },
        { title: 'Flexible Schedule', description: 'Choose the times and types of companionship that suit your lifestyle.' },
        { title: 'Professional Network', description: `Discover local opportunities and connections across ${city}.` },
      ],
    },
    gallery: {
      title: `Members in ${city}`,
      description: `Discover verified members looking for professional companionship in ${city}. Register free to unlock full profiles and start a conversation.`,
      profiles: [
        { name: 'Verified Member', status: 'Available now', reward: 'Flexible companionship' },
        { name: 'Verified Member', status: 'Online today', reward: 'Professional & discreet' },
        { name: 'Verified Member', status: 'Available weekends', reward: 'Events & travel' },
        { name: 'Verified Member', status: 'Responds quickly', reward: 'Private connections' },
      ],
      buttonText: `View All ${city} Profiles →`,
      profileButtonText: 'Message Member',
    },
    why: {
      title: `Why Choose Gigolomeet.in in ${city}?`,
      description: 'A professional, private platform for meaningful local connections and flexible companionship opportunities.',
      cards: [
        { title: 'Privacy & Confidentiality', description: 'Keep your profile and conversations private while you decide who to connect with.' },
        { title: 'Verified Community', description: 'Profiles are reviewed to help create a more trustworthy experience for everyone.' },
        { title: 'Flexible Opportunities', description: 'Choose from social events, travel, dates, and other professional companionship arrangements.' },
        { title: 'Respectful Connections', description: 'Set clear boundaries and connect with people who value professionalism and mutual consent.' },
      ],
    },
    earnings: {
      title: `Benefits of Companionship Jobs in ${city}`,
      description: 'Build a flexible professional path with opportunities designed around your schedule and comfort.',
      tiers: [
        { type: 'Event Companionship', range: '₹5,000 – ₹15,000', per: 'per event', description: 'Corporate events, weddings, social gatherings' },
        { type: 'Travel Companionship', range: '₹10,000 – ₹25,000', per: 'per day', description: 'Outstation trips and weekend getaways' },
        { type: 'Personalised Sessions', range: '₹7,000 – ₹20,000', per: 'per session', description: 'One-to-one companionship and dates' },
      ],
      benefits: ['High earning potential', 'Flexible working hours', 'Professional growth and networking', 'Health, safety, and privacy focus'],
    },
    demand: {
      title: `Local Opportunities in ${city}`,
      description: `The demand for professional companionship continues to grow in ${city}. A complete profile helps people discover your availability and interests.`,
      clientTitle: 'Who are our members?',
      clientTypes: ['Busy professionals', 'Single adults', 'Visitors and travellers', 'People seeking social companions'],
    },
    trust: {
      cards: [
        { title: 'Private & Discreet', description: 'Your profile and conversations remain under your control.' },
        { title: 'Verified Members', description: 'Profiles are reviewed before they are published.' },
        { title: 'Free Registration', description: 'Create your profile in minutes and start exploring.' },
      ],
    },
    areas: {
      title: `Local Areas in ${city} We Serve`,
      description: `Members from major localities across ${city}.`,
    },
    faq: {
      title: `Local FAQs`,
      description: `Everything you need to know about opportunities in ${city}.`,
      items: [
        { question: 'How do I get started in a gigolo job?', answer: 'Register free, complete your professional profile, and go through our verification process. Once approved, you can start receiving connection requests from people in your city.' },
        { question: 'Is the platform safe and confidential?', answer: 'We prioritise privacy, clear boundaries, and consensual professional companionship. Keep conversations on the platform, verify who you meet, and always choose a safe public location for a first meeting.' },
        { question: 'What kind of opportunities are available?', answer: 'Members can explore event companionship, travel companionship, social dates, and private one-to-one companionship based on their schedule and boundaries.' },
        { question: 'How much can I earn?', answer: 'Earnings vary by experience, availability, service type, and agreement with the client. Use the earning ranges on this page as general examples rather than guaranteed income.' },
        { question: 'Which areas do you serve?', answer: 'We connect members across the major localities listed below, as well as nearby areas. Your profile can mention the locations where you are comfortable working.' },
      ],
    },
    seo: {
      title: `Companionship Opportunities in ${city} — Complete Guide`,
      column1Title: 'What is a companionship job?',
      column1Text: `A professional companion provides respectful company for social occasions, dates, travel, and other mutually agreed activities. Members in ${city} can create a profile that describes their interests, availability, and boundaries.`,
      column1Subtitle: 'How to build a profile',
      column1Text2: 'Use a clear photo, write an honest introduction, and explain what makes you a great companion. Good communication and reliability help build lasting professional connections.',
      column2Title: `Male companion opportunities in ${city}`,
      column2Text: `Members can explore opportunities around ${localAreas.slice(0, 3).join(', ')} and nearby localities. Availability, rates, and arrangements should always be discussed clearly before meeting.`,
      column2Subtitle: 'Safety and discretion',
      column2Text2: 'Keep personal information private, verify new contacts, share your plans with someone you trust, and meet first in a safe public place. All arrangements should be legal, consensual, and professional.',
      disclaimer: 'This content provides general information and is not legal or professional advice. All services are based on mutual consent and professionalism.',
    },
    finalCta: {
      badge: `Join the ${city} Community`,
      title: 'Ready to start your journey?',
      description: `Create your profile and discover professional companionship opportunities in ${city}.`,
      buttonText: "Register Now — It's Free →",
    },
    earningsOpportunity: {
      badge: '💰 Life-Changing Income Opportunity',
      title: `Earn ₹20,000 to ₹2,00,000 Per Month Doing Gigolo Job in ${city}`,
      description: `Discover flexible, discreet companionship opportunities for members in ${city}.`,
      benefits: ['No experience required — just be presentable & confident', 'Choose which opportunities to accept and when', `Work locally in ${city} or accept travel assignments`, 'Zero investment — registration is 100% free', 'Clear arrangements and reliable communication', 'Complete identity protection at all times'],
      ctaText: 'Apply for Gigolo Job — Free',
    },
    pricing: {
      title: 'Choose Your Gigolo Membership',
      description: 'Select the membership duration that works best for you and complete your profile after registration.',
      footer: 'Complete registration first, then choose any one membership plan from your dashboard.',
    },
    register: {
      badge: 'Free Registration — Takes 2 Minutes',
      title: 'Start Your Gigolo Career Today',
      description: `Register now and get your ${city} profile live within 24 hours.`,
      buttonText: 'Register Free — Start Earning',
      termsText: 'Terms of Service',
      privacyText: 'Privacy Policy',
    },
    howItWorks: {
      title: 'How It Works',
      description: 'Simple. Secure. Rewarding. Start earning or start meeting in three easy steps.',
      gigolosLabel: '💰 For Gigolos (Men Earning)',
      womenLabel: '💖 For Women (Seeking Company)',
      gigolos: [
        { title: 'Register Free in 2 Min', description: 'Fill a simple form with your name, city, age, and a short bio.' },
        { title: 'Get Verified & Go Live', description: 'Complete a quick ID check and get your verified profile live.' },
        { title: 'Receive Requests & Earn', description: 'Receive connection requests and agree on professional meeting details.' },
      ],
      women: [
        { title: 'Browse Gigolo Profiles', description: 'Search verified, charming men by city, age, and personality type.' },
        { title: 'Send a Connection Request', description: 'Send a message directly via our secure platform.' },
        { title: 'Plan & Enjoy Your Date', description: 'Agree on a time and place that suits you both.' },
      ],
    },
  };
}

export function getDefaultLocationLinks(): LocationLinks {
  return {
    home: '/',
    heroPrimary: '#register',
    heroSecondary: '#areas',
    galleryProfile: '#register',
    galleryAll: '#register',
    area: '#register',
    finalCta: '#register',
    earningsCta: '#register',
    pricingCta: '#register',
    terms: '#',
    privacy: '#',
  };
}

export function mergeLocationContent(city: string, areas: string[], content?: LocationContent): LocationContent {
  const defaults = getDefaultLocationContent(city, areas);
  if (!content || typeof content !== 'object') return defaults;
  return Object.keys(defaults).reduce((merged, section) => ({
    ...merged,
    [section]: {
      ...defaults[section],
      ...(content[section] && typeof content[section] === 'object' ? content[section] : {}),
    },
  }), {} as LocationContent);
}