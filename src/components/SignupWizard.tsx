import { useEffect, useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import ProfileFields, { type Profile } from '@/components/ProfileFields';
import SupportCall from '@/components/SupportCall';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PLANS = [['1 Month Plan', 'Rs. 2,500'], ['2 Months Plan', 'Rs. 4,000'], ['6 Months Plan', 'Rs. 9,000'], ['1 Year Plan', 'Rs. 12,000']];
export default function SignupWizard() {
  const [, navigate] = useLocation();
  const [stage, setStage] = useState<'plan' | 'account' | 'profile'>('plan');
  const [plan, setPlan] = useState('');
  const [account, setAccount] = useState({ mobile: '', email: '', password: '', confirm_password: '' });
  const [profile, setProfile] = useState<Profile>({});
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch('/api/auth/me');
        if (!me.ok) throw new Error('Unable to load registration. Please refresh and try again.');
        const auth = await me.json();
        if (auth.role === 'user') { navigate('/dashboard'); return; }
        if (auth.role === 'admin') { setError('Log out of your admin account before creating a member account.'); return; }
        const res = await apiFetch('/api/signup/draft');
        if (!res.ok) throw new Error('Unable to resume registration. Please refresh and try again.');
        const draft = await res.json();
        if (draft) { setProfile(draft); setPlan(draft.joining_plan); setStage('profile'); }
      } catch (e) { setError((e as Error).message); }
      finally { setLoading(false); }
    })();
  }, []);
  const start = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (account.password !== account.confirm_password) throw new Error('Passwords must match.');
      const res = await apiFetch('/api/signup/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...account, plan }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to continue.');
      setProfile({ mobile: account.mobile, email: account.email, joining_plan: plan });
      setAccount(a => ({ ...a, password: '', confirm_password: '' }));
      setStage('profile'); window.scrollTo(0, 0);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  const complete = async () => {
    setBusy(true); setError('');
    try {
      const res = await apiFetch('/api/signup/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...profile, adult_confirmed: adult }) });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) setStage('account');
        throw new Error(data.error || 'Unable to create your account.');
      }
      navigate('/dashboard');
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  return <>
    <p className="text-primary text-center mb-6">{stage === 'plan' ? 'Choose your joining plan' : stage === 'account' ? 'Step 1: Login details' : 'Step 2: Create your profile'}</p>
    {error && <p role="alert" className="text-red-400 border border-red-400/30 p-3 mb-4 rounded-lg">{error}</p>}
    {loading ? <p>Loading registration...</p> : <>
      {stage === 'plan' && <>
        <fieldset className="grid sm:grid-cols-2 gap-4"><legend className="sr-only">Joining plan</legend>
          {PLANS.map(([value, price]) => <label key={value} className={`cursor-pointer rounded-xl border p-5 ${plan === value ? 'border-primary bg-primary/10' : 'border-white/20'}`}>
            <input type="radio" name="plan" value={value} checked={plan === value} onChange={() => setPlan(value)} className="mr-3 accent-primary" />
            <span className="font-bold">{value}</span><span className="block text-primary text-xl mt-3">{price}</span>
          </label>)}
        </fieldset>
        <Button disabled={!plan} onClick={() => setStage('account')} className="mt-6 w-full">Next: Login Details</Button>
      </>}
      {stage === 'account' && <form onSubmit={start} className="space-y-5">
        <p className="text-primary font-semibold">Selected plan: {plan}</p>
        <fieldset disabled={busy} className="space-y-4">
          <label className="block">Telegram phone number<Input required type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} value={account.mobile} onChange={e => setAccount(a => ({ ...a, mobile: e.target.value.replace(/\D/g, '') }))} placeholder="10-digit Indian phone number" autoComplete="tel-national" /></label>
          <label className="block">Email<Input required type="email" maxLength={254} value={account.email} onChange={e => setAccount(a => ({ ...a, email: e.target.value }))} autoComplete="email" /></label>
          <label className="block">Password<Input required type="password" minLength={8} maxLength={72} value={account.password} onChange={e => setAccount(a => ({ ...a, password: e.target.value }))} autoComplete="new-password" /></label>
          <label className="block">Confirm password<Input required type="password" value={account.confirm_password} onChange={e => setAccount(a => ({ ...a, confirm_password: e.target.value }))} autoComplete="new-password" /></label>
          <p className="text-sm text-muted-foreground">Use your phone number and password to log in after submitting your profile.</p>
          <div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={() => setStage('plan')}>Change plan</Button><Button type="submit">{busy ? 'Please wait...' : 'Proceed to Second Step'}</Button></div>
        </fieldset>
      </form>}
      {stage === 'profile' && <fieldset disabled={busy}>
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-3"><SupportCall /></div>
        <ProfileFields profile={profile} editing update={(key, value) => setProfile(p => ({ ...p, [key]: value }))} uploadEndpoint="/api/signup/photo" lockAccount />
        <label className="flex gap-3 items-start mt-6"><input type="checkbox" checked={adult} onChange={e => setAdult(e.target.checked)} className="mt-1" /><span>I confirm I am 18 or older and understand that joining fees are required for registration and access.</span></label>
        <Button disabled={busy || !adult} onClick={complete} className="w-full mt-6">{busy ? 'Creating your account...' : 'Submit Profile & Open My Panel'}</Button>
      </fieldset>}
    </>}
  </>;
}
