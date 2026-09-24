import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CITIES = [
  "Coimbatore", "Chennai", "Madurai", "Trichy", "Salem",
  "Tirunelveli", "Erode", "Vellore",
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune",
  "Kolkata", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Chandigarh",
  "Nagpur", "Indore", "Bhopal", "Visakhapatnam", "Other"
];

const AGE_RANGES = ["18–22", "23–27", "28–32", "33–38", "39–45", "46–50"];

type Step = 'form' | 'submitting';

export function RegistrationForm() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({ name: '', phone: '', telegram_username: '', city: '', age: '' });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  const validate = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) newErrors.name = 'Enter your name';
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid 10-digit mobile number';
    if (!/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(formData.telegram_username.trim().replace(/^@/, ''))) newErrors.telegram_username = 'Enter your Telegram username (5-32 letters, numbers or underscores, starting with a letter)';
    if (!formData.city) newErrors.city = 'Select your city';
    if (!formData.age) newErrors.age = 'Select your age range';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep('submitting');

    try {
      const res = await apiFetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.phone,
          telegram_username: formData.telegram_username.trim().replace(/^@/, ''),
          city: formData.city,
          age: formData.age,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.field === 'telegram_username') {
          setErrors({ telegram_username: data.error });
        } else if (data.field === 'phone') {
          setErrors({ phone: data.error || 'Registration failed. Please try again.' });
        } else {
          setErrors({ name: data.error || 'Registration failed. Please try again.' });
        }
        setStep('form');
        return;
      }
    } catch {
      setErrors({ name: 'Network error. Please check your connection and try again.' });
      setStep('form');
      return;
    }

    navigate('/registration-thank-you');
  };

  return (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Your Name *</label>
                        <Input
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                          className="h-12 bg-card border-white/10 text-white placeholder:text-muted-foreground focus:border-primary"
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="register-phone" className="block text-sm font-medium text-white mb-2">Telegram Phone Number *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+91</span>
                          <Input
                            id="register-phone"
                            type="tel"
                            inputMode="numeric"
                            required
                            aria-describedby="telegram-phone-help"
                            placeholder="10-digit Telegram phone number"
                            value={formData.phone}
                            onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                            className="h-12 bg-card border-white/10 text-white placeholder:text-muted-foreground focus:border-primary pl-12"
                          />
                        </div>
                        <p id="telegram-phone-help" className="text-muted-foreground text-xs mt-2">Required: enter the phone number linked to your Telegram account.</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button type="button" className="text-primary text-xs underline underline-offset-4 mt-1">Why Telegram?</button>
                          </DialogTrigger>
                          <DialogContent className="w-[calc(100%-2rem)] max-w-md">
                            <DialogHeader>
                              <DialogTitle>Why Telegram?</DialogTitle>
                              <DialogDescription>Use Telegram to stay in touch with our team about your registration.</DialogDescription>
                            </DialogHeader>
                            <ul className="list-disc pl-5 space-y-3 text-sm text-muted-foreground">
                              <li>Keep registration updates and support conversations together.</li>
                              <li>Your username helps our team find the right account and contact you.</li>
                              <li>Return to the conversation whenever you need to check instructions or ask for help.</li>
                            </ul>
                            <p className="text-sm text-muted-foreground">Enter the phone number and username from the same Telegram account. Find or create your username in Telegram Settings.</p>
                          </DialogContent>
                        </Dialog>
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label htmlFor="register-telegram" className="block text-sm font-medium text-white mb-2">Telegram ID (Username) *</label>
                        <Input
                          id="register-telegram"
                          required
                          autoCapitalize="none"
                          spellCheck={false}
                          placeholder="@your_username"
                          value={formData.telegram_username}
                          onChange={e => setFormData(p => ({ ...p, telegram_username: e.target.value }))}
                          aria-describedby="telegram-username-help"
                          aria-invalid={!!errors.telegram_username}
                          className="h-12 bg-card border-white/10 text-white placeholder:text-muted-foreground focus:border-primary"
                        />
                        <p id="telegram-username-help" className="text-muted-foreground text-xs mt-2">Required: open Telegram Settings, then Username. Enter your @username, not your display name.</p>
                        {errors.telegram_username && <p role="alert" className="text-red-400 text-xs mt-1">{errors.telegram_username}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Your City *</label>
                          <Select value={formData.city} onValueChange={v => setFormData(p => ({ ...p, city: v }))}>
                            <SelectTrigger className="h-12 bg-card border-white/10 text-white">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-white/10">
                              {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Your Age *</label>
                          <Select value={formData.age} onValueChange={v => setFormData(p => ({ ...p, age: v }))}>
                            <SelectTrigger className="h-12 bg-card border-white/10 text-white">
                              <SelectValue placeholder="Age range" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-white/10">
                              {AGE_RANGES.map(a => <SelectItem key={a} value={a}>{a} yrs</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={step === 'submitting'}
                        className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold gold-glow mt-2"
                      >
                        {step === 'submitting' ? (
                          <span className="flex items-center gap-3">
                            <span className="h-5 w-5 rounded-full border-2 border-background border-t-transparent animate-spin" />
                            Submitting Your Registration...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Submit Free Registration
                            <ArrowRight className="w-5 h-5" />
                          </span>
                        )}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground">
                        By registering you confirm you are 18+ and agree to our{' '}
                        <a href="#" className="text-primary hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                      </p>
                    </form>
  );
}
