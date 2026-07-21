# Gigolomeet.in — Landing Page

Dark-luxury landing page for **Gigolomeet.in**, India's gigolo job platform.  
Targets men seeking gigolo jobs — showcasing women profiles, earnings (₹50K–₹2L/month), and driving male registration.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** (build tool)
- **Tailwind CSS v4** (dark luxury theme — gold `#D4AF37` + near-black `#0A0A0A`)
- **shadcn/ui** + **Radix UI** primitives
- **Wouter** (client-side routing)
- **Framer Motion** (animations)
- **Lucide React** + **React Icons**

## Getting Started

```bash
# Install dependencies
npm install
# or
pnpm install

# Start dev server (http://localhost:3000)
npm run dev

# Production build → dist/
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── App.tsx                        # Router setup
├── main.tsx                       # Entry point
├── index.css                      # Global styles + CSS variables + Google Fonts
├── pages/
│   ├── Home.tsx                   # Main page — renders all 13 sections
│   └── not-found.tsx              # 404 fallback
├── components/
│   ├── sections/                  # All 13 page sections
│   │   ├── Navbar.tsx             # Sticky nav + Login modal
│   │   ├── Hero.tsx               # Headline + city/age search + women peek
│   │   ├── CitiesCoverage.tsx     # 12 Indian cities with member counts
│   │   ├── MemberGallery.tsx      # 8 women profiles (teased, locked)
│   │   ├── WhyChooseUs.tsx        # 6 benefit cards for men
│   │   ├── HowItWorks.tsx         # Tabbed stepper (gigolos / women)
│   │   ├── EarningsOpportunity.tsx# Earning tiers ₹20K–₹2L+
│   │   ├── PricingPlans.tsx       # Free / Gold / Platinum membership
│   │   ├── Testimonials.tsx       # 4 male success stories
│   │   ├── SeoContent.tsx         # SEO-optimised content columns
│   │   ├── FaqSection.tsx         # 8 FAQs targeting men
│   │   ├── RegisterSection.tsx    # Registration form (id="register")
│   │   └── Footer.tsx             # Links + city tags + disclaimer
│   └── ui/                        # shadcn/ui components (unchanged)
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
└── lib/
    └── utils.ts                   # cn() helper
```

## Key Features

- **Always-dark** theme — gold `#D4AF37` accents, near-black `#0A0A0A` background
- **Playfair Display** (headings) + **Plus Jakarta Sans** (body) via Google Fonts
- **No real photos** — gradient CSS avatar initials for all profiles
- **No backend** — pure presentation; registration form shows a success state after 1.5 s
- **Login modal** — opens as a Dialog from the Navbar, no route needed
- **All CTAs** link to `#register` (scrolls to the registration form)
- **SPA routing** via Wouter (hash/path)

## Customisation

| What | Where |
|---|---|
| Brand colors | `src/index.css` — `--primary`, `--background`, `--foreground` |
| City list | `src/components/sections/CitiesCoverage.tsx` |
| Women profiles | `src/components/sections/MemberGallery.tsx` |
| Pricing plans | `src/components/sections/PricingPlans.tsx` |
| FAQs | `src/components/sections/FaqSection.tsx` |
| Registration form logic | `src/components/sections/RegisterSection.tsx` |
| Footer links / disclaimer | `src/components/sections/Footer.tsx` |
