import React, { useState, useEffect } from 'react';
import { Crown, Menu, X, LogIn, KeyRound } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocation } from 'wouter';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginData, setLoginData] = useState({ phone: '', password: '' });
  const [loginStep, setLoginStep] = useState<'form' | 'submitting' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Women Profiles', href: '#gallery' },
    { name: 'Earnings', href: '#register' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  const scrollTo = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollTo(href);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStep('submitting');
    setErrorMsg('');
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: loginData.phone, password: loginData.password }),
        credentials: 'include',
      });
      if (res.ok) {
        setIsLoginOpen(false);
        navigate('/dashboard');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Invalid credentials');
        setLoginStep('error');
      }
    } catch {
      setErrorMsg('Connection error. Please try again.');
      setLoginStep('error');
    }
  };

  const openLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setLoginStep('form');
    setErrorMsg('');
    setLoginData({ phone: '', password: '' });
    setIsLoginOpen(true);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <a href="#" onClick={(e) => { e.preventDefault(); scrollTo('#'); }} className="flex items-center gap-2 group">
              <Crown className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                GigoloMeet<span className="text-primary">.in</span>
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <ul className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 transition-colors"
                  onClick={openLogin}
                >
                  <LogIn className="w-4 h-4 mr-1.5" /> Login
                </Button>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors gold-glow font-bold"
                  onClick={(e) => { e.preventDefault(); scrollTo('#register'); }}
                >
                  Join &amp; Earn Now 💰
                </Button>
              </div>
            </nav>

            {/* Mobile Toggle */}
            <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-white/5 shadow-xl py-4 px-4 flex flex-col gap-4">
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
              <Button variant="outline" className="w-full border-primary text-primary" onClick={openLogin}>
                <LogIn className="w-4 h-4 mr-1.5" /> Login
              </Button>
              <Button
                className="w-full bg-primary text-primary-foreground font-bold"
                onClick={(e) => { e.preventDefault(); scrollTo('#register'); }}
              >
                Join &amp; Earn Now 💰
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={(open) => { setIsLoginOpen(open); if (!open) { setLoginStep('form'); setErrorMsg(''); } }}>
        <DialogContent className="sm:max-w-sm bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2 text-white">
              <KeyRound className="w-5 h-5 text-primary" />
              Member Login
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 py-2">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Registered Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+91</span>
                <Input
                  type="tel"
                  placeholder="10-digit number"
                  value={loginData.phone}
                  onChange={e => setLoginData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className="h-12 bg-background border-white/10 text-white placeholder:text-muted-foreground focus:border-primary pl-12"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                className="h-12 bg-background border-white/10 text-white placeholder:text-muted-foreground focus:border-primary"
                required
              />
            </div>
            {errorMsg && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{errorMsg}</p>
            )}
            <Button
              type="submit"
              disabled={loginStep === 'submitting'}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-1"
            >
              {loginStep === 'submitting' ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                  Signing in...
                </span>
              ) : 'Login to My Account'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Not registered yet?{' '}
              <button
                type="button"
                onClick={() => { setIsLoginOpen(false); setTimeout(() => scrollTo('#register'), 100); }}
                className="text-primary hover:underline font-medium"
              >
                Create free account →
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
