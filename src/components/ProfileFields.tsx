import React from 'react';
import { User, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import PhotoUploader from '@/components/PhotoUploader';
import { getImageUrl } from '@/lib/api';
export type Profile = {
  profile_url?: string;
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
  photo_url?: string;
  member_status?: string;
  subscription_status?: string;
  profile_step?: number;
  submitted_at?: string;
};
const STATES = ['Tamil Nadu', 'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Other'];
const CITIES = ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Coimbatore', 'Pune', 'Lucknow', 'Other'];
const COMPLEXIONS = ['Very Fair', 'Fair', 'Wheatish', 'Brown', 'Dark'];
const CATEGORIES = ['Gigolo', 'Playboy', 'Male Escort'];
const JOINING_PLANS = [
  { value: '1 Month Plan', title: '1 Month Plan - Rs. 2,500', description: 'Valid for 1 month' },
  { value: '2 Months Plan', title: '2 Months Plan - Rs. 4,000', description: 'Valid for 2 months' },
  { value: '6 Months Plan', title: '6 Months Plan - Rs. 9,000', description: 'Valid for 6 months' },
  { value: '1 Year Plan', title: '1 Year Plan - Rs. 12,000', description: 'Valid for 1 year' },
];

export default function ProfileFields({ profile, editing, update, uploadEndpoint, lockAccount = false }: {
  profile: Profile; editing: boolean; update: (key: keyof Profile, value: string) => void; uploadEndpoint?: string; lockAccount?: boolean;
}) {
  return <>
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
                    uploadEndpoint={uploadEndpoint}
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
                        ? <Input disabled={lockAccount} type="email" value={profile.email || ''} onChange={e => update('email', e.target.value)} className="h-10 bg-background border-white/10 text-white" placeholder="your@email.com" />
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
                        <RadioGroup disabled={lockAccount} value={profile.joining_plan || ''} onValueChange={v => update('joining_plan', v)} className="flex flex-col gap-3">
                          {JOINING_PLANS.map((plan, index) => {
                            const id = `joining-plan-${index}`;

                            return (
                              <div key={plan.value} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:border-primary/40">
                                <RadioGroupItem value={plan.value} id={id} />
                                <Label htmlFor={id} className="cursor-pointer flex-1">
                                  <span className="text-white font-medium">{plan.title}</span>
                                  <span className="block text-xs text-muted-foreground">{plan.description}</span>
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      ) : (
                        <span className={profile.joining_plan ? 'text-primary font-semibold' : ''}>{profile.joining_plan || '—'}</span>
                      )}
                    </Field>

                    {editing && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <p className="text-yellow-400 text-xs">I declare that I am above 18 years old and will present my ID proof to verify my profile.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

  </>;
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
