import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { UserPlus, CheckCircle, ArrowRight, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

type Step = 'form' | 'submitting' | 'success';

export function RegisterSection() {
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', age: '' });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  const validate = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) newErrors.name = 'Enter your name';
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid 10-digit mobile number';
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
          city: formData.city,
          age: formData.age,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ name: data.error || 'Registration failed. Please try again.' });
        setStep('form');
        return;
      }
    } catch {
      setErrors({ name: 'Network error. Please check your connection and try again.' });
      setStep('form');
      return;
    }

    setStep('success');
  };

  return (
    <section id="register" className="py-24 relative overflow-hidden bg-card border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background/0 to-background/0 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">

            {/* Left — copy */}
            <div className="lg:w-5/12 text-center lg:text-left">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                Free Registration — Takes 2 Minutes
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                Start Your <span className="text-gradient-gold">Gigolo Career</span> Today
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Register now and get your profile live within 24 hours. Women in your city will start sending meeting requests immediately.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  { icon: IndianRupee, text: "Earn ₹5,000–₹20,000 per meeting" },
                  { icon: CheckCircle, text: "100% free to register — zero risk" },
                  { icon: UserPlus, text: "Your identity stays fully private" },
                  { icon: ArrowRight, text: "Profile activated within 24 hours" },
                ].map(({ icon: Icon, text }, i) => (
                  <li key={i} className="flex items-center gap-3 text-white">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 p-4 bg-background rounded-xl border border-white/10">
                <div className="flex -space-x-2">
                  {['from-rose-500 to-pink-700', 'from-blue-500 to-indigo-700', 'from-emerald-500 to-teal-700', 'from-amber-500 to-orange-600'].map((c, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} border-2 border-background flex items-center justify-center text-white text-xs font-bold`}>
                      {['R', 'A', 'V', 'S'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-white">2,847 men</strong> registered this month
                </p>
              </div>
            </div>

            {/* Right — form / success */}
            <div className="lg:w-7/12 w-full">
              <div className="bg-background rounded-3xl border border-white/10 p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">

                {step === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-8 gap-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Registration Successful! 🎉</h3>
                      <p className="text-muted-foreground">
                        Welcome, <strong className="text-white">{formData.name}</strong>! Our team will review your profile and send login details to your registered number within <strong className="text-primary">24 hours</strong>.
                      </p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 w-full text-left">
                      <p className="text-primary font-semibold text-sm mb-2">✅ Next Steps:</p>
                      <ol className="text-muted-foreground text-sm space-y-1.5 list-decimal list-inside">
                        <li>Check your mobile for login credentials (within 24 hrs)</li>
                        <li>Complete your full profile after logging in</li>
                        <li>Submit for review and go live</li>
                      </ol>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-primary" />
                        Create Your Free Account
                      </h3>
                      <p className="text-muted-foreground text-sm">Fill in your details below — we'll activate your profile within 24 hours.</p>
                    </div>

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
                        <label className="block text-sm font-medium text-white mb-2">Mobile Number (WhatsApp) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">+91</span>
                          <Input
                            placeholder="10-digit mobile number"
                            value={formData.phone}
                            onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                            className="h-12 bg-card border-white/10 text-white placeholder:text-muted-foreground focus:border-primary pl-12"
                          />
                        </div>
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
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
                            Activating Your Profile...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Register Free — Start Earning
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
