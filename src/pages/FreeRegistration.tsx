import { useEffect } from 'react';
import { Navbar, Footer } from '@/components/sections';
import SignupWizard from '@/components/SignupWizard';
import JoiningFeeNotice from '@/components/JoiningFeeNotice';

export default function FreeRegistration() {
  useEffect(() => { document.title = 'Registration | GigoloMeet'; window.scrollTo(0, 0); }, []);
  return <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Create Your Member Account</h1>
          <p className="text-muted-foreground">Choose your joining plan, set your login details, then complete your profile. Payment and Telegram verification are required for member access.</p>
        </div>
        <JoiningFeeNotice />
        <div className="bg-card border border-white/10 rounded-3xl p-5 sm:p-8"><SignupWizard /></div>
      </div>
    </main>
    <Footer />
  </div>;
}
