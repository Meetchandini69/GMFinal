import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "What exactly is a Gigolo job?",
    answer: "A Gigolo is a man who provides companionship, emotional support, and social company to women in exchange for money. This includes activities like dinner dates, travel, outings, and private companionship. It is adult, consensual, and completely between two willing individuals. Gigolomeet.in simply connects them."
  },
  {
    question: "How much can I earn as a Gigolo?",
    answer: "Earnings depend on your city, availability, and how many meetings you take. Part-time gigolos (weekends only) typically earn ₹20,000–₹40,000/month. Full-time dedicated gigolos earn ₹80,000–₹2,00,000/month. Top performers in metros like Mumbai and Delhi earn even more with HNI clients."
  },
  {
    question: "Is gigolo work legal in India?",
    answer: "Yes. Providing paid adult companionship between consenting adults (18+) is not illegal under Indian law. We operate strictly as a classifieds and connection platform. We do not facilitate or promote anything beyond legal companionship. Always use good judgment and meet in safe public or private settings."
  },
  {
    question: "Who are the women on this platform?",
    answer: "Our female members are real, verified Indian women — including divorced ladies, widows, separated women, single professionals, and housewives who are lonely and looking for genuine male company. They are not fake profiles or bots. All profiles are ID-verified before activation."
  },
  {
    question: "What do I need to qualify as a Gigolo?",
    answer: "You need to be male, aged 18–50, presentable in appearance, reasonably well-spoken, and respectful. We do not require any special skills, degrees, or experience. A good personality, hygiene, and confidence are enough. We guide you through the rest after you register."
  },
  {
    question: "Is my identity safe? Will anyone find out?",
    answer: "Absolutely. Your real name, home address, workplace, and personal details are never shared with anyone. You choose a display name for your profile. All communication happens through our encrypted platform or an anonymous number. Your identity is 100% protected at every step."
  },
  {
    question: "How do I get my first meeting request?",
    answer: "Once your profile is verified and live, women in your city can see and contact you. Complete your profile with a good bio and clear photos to attract more requests. Gold members get priority placement and typically receive their first request within 1–3 days of going live."
  },
  {
    question: "How do I get paid? Is the money real?",
    answer: "Payment is fully between you and the woman client — cash, UPI, or bank transfer, as agreed. We don't take any percentage of your earnings. The money is 100% yours. There are no surprise deductions or hidden fees beyond the membership cost."
  },
];

export function FaqSection() {
  return (
    <section className="py-24 bg-card" id="faq">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground">
            Everything you want to know before starting your Gigolo journey.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQS.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-background border border-white/10 rounded-lg px-6 data-[state=open]:border-primary/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-white hover:text-primary py-4 hover:no-underline font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
