import { Phone } from 'lucide-react';

export default function SupportCall() {
  return <div className="text-center text-sm">
    <p className="text-muted-foreground mb-1">Any questions or doubts? Call us directly.</p>
    <a href="tel:+918327512369" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-primary font-bold hover:underline focus-visible:outline-2 focus-visible:outline-primary">
      <Phone className="w-4 h-4" aria-hidden="true" />SK Abbas — 8327512369
    </a>
  </div>;
}
