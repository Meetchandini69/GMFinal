import { useEffect } from 'react';
import { Navbar, Footer } from '@/components/sections';
import { RegistrationForm } from '@/components/RegistrationForm';

export default function FreeRegistration() {
  useEffect(() => { document.title = 'Free Registration | GigoloMeet'; window.scrollTo(0, 0); }, []);
  return <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Free Registration</h1>
          <p className="text-muted-foreground">Welcome! Complete your details below using the same Telegram account you used to contact our official team.</p>
        </div>
        <div className="bg-card border border-white/10 rounded-3xl p-5 sm:p-8"><RegistrationForm /></div>
      </div>
    </main>
    <Footer />
  </div>;
}
