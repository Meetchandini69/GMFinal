import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import {
  Crown, CheckCircle, User, FileText, LogOut,
  Edit2, Save, Phone, Mail, MapPin,
  Calendar, Ruler, Weight, AlertCircle, Clock, Heart
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import PhotoUploader from '@/components/PhotoUploader';
import WomenTab from '@/components/WomenTab';
import { getImageUrl } from "@/lib/api";

type Profile = {
  user_id?: number;
  mobile?: string;
  full_name?: string;
  category?: string;
  date_of_birth?: string;
  height?: string;
  weight?: string;
  marks_on_face?: string;
  complexion?: string;
  state?: string;
  city?: string;
  city_area?: string;
  address?: string;
  email?: string;
  alt_mobile?: string;
  more_info?: string;
  joining_plan?: string;
  date_of_paying?: string;
  payment_mode?: string;
  photo_url?: string;
  member_status?: string;
  profile_step?: number;
  submitted_at?: string;
};

const STEPS = [
  { id: 0, label: 'Account Activated', icon: CheckCircle },
  { id: 1, label: 'Profile Updated', icon: User },
  { id: 2, label: 'Submitted for Review', icon: FileText },
];

const STATES = ['Tamil Nadu', 'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Other'];
const CITIES = ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Coimbatore', 'Pune', 'Lucknow', 'Other'];
const COMPLEXIONS = ['Very Fair', 'Fair', 'Wheatish', 'Brown', 'Dark'];
const CATEGORIES = ['Gigolo', 'Playboy', 'Male Escort'];
const PAYMENT_MODES = ['Google Pay (GPay)', 'PhonePe', 'PayTM', 'Bhim App', 'UPI'];

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'women'>('overview');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch('/api/auth/me', { credentials: 'include' });
      const me = await res.json();
      if (me.role !== 'user') { navigate('/login'); return; }

      const pRes = await apiFetch('/api/user/profile', { credentials: 'include' });
      if (pRes.ok) {
        const data = await pRes.json();
        setProfile(data);
      }
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await apiFetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
        credentials: 'include',
      });
      if (res.ok) {
        setSaveMsg('Profile saved successfully!');
        setEditing(false);
        setProfile(p => ({ ...p, profile_step: Math.max(p.profile_step || 0, 1) }));
      }
    } catch {
      setSaveMsg('Error saving. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 4000);
    }
  };

  const handleSubmitReview = async () => {
    if (!profile.full_name || !profile.city || !profile.joining_plan) {
      setSaveMsg('Please complete your profile before submitting for review.');
      setTimeout(() => setSaveMsg(''), 4000);
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/api/user/submit-review', { method: 'POST', credentials: 'include' });
      setProfile(p => ({ ...p, profile_step: 2, member_status: 'pending_review' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/');
  };

  const update = (key: keyof Profile, val: string) => setProfile(p => ({ ...p, [key]: val }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const step = profile.profile_step ?? 0;
  const statusColor: Record<string, string> = {
    inactive: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    pending_review: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    active: 'text-green-400 bg-green-400/10 border-green-400/30',
    suspended: 'text-red-400 bg-red-400/10 border-red-400/30',
  };
  const statusLabel: Record<string, string> = {
    inactive: 'Inactive Member',
    pending_review: 'Under Review',
    active: 'Active Member',
    suspended: 'Suspended',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            <span className="font-serif text-xl font-bold text-white">
              GigoloMeet<span className="text-primary">.in</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden sm:block">
              Hi <span className="text-white font-medium">+91 {profile.mobile}</span>
            </p>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-white">
              <LogOut className="w-4 h-4 mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">

        {/* ── Step Wizard ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-white/10 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-white font-bold text-lg mb-6">Account Setup Progress</h2>
          <div className="flex items-start gap-0">
            {STEPS.map((s, i) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      done ? 'bg-primary border-primary' :
                      active ? 'bg-primary/20 border-primary' :
                      'bg-white/5 border-white/20'
                    }`}>
                      {done
                        ? <CheckCircle className="w-5 h-5 text-black" />
                        : <s.icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                      }
                    </div>
                    <p className={`text-xs mt-2 text-center font-medium ${done || active ? 'text-white' : 'text-muted-foreground'}`}>
                      {s.label}
                    </p>
                    {active && (
                      <span className="text-[10px] text-primary bg-primary/10 rounded-full px-2 py-0.5 mt-1">Current</span>
                    )}
                    {done && (
                      <span className="text-[10px] text-green-400 bg-green-400/10 rounded-full px-2 py-0.5 mt-1">Done ✓</span>
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mt-5 mx-2 rounded transition-colors ${step > i ? 'bg-primary' : 'bg-white/10'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Step-specific message */}
          <div className="mt-6 rounded-xl p-4 border border-white/10 bg-background">
            {step === 0 && (
              <div className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm">🎉 Account Successfully Activated!</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your account is ready. Now complete your profile to get discovered by women clients.
                  </p>
                  <Button size="sm" className="mt-3 bg-primary text-black font-semibold" onClick={() => { setActiveTab('profile'); setEditing(true); }}>
                    Complete Profile Now →
                  </Button>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="flex gap-3 items-start">
                <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm">Profile Updated — Submit for Review</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your profile is filled. Submit it for admin review to go live and start receiving meeting requests.
                  </p>
                  <Button size="sm" className="mt-3 bg-primary text-black font-semibold" onClick={handleSubmitReview} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit for Review →'}
                  </Button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="flex gap-3 items-start">
                <Clock className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm">
                    {profile.member_status === 'active' ? '✅ Profile Approved & Live!' : '⏳ Profile Under Review'}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {profile.member_status === 'active'
                      ? 'Your profile is now live. Women in your city can see and contact you.'
                      : 'Our team is reviewing your profile. This usually takes 24–48 hours. You will be notified once approved.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'overview' ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'profile' ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
          >
            My Profile
          </button>
          {profile.member_status === 'active' && (
            <button
              onClick={() => setActiveTab('women')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'women' ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
            >
              <Heart className="w-3.5 h-3.5" />
              Available Women
            </button>
          )}
        </div>

        {/* ── Overview Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Status card */}
            <div className="bg-card border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Member Status</h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${statusColor[profile.member_status || 'inactive']}`}>
                {profile.member_status === 'active' ? '✅' : profile.member_status === 'pending_review' ? '⏳' : '⚠️'}
                {statusLabel[profile.member_status || 'inactive']}
              </div>
            </div>

            {/* Profile summary */}
            <div className="bg-card border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Your Profile</h3>
                <Button size="sm" variant="outline" onClick={() => { setActiveTab('profile'); setEditing(true); }}>
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
                </Button>
              </div>
              {profile.full_name ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Name', value: profile.full_name, icon: User },
                    { label: 'Mobile', value: `+91 ${profile.mobile}`, icon: Phone },
                    { label: 'Email', value: profile.email, icon: Mail },
                    { label: 'City', value: profile.city, icon: MapPin },
                    { label: 'Date of Birth', value: profile.date_of_birth, icon: Calendar },
                    { label: 'Height', value: profile.height ? `${profile.height} cm` : undefined, icon: Ruler },
                    { label: 'Weight', value: profile.weight ? `${profile.weight} kg` : undefined, icon: Weight },
                    { label: 'Complexion', value: profile.complexion, icon: User },
                    { label: 'Joining Plan', value: profile.joining_plan, icon: FileText },
                    { label: 'Payment Mode', value: profile.payment_mode, icon: FileText },
                  ].map(({ label, value, icon: Icon }) => value ? (
                    <div key={label} className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>
                        <span className="text-muted-foreground">{label}: </span>
                        <span className="text-white">{value}</span>
                      </span>
                    </div>
                  ) : null)}
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Profile not filled yet</p>
                    <p className="text-muted-foreground text-xs mt-1">Complete your profile to start getting client requests.</p>
                    <Button size="sm" className="mt-3 bg-primary text-black" onClick={() => { setActiveTab('profile'); setEditing(true); }}>
                      Fill Profile Now
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Joining info */}
            {profile.joining_plan && (
              <div className="bg-card border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4">Membership Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-white/5">
                      {[
                        ['Joining Fees', profile.joining_plan === 'CL Plan' ? '₹5,000 (CL Plan)' : '₹10,000 (PL Plan)'],
                        ['Date of Paying', profile.date_of_paying || '—'],
                        ['Payment Mode', profile.payment_mode || '—'],
                        ['Telegram', 'Pay on 7597246320'],
                      ].map(([k, v]) => (
                        <tr key={k}>
                          <td className="py-2 pr-4 text-muted-foreground w-40">{k}</td>
                          <td className="py-2 text-white">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-red-400 text-xs mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  After selecting any one Plan you can't Change your Plan or Upgrade your Plan in Future.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Profile Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-card border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg">
                  {editing ? 'Edit Profile' : 'Your Profile'}
                </h3>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                      <Button size="sm" className="bg-primary text-black" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : <><Save className="w-3.5 h-3.5 mr-1.5" />Save Profile</>}
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {saveMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm border ${saveMsg.includes('Error') || saveMsg.includes('complete') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                  {saveMsg}
                </div>
              )}

              {/* Photo */}
              <div className="mb-8 p-4 bg-background rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shrink-0">
                    {profile.photo_url
                      ? <img src={getImageUrl(profile.photo_url)} alt="Profile" className="w-full h-full object-cover rounded-full" />
                      : <User className="w-6 h-6 text-primary" />
                    }
                  </div>
                  <div>
                    <p className="text-white font-semibold">{profile.full_name || 'Your Name'}</p>
                    <p className="text-muted-foreground text-sm">+91 {profile.mobile}</p>
                  </div>
                </div>
                {editing && (
                  <PhotoUploader
                    currentUrl={getImageUrl(profile.photo_url)}
                    onUploadSuccess={url => update('photo_url', url)}
                  />
                )}
              </div>

              {/* ── Form Fields ──────────────────────────────────────────── */}
              <div className="space-y-6">

                {/* General Info */}
                <div>
                  <h4 className="text-primary text-sm font-bold uppercase tracking-wider mb-4">General Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Category" editing={editing}>
                      {editing
                        ? <Select value={profile.category || ''} onValueChange={v => update('category', v)}>
                            <SelectTrigger className="h-10 bg-background border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent className="bg-card border-white/10">{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        : <span>{profile.category || '—'}</span>}
                    </Field>
                    <Field label="Full Name" editing={editing}>
                      {editing
                        ? <Input value={profile.full_name || ''} onChange={e => update('full_name', e.target.value)} className="h-10 bg-background border-white/10 text-white" placeholder="Full name" />
                        : <span>{profile.full_name || '—'}</span>}
                    </Field>
                    <Field label="Date of Birth" editing={editing}>
                      {editing
                        ? <Input type="date" value={profile.date_of_birth || ''} onChange={e => update('date_of_birth', e.target.value)} className="h-10 bg-background border-white/10 text-white" />
                        : <span>{profile.date_of_birth || '—'}</span>}
                    </Field>
                    <Field label="Height (cm)" editing={editing}>
                      {editing
                        ? <Input type="number" value={profile.height || ''} onChange={e => update('height', e.target.value)} className="h-10 bg-background border-white/10 text-white" placeholder="e.g. 175" />
                        : <span>{profile.height ? `${profile.height} cm` : '—'}</span>}
                    </Field>
                    <Field label="Weight (kg)" editing={editing}>
                      {editing
                        ? <Input type="number" value={profile.weight || ''} onChange={e => update('weight', e.target.value)} className="h-10 bg-background border-white/10 text-white" placeholder="e.g. 70" />
                        : <span>{profile.weight ? `${profile.weight} kg` : '—'}</span>}
                    </Field>
                    <Field label="Complexion" editing={editing}>
                      {editing
                        ? <Select value={profile.complexion || ''} onValueChange={v => update('complexion', v)}>
                            <SelectTrigger className="h-10 bg-background border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent className="bg-card border-white/10">{COMPLEXIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        : <span>{profile.complexion || '—'}</span>}
                    </Field>
                    <Field label="Marks on Face" editing={editing}>
                      {editing
                        ? <Input value={profile.marks_on_face || ''} onChange={e => update('marks_on_face', e.target.value)} className="h-10 bg-background border-white/10 text-white" placeholder="None / describe" />
                        : <span>{profile.marks_on_face || '—'}</span>}
                    </Field>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="text-primary text-sm font-bold uppercase tracking-wider mb-4">Location</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="State" editing={editing}>
                      {editing
                        ? <Select value={profile.state || ''} onValueChange={v => update('state', v)}>
                            <SelectTrigger className="h-10 bg-background border-white/10 text-white"><SelectValue placeholder="Select state" /></SelectTrigger>
                            <SelectContent className="bg-card border-white/10">{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        : <span>{profile.state || '—'}</span>}
                    </Field>
                    <Field label="City" editing={editing}>
                      {editing
                        ? <Select value={profile.city || ''} onValueChange={v => update('city', v)}>
                            <SelectTrigger className="h-10 bg-background border-white/10 text-white"><SelectValue placeholder="Select city" /></SelectTrigger>
                            <SelectContent className="bg-card border-white/10">{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        : <span>{profile.city || '—'}</span>}
                    </Field>
                    <Field label="City Area" editing={editing}>
                      {editing
                        ? <Input value={profile.city_area || ''} onChange={e => update('city_area', e.target.value)} className="h-10 bg-background border-white/10 text-white" placeholder="Area / locality" />
                        : <span>{profile.city_area || '—'}</span>}
                    </Field>
                    <Field label="Address" editing={editing}>
                      {editing
                        ? <Input value={profile.address || ''} onChange={e => update('address', e.target.value)} className="h-10 bg-background border-white/10 text-white" placeholder="Street address" />
                        : <span>{profile.address || '—'}</span>}
                    </Field>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-primary text-sm font-bold uppercase tracking-wider mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Mobile Number">
                      <span className="text-muted-foreground">+91 {profile.mobile}</span>
                    </Field>
                    <Field label="Alternate Mobile" editing={editing}>
                      {editing
                        ? <Input value={profile.alt_mobile || ''} onChange={e => update('alt_mobile', e.target.value)} className="h-10 bg-background border-white/10 text-white" placeholder="Alternative number" />
                        : <span>{profile.alt_mobile || '—'}</span>}
                    </Field>
                    <Field label="Email ID" editing={editing}>
                      {editing
                        ? <Input type="email" value={profile.email || ''} onChange={e => update('email', e.target.value)} className="h-10 bg-background border-white/10 text-white" placeholder="your@email.com" />
                        : <span>{profile.email || '—'}</span>}
                    </Field>
                  </div>
                </div>

                {/* About */}
                <div>
                  <h4 className="text-primary text-sm font-bold uppercase tracking-wider mb-4">About You</h4>
                  <Field label="More Info About You" editing={editing}>
                    {editing
                      ? <Textarea value={profile.more_info || ''} onChange={e => update('more_info', e.target.value)} className="bg-background border-white/10 text-white min-h-[100px]" placeholder="Describe yourself, your experience, and anything relevant..." />
                      : <span className="whitespace-pre-wrap">{profile.more_info || '—'}</span>}
                  </Field>
                </div>

                {/* Membership */}
                <div>
                  <h4 className="text-primary text-sm font-bold uppercase tracking-wider mb-4">Membership & Payment</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Joining Plan" editing={editing}>
                      {editing ? (
                        <RadioGroup value={profile.joining_plan || ''} onValueChange={v => update('joining_plan', v)} className="flex flex-col gap-3">
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:border-primary/40">
                            <RadioGroupItem value="CL Plan" id="cl" />
                            <Label htmlFor="cl" className="cursor-pointer flex-1">
                              <span className="text-white font-medium">CL Plan — ₹5,000/month</span>
                              <span className="block text-xs text-muted-foreground">Middle class clients, 7 services/month, day timings</span>
                            </Label>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:border-primary/40">
                            <RadioGroupItem value="PL Plan" id="pl" />
                            <Label htmlFor="pl" className="cursor-pointer flex-1">
                              <span className="text-white font-medium">PL Plan — ₹10,000/year</span>
                              <span className="block text-xs text-muted-foreground">High class clients, 10 services/month, anytime</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      ) : (
                        <span className={profile.joining_plan ? 'text-primary font-semibold' : ''}>{profile.joining_plan || '—'}</span>
                      )}
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Date of Paying Fees" editing={editing}>
                        {editing
                          ? <Input type="date" value={profile.date_of_paying || ''} onChange={e => update('date_of_paying', e.target.value)} className="h-10 bg-background border-white/10 text-white" />
                          : <span>{profile.date_of_paying || '—'}</span>}
                      </Field>
                      <Field label="Payment Mode" editing={editing}>
                        {editing
                          ? <Select value={profile.payment_mode || ''} onValueChange={v => update('payment_mode', v)}>
                              <SelectTrigger className="h-10 bg-background border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent className="bg-card border-white/10">{PAYMENT_MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                            </Select>
                          : <span>{profile.payment_mode || '—'}</span>}
                      </Field>
                    </div>

                    {editing && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <p className="text-yellow-400 text-xs">I declare that I am above 18 years old and will present my ID proof to verify my profile.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save button at bottom */}
              {editing && (
                <div className="mt-8 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button className="bg-primary text-black font-bold px-8" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Profile</>}
                  </Button>
                </div>
              )}

              {/* Submit for review */}
              {!editing && step === 1 && (
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">Ready to go live?</p>
                    <p className="text-muted-foreground text-xs mt-1">Submit your profile for admin review. Once approved, you'll be visible to women clients.</p>
                  </div>
                  <Button size="sm" className="bg-primary text-black font-bold shrink-0" onClick={handleSubmitReview} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Available Women Tab ──────────────────────────────────────────── */}
        {activeTab === 'women' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <WomenTab />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Helper component
function Field({ label, editing, children }: { label: string; editing?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="text-white text-sm">{children}</div>
    </div>
  );
}

