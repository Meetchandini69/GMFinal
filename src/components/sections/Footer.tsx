import React from 'react';
import { Crown, Mail, MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-[#050505] pt-20 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-6">
              <Crown className="w-8 h-8 text-primary" />
              <span className="font-serif text-2xl font-bold text-white">
                GigoloMeet<span className="text-primary">.in</span>
              </span>
            </a>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              India's most trusted Gigolo job platform. We connect lonely, verified women with charming men seeking to earn through companionship. Free registration. Complete privacy.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-background cursor-pointer transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-background cursor-pointer transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'How It Works', 'Gigolo Membership Plans', 'Register as Gigolo', 'Login', 'View Women Profiles'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {['About Us', 'Privacy Policy', 'Terms of Service', 'Refund Policy', 'Contact Support'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">Gigolo Jobs By City</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Jaipur'].map((city) => (
                <a
                  key={city}
                  href="#"
                  className="bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white px-3 py-1 rounded text-xs transition-colors"
                >
                  {city}
                </a>
              ))}
            </div>
            <div>
              <Button className="w-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-background font-semibold" asChild>
                <a href="#register">Register Free — Start Earning</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <p className="text-muted-foreground text-sm flex items-center">
              &copy; {new Date().getFullYear()} Gigolomeet.in. Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> in India.
            </p>
            <p className="text-muted-foreground text-xs">
              For adults 18+ only. All activity is legal, consensual, and between willing adults.
            </p>
          </div>

          <div className="bg-background/50 rounded-lg p-4 border border-white/5">
            <p className="text-[10px] md:text-xs text-gray-500 text-justify leading-relaxed">
              <strong>DISCLAIMER:</strong> Gigolomeet.in is an adult companionship platform intended exclusively for consenting adults aged 18 years and above. All members and profiles on this platform are independent individuals. We act merely as an advertising and connection medium between consenting adults. We do not promote, condone, or facilitate any illegal activities, prostitution, or human trafficking. Users are solely responsible for their communications, interactions, and any arrangements made off the platform. By using this site, you confirm you are 18+ and agree to our Terms of Service and Privacy Policy. If you do not agree, please exit this site immediately.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
