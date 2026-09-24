import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Navbar, Footer } from '@/components/sections';
import { Button } from '@/components/ui/button';

export default function RegistrationThankYou() {
  useEffect(() => { document.title = 'Thank You for Registering | GigoloMeet'; window.scrollTo(0, 0); }, []);
  return <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="pt-36 pb-24 px-4 md:px-6">
      <div className="max-w-xl mx-auto text-center rounded-3xl bg-card border border-white/10 p-6 sm:p-10">
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-serif font-bold text-white mb-5">Thank You for Registering!</h1>
        <p className="text-muted-foreground leading-relaxed">Your registration has been submitted successfully. Our team will review your details and get back to you soon on Telegram with your login details.</p>
        <p className="text-primary font-semibold mt-5 mb-8">Stay active on Telegram and keep an eye on your chat with our official team.</p>
        <Button asChild><a href="/">Back to Home</a></Button>
      </div>
    </main>
    <Footer />
  </div>;
}
