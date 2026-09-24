import { MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RegisterSection() {
  return <section id="register" className="py-24 bg-card border-t border-white/5 scroll-mt-24">
    <div className="container mx-auto px-4 md:px-6 max-w-5xl">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-primary text-sm font-semibold mb-4">Choose your plan and create your account</p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Ready to Join? <span className="text-gradient-gold">Get Started.</span></h2>
          <p className="text-muted-foreground leading-relaxed mb-6">Select your joining plan and create your login details. Complete your profile to open your member panel, then send your profile link to our official team on Telegram for verification. Joining fees are required.</p>
          <Button asChild className="h-auto min-h-12 py-3 whitespace-normal bg-primary text-primary-foreground font-bold">
            <a href="/free-registration"><MessageCircle className="w-5 h-5 mr-2 shrink-0" />Join &amp; Earn Now<ArrowRight className="w-5 h-5 ml-2 shrink-0" /></a>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">Your account is created without waiting for login approval. Photos and chat remain locked until payment is confirmed.</p>
        </div>
        <ol className="space-y-5 bg-background border border-white/10 rounded-3xl p-6 md:p-8">
          {[
            ['Choose a plan', 'Select a joining plan and enter your phone number, email and password.'],
            ['Create your profile', 'Complete your details and submit to open your own member panel.'],
            ['Send your details on Telegram', 'Use the highlighted button in your panel to send your profile link to our official team for verification and joining-fee guidance.'],
          ].map(([title, description], i) => <li key={title} className="flex gap-4">
            <span className="shrink-0 w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">{i + 1}</span>
            <div><h3 className="text-white font-semibold mb-1">{title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{description}</p></div>
          </li>)}
        </ol>
      </div>
    </div>
  </section>;
}
