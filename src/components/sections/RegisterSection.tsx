import { MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEAM_TELEGRAM_LINK } from '@/lib/telegram';

export function RegisterSection() {
  return <section id="register" className="py-24 bg-card border-t border-white/5 scroll-mt-24">
    <div className="container mx-auto px-4 md:px-6 max-w-5xl">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-primary text-sm font-semibold mb-4">Your first step starts on Telegram</p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Ready to Join? <span className="text-gradient-gold">Let's Talk.</span></h2>
          <p className="text-muted-foreground leading-relaxed mb-6">Message our official Gigolo team on Telegram to get started. We'll guide you through the process and send you the Free Registration page link in our chat.</p>
          <Button asChild className="h-auto min-h-12 py-3 whitespace-normal bg-primary text-primary-foreground font-bold">
            <a href={TEAM_TELEGRAM_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-5 h-5 mr-2 shrink-0" />Join &amp; Earn Now<ArrowRight className="w-5 h-5 ml-2 shrink-0" /></a>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">The greeting is prefilled. Tap Send in Telegram to start the conversation with @Gigolomeetofficial.</p>
        </div>
        <ol className="space-y-5 bg-background border border-white/10 rounded-3xl p-6 md:p-8">
          {[
            ['Message our team', 'Open Telegram and send: Hi I am interested in Gigolo service.'],
            ['Receive your registration link', 'Our team will share the Free Registration page with you in the chat.'],
            ['Register and stay in touch', 'Complete the form using the same Telegram account details. Stay active on Telegram for our reply and your login details.'],
          ].map(([title, description], i) => <li key={title} className="flex gap-4">
            <span className="shrink-0 w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">{i + 1}</span>
            <div><h3 className="text-white font-semibold mb-1">{title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{description}</p></div>
          </li>)}
        </ol>
      </div>
    </div>
  </section>;
}
