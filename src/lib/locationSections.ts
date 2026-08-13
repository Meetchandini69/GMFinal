export type SectionFeature = { title: string; description: string };
export type SectionPlan = { type: string; range: string; per: string; description: string };
export type SectionFaq = { question: string; answer: string };
export type SectionGuideBlock = { title: string; body: string };

export type PageSections = {
  overview?: { heading?: string; intro?: string; body1?: string; body2?: string; features?: SectionFeature[] };
  gallery?: { heading?: string; intro?: string };
  whyChooseUs?: { heading?: string; intro?: string; features?: SectionFeature[] };
  benefits?: { heading?: string; intro?: string; plans?: SectionPlan[]; highlights?: string[] };
  opportunities?: { heading?: string; intro?: string; memberTypes?: SectionFeature[] };
  trust?: { features?: SectionFeature[] };
  areasIntro?: { heading?: string; intro?: string };
  faqs?: { heading?: string; intro?: string; items?: SectionFaq[] };
  guide?: { heading?: string; leftBlocks?: SectionGuideBlock[]; rightBlocks?: SectionGuideBlock[] };
  cta?: { heading?: string; intro?: string };
};
