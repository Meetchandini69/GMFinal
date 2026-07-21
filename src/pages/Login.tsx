import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Crown, KeyRound, LogIn } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const [, navigate] = useLocation();
  const [loginData, setLoginData] = useState({ phone: '', password: '' });
  const [step, setStep] = useState<'form' | 'submitting' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    apiFetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.role === 'user') navigate('/dashboard');
        if (data.role === 'admin') navigate('/admin');
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitting');
    setErrorMsg('');
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: loginData.phone, password: loginData.password }),
        credentials: 'include',
      });
      if (res.ok) {
        navigate('/dashboard');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Invalid credentials');
        setStep('error');
      }
    } catch {
      setErrorMsg('Connection error. Please try again.');
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Crown className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-serif text-2xl font-bold text-white">
              GigoloMeet<span className="text-primary">.in</span>
            </span>
          </Link>
        </div>

        <div className="bg-card rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Member Login</h1>
              <p className="text-muted-foreground text-sm">Access your account dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Registered Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+91</span>
                <Input
                  type="tel"
                  placeholder="10-digit number"
                  value={loginData.phone}
                  onChange={e => setLoginData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className="h-12 pl-12 bg-background border-white/10 text-white"
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
                className="h-12 bg-background border-white/10 text-white"
                required
              />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={step === 'submitting'}
              className="w-full h-12 bg-primary text-black font-bold gold-glow"
            >
              {step === 'submitting' ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Login to My Account
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Not yet a member?{' '}
            <Link href="/" className="text-primary hover:underline font-medium">Register free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
