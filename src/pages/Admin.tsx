import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import {
  Crown, LogOut, Users, CheckCircle, Clock, XCircle,
  Key, ChevronDown, ChevronUp, UserCheck, AlertCircle,
  ImagePlus, Pencil, Trash2, ToggleLeft, ToggleRight, Plus,
  Heart, X, Save,
} from 'lucide-react';
import { apiFetch, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────────────────────

type Submission = {
  id: number;
  name: string;
  mobile: string;
  city: string;
  age: string;
  status: string;
  created_at: string;
  user_id?: number;
  is_active?: boolean | number;
  member_status?: string;
  profile_step?: number;
};

type Profile = {
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
  submitted_at?: string;
};

type Woman = {
  id: number;
  name: string;
  age: number | null;
  city: string;
  state: string;
  bio: string;
  photo_url: string;
  is_active: boolean;
  created_at: string;
};

type WomanForm = {
  name: string;
  age: string;
  city: string;
  state: string;
  bio: string;
  photo_url: string;
};

type SubmissionFilter = 'all' | 'pending' | 'approved' | 'profile_pending' | 'profile_approved';

const EMPTY_FORM: WomanForm = { name: '', age: '', city: '', state: '', bio: '', photo_url: '' };

// ── WomanModal ─────────────────────────────────────────────────────────────

function WomanModal({
  initial,
  onSave,
  onClose,
}: {
  initial: (WomanForm & { id?: number }) | null;
  onSave: (form: WomanForm, id?: number) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<WomanForm>(
    initial ? { name: initial.name, age: String(initial.age ?? ''), city: initial.city, state: initial.state, bio: initial.bio, photo_url: initial.photo_url } : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const upd = (k: keyof WomanForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await apiFetch('/api/admin/upload-photo', { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json();
      if (res.ok) upd('photo_url', data.url);
      else setError(data.error || 'Upload failed');
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form, initial?.id);
    } catch (err: any) {
      setError(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-white font-bold">{initial?.id ? 'Edit Woman Profile' : 'Add Woman Profile'}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">

          {/* Photo */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-white/10 bg-background overflow-hidden shrink-0 flex items-center justify-center">
                {form.photo_url
                  ? <img src={getImageUrl(form.photo_url)} alt="preview" className="w-full h-full object-cover" />
                  : <ImagePlus className="w-6 h-6 text-muted-foreground" />
                }
              </div>
              <div className="flex-1">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : form.photo_url ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10 MB</p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Name *</label>
            <Input
              value={form.name}
              onChange={e => upd('name', e.target.value)}
              className="h-10 bg-background border-white/10 text-white"
              placeholder="e.g. Priya S."
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Age</label>
            <Input
              type="number"
              value={form.age}
              onChange={e => upd('age', e.target.value)}
              className="h-10 bg-background border-white/10 text-white"
              placeholder="e.g. 26"
              min={18}
              max={60}
            />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">City</label>
              <Input
                value={form.city}
                onChange={e => upd('city', e.target.value)}
                className="h-10 bg-background border-white/10 text-white"
                placeholder="e.g. Mumbai"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">State</label>
              <Input
                value={form.state}
                onChange={e => upd('state', e.target.value)}
                className="h-10 bg-background border-white/10 text-white"
                placeholder="e.g. Maharashtra"
              />
            </div>
          </div>

          {/* Bio / Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Bio / Subtitle</label>
            <Textarea
              value={form.bio}
              onChange={e => upd('bio', e.target.value)}
              className="bg-background border-white/10 text-white min-h-[80px]"
              placeholder="Short description shown on the card..."
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button className="flex-1 bg-primary text-black font-bold" onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-1.5" />{initial?.id ? 'Save Changes' : 'Add Profile'}</>}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Admin component ───────────────────────────────────────────────────

export default function Admin() {
  const [, navigate] = useLocation();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // top-level tab
  const [mainTab, setMainTab] = useState<'submissions' | 'women'>('submissions');

  // submissions state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [credModal, setCredModal] = useState<Submission | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [settingCreds, setSettingCreds] = useState(false);
  const [credMsg, setCredMsg] = useState('');
  const [profileDetail, setProfileDetail] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [filter, setFilter] = useState<SubmissionFilter>('all');
  const [deleteSubmissionConfirm, setDeleteSubmissionConfirm] = useState<Submission | null>(null);
  const [userActionLoading, setUserActionLoading] = useState<number | null>(null);

  // women state
  const [women, setWomen] = useState<Woman[]>([]);
  const [womenLoading, setWomenLoading] = useState(false);
  const [womanModal, setWomanModal] = useState<(WomanForm & { id?: number }) | null | false>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    apiFetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.role === 'admin') { setAuthed(true); loadSubmissions(); } });
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const res = await apiFetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include',
    });
    setAuthLoading(false);
    if (res.ok) { setAuthed(true); loadSubmissions(); }
    else setAuthError('Invalid admin password');
  };

  const handleLogout = async () => {
    await apiFetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    navigate('/');
  };

  // ── Submissions ──────────────────────────────────────────────────────────

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/submissions', { credentials: 'include' });
      const data = await res.json();
      setSubmissions(data);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: number) => {
    setProfileLoading(true);
    setProfileDetail(null);
    try {
      const res = await apiFetch(`/api/admin/profile/${userId}`);
      if (!res.ok) return;
      setProfileDetail(await res.json());
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSetCredentials = async () => {
    if (!credModal || !newPassword) return;
    setSettingCreds(true);
    setCredMsg('');
    try {
      const res = await apiFetch('/api/admin/set-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: credModal.id, password: newPassword }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setCredMsg(`✅ Login created! Mobile: +91 ${data.mobile}, Password: ${newPassword}`);
        setNewPassword('');
        loadSubmissions();
      } else {
        setCredMsg(`❌ ${data.error}`);
      }
    } finally {
      setSettingCreds(false);
    }
  };

  const handleReview = async (userId: number, action: 'approve' | 'reject') => {
    await apiFetch('/api/admin/review-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, action }),
      credentials: 'include',
    });
    loadSubmissions();
  };

  const handleToggleUser = async (submission: Submission) => {
    if (!submission.user_id) return;
    const currentlyActive = submission.is_active === true || submission.is_active === 1;
    setUserActionLoading(submission.id);
    try {
      const res = await apiFetch('/api/admin/user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: submission.user_id, is_active: !currentlyActive }),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Unable to update user status');
      }
      await loadSubmissions();
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!deleteSubmissionConfirm) return;
    setUserActionLoading(deleteSubmissionConfirm.id);
    try {
      const res = await apiFetch(`/api/admin/submissions/${deleteSubmissionConfirm.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      setDeleteSubmissionConfirm(null);
      setExpanded(null);
      setProfileDetail(null);
      await loadSubmissions();
    } finally {
      setUserActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
      approved: 'bg-green-400/10 text-green-400 border-green-400/30',
      rejected: 'bg-red-400/10 text-red-400 border-red-400/30',
    };
    return map[status] || map.pending;
  };

  const filtered = submissions.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'profile_pending') return s.member_status === 'pending_review';
    if (filter === 'profile_approved') return s.member_status === 'active';
    return s.status === filter;
  });

  // ── Women ────────────────────────────────────────────────────────────────

  const loadWomen = async () => {
    setWomenLoading(true);
    try {
      const res = await apiFetch('/api/admin/women', { credentials: 'include' });
      if (res.ok) setWomen(await res.json());
    } finally {
      setWomenLoading(false);
    }
  };

  useEffect(() => {
    if (authed && mainTab === 'women') loadWomen();
  }, [authed, mainTab]);

  const handleSaveWoman = async (form: WomanForm, id?: number) => {
    const body = { ...form, age: form.age ? Number(form.age) : null };
    const res = await apiFetch(
      id ? `/api/admin/women/${id}` : '/api/admin/women',
      {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { ...body, is_active: true } : body),
        credentials: 'include',
      }
    );
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || 'Save failed');
    }
    setWomanModal(false);
    loadWomen();
  };

  const handleToggleActive = async (w: Woman) => {
    await apiFetch(`/api/admin/women/${w.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: w.name, age: w.age, city: w.city, state: w.state,
        bio: w.bio, photo_url: w.photo_url, is_active: !w.is_active,
      }),
      credentials: 'include',
    });
    loadWomen();
  };

  const handleDeleteWoman = async (id: number) => {
    await apiFetch(`/api/admin/women/${id}`, { method: 'DELETE', credentials: 'include' });
    setDeleteConfirm(null);
    loadWomen();
  };

  // ── Auth screen ──────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2"><Crown className="w-8 h-8 text-primary" /></Link>
            <h1 className="text-2xl font-serif font-bold text-white mt-4">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">GigoloMeet.in — Restricted Access</p>
          </div>
          <div className="bg-card border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Admin Password</label>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 bg-background border-white/10 text-white"
                  required
                />
              </div>
              {authError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{authError}</p>}
              <Button type="submit" disabled={authLoading} className="w-full h-12 bg-primary text-black font-bold">
                {authLoading ? 'Signing in...' : 'Login to Admin'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Admin Panel</h1>
              <p className="text-muted-foreground text-xs">GigoloMeet.in</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={mainTab === 'submissions' ? loadSubmissions : loadWomen}>Refresh</Button>
            <Button size="sm" variant="ghost" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">

        {/* ── Main tabs ── */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setMainTab('submissions')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${mainTab === 'submissions' ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
          >
            <Users className="w-4 h-4" /> Submissions
          </button>
          <button
            onClick={() => setMainTab('women')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${mainTab === 'women' ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
          >
            <Heart className="w-4 h-4" /> Women Profiles
          </button>
        </div>

        {/* ══════════════ SUBMISSIONS TAB ══════════════ */}
        {mainTab === 'submissions' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total', value: submissions.length, icon: Users, color: 'text-blue-400' },
                { label: 'Pending', value: submissions.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-yellow-400' },
                { label: 'Approved', value: submissions.filter(s => s.status === 'approved').length, icon: CheckCircle, color: 'text-green-400' },
                { label: 'With Login', value: submissions.filter(s => s.user_id).length, icon: UserCheck, color: 'text-primary' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-muted-foreground text-xs">{label}</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                { value: 'all' as const, label: 'All', count: submissions.length },
                { value: 'pending' as const, label: 'Pending', count: submissions.filter(s => s.status === 'pending').length },
                { value: 'approved' as const, label: 'Approved', count: submissions.filter(s => s.status === 'approved').length },
                { value: 'profile_pending' as const, label: 'Profile Submitted for Approval', count: submissions.filter(s => s.member_status === 'pending_review').length },
                { value: 'profile_approved' as const, label: 'Profile Submitted Approved', count: submissions.filter(s => s.member_status === 'active').length },
              ].map(({ value, label, count }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === value ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                >
                  {label} <span className="ml-1 opacity-70">{count}</span>
                </button>
              ))}
            </div>

            {/* List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(sub => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-white/10 rounded-xl overflow-hidden"
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-sm">{sub.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-semibold truncate">{sub.name}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusBadge(sub.status)}`}>{sub.status}</span>
                          {sub.user_id && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/30 font-medium">has login</span>
                          )}
                           {sub.user_id && !(sub.is_active === true || sub.is_active === 1) && (
                             <span className="text-[10px] px-2 py-0.5 rounded-full border bg-red-400/10 text-red-400 border-red-400/30 font-medium">disabled</span>
                           )}
                          {sub.member_status === 'pending_review' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-yellow-400/10 text-yellow-400 border-yellow-400/30 font-medium">awaiting review</span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          +91 {sub.mobile} · {sub.city} · {sub.age} · #{sub.id} · {new Date(sub.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {sub.user_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            className={`text-xs h-8 px-2 ${sub.is_active === true || sub.is_active === 1 ? 'text-red-400 border-red-400/30 hover:bg-red-400/10' : 'text-green-400 border-green-400/30 hover:bg-green-400/10'}`}
                            onClick={() => handleToggleUser(sub)}
                            disabled={userActionLoading === sub.id}
                            title={sub.is_active === true || sub.is_active === 1 ? 'Disable user login' : 'Enable user login'}
                          >
                            {sub.is_active === true || sub.is_active === 1
                              ? <><ToggleLeft className="w-3.5 h-3.5 mr-1" />Disable</>
                              : <><ToggleRight className="w-3.5 h-3.5 mr-1" />Enable</>}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="bg-primary text-black text-xs h-8 px-3 font-semibold"
                          onClick={() => { setCredModal(sub); setCredMsg(''); setNewPassword(''); }}
                        >
                          <Key className="w-3 h-3 mr-1" />
                          {sub.user_id ? 'Reset Pwd' : 'Set Login'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground"
                          onClick={() => {
                            if (expanded === sub.id) {
                              setExpanded(null);
                              setProfileDetail(null);
                            } else {
                              setExpanded(sub.id);
                              if (sub.user_id) loadProfile(sub.user_id);
                            }
                          }}
                        >
                          {expanded === sub.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          onClick={() => setDeleteSubmissionConfirm(sub)}
                          disabled={userActionLoading === sub.id}
                          title="Delete user and submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {expanded === sub.id && (
                      <div className="border-t border-white/10 p-4 bg-background/50">
                        {!sub.user_id ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="w-4 h-4" />
                            No login credentials set yet. Click "Set Login" to create them.
                          </div>
                        ) : profileLoading ? (
                          <p className="text-muted-foreground text-sm">Loading profile...</p>
                        ) : profileDetail?.full_name ? (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-white font-semibold">Profile Details</h4>
                              {sub.member_status === 'pending_review' && (
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-green-500 text-white text-xs h-7" onClick={() => handleReview(sub.user_id!, 'approve')}>
                                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                  </Button>
                                  <Button size="sm" className="bg-red-500 text-white text-xs h-7" onClick={() => handleReview(sub.user_id!, 'reject')}>
                                    <XCircle className="w-3 h-3 mr-1" /> Reject
                                  </Button>
                                </div>
                              )}
                              {sub.member_status === 'active' && (
                                <span className="text-green-400 text-xs bg-green-400/10 border border-green-400/30 px-2 py-1 rounded-full">✅ Approved & Live</span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                              {[
                                ['Full Name', profileDetail.full_name],
                                ['Category', profileDetail.category],
                                ['Date of Birth', profileDetail.date_of_birth],
                                ['Height', profileDetail.height ? `${profileDetail.height} cm` : null],
                                ['Weight', profileDetail.weight ? `${profileDetail.weight} kg` : null],
                                ['Complexion', profileDetail.complexion],
                                ['Marks on Face', profileDetail.marks_on_face],
                                ['State', profileDetail.state],
                                ['City', profileDetail.city],
                                ['City Area', profileDetail.city_area],
                                ['Address', profileDetail.address],
                                ['Email', profileDetail.email],
                                ['Alt Mobile', profileDetail.alt_mobile],
                                ['Joining Plan', profileDetail.joining_plan],
                              ].filter(([, v]) => v).map(([k, v]) => (
                                <div key={k as string}>
                                  <p className="text-muted-foreground text-xs">{k}</p>
                                  <p className="text-white">{v}</p>
                                </div>
                              ))}
                            </div>
                            {profileDetail.more_info && (
                              <div className="mt-3">
                                <p className="text-muted-foreground text-xs">More Info</p>
                                <p className="text-white text-sm whitespace-pre-wrap">{profileDetail.more_info}</p>
                              </div>
                            )}
                            {profileDetail.photo_url && (
                              <div className="mt-3">
                                <p className="text-muted-foreground text-xs mb-2">Photo</p>
                                <img src={getImageUrl(profileDetail.photo_url)} alt="Profile" className="w-24 h-24 object-cover rounded-xl border border-white/10" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">User has not filled their profile yet.</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════ WOMEN TAB ══════════════ */}
        {mainTab === 'women' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-bold text-lg">Women Profiles</h2>
                <p className="text-muted-foreground text-sm mt-0.5">Manage the profiles shown to active members in the "Available Women" tab.</p>
              </div>
              <Button
                className="bg-primary text-black font-bold"
                onClick={() => setWomanModal({ ...EMPTY_FORM })}
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Woman
              </Button>
            </div>

            {womenLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : women.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No women profiles yet</p>
                <p className="text-sm mt-1">Click "Add Woman" to create the first profile.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {women.map(w => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-card border rounded-2xl overflow-hidden transition-all ${w.is_active ? 'border-white/10' : 'border-white/5 opacity-60'}`}
                  >
                    {/* Photo */}
                    <div className="relative h-44 bg-background overflow-hidden">
                      {w.photo_url ? (
                        <img
                          src={getImageUrl(w.photo_url)}
                          alt={w.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImagePlus className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      {/* Active badge */}
                      <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${w.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {w.is_active ? 'Active' : 'Hidden'}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="text-white font-semibold">{w.name}{w.age ? `, ${w.age}` : ''}</p>
                          {(w.city || w.state) && (
                            <p className="text-muted-foreground text-xs mt-0.5">{[w.city, w.state].filter(Boolean).join(', ')}</p>
                          )}
                        </div>
                      </div>
                      {w.bio && (
                        <p className="text-white/60 text-xs mt-2 line-clamp-2 leading-relaxed">{w.bio}</p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs"
                          onClick={() => setWomanModal({
                            id: w.id, name: w.name, age: w.age ? String(w.age) : '',
                            city: w.city || '', state: w.state || '',
                            bio: w.bio || '', photo_url: w.photo_url || '',
                          })}
                        >
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <button
                          onClick={() => handleToggleActive(w)}
                          title={w.is_active ? 'Hide from members' : 'Show to members'}
                          className="h-8 w-8 rounded-md border border-white/10 hover:border-white/30 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                        >
                          {w.is_active
                            ? <ToggleRight className="w-4 h-4 text-green-400" />
                            : <ToggleLeft className="w-4 h-4" />
                          }
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(w.id)}
                          className="h-8 w-8 rounded-md border border-white/10 hover:border-red-500/40 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Credentials Modal ────────────────────────────────────────────────── */}
      {credModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-white font-bold">Set Login Credentials</h3>
                <p className="text-muted-foreground text-xs">For {credModal.name} · +91 {credModal.mobile}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Username (Mobile Number)</label>
                <div className="flex h-11 items-center px-3 rounded-md border border-white/10 bg-background text-muted-foreground text-sm">
                  +91 {credModal.mobile}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Username is always the registered mobile number</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Set Password *</label>
                <Input
                  type="text"
                  placeholder="Enter a password for this user"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="h-11 bg-background border-white/10 text-white"
                />
                <p className="text-xs text-muted-foreground mt-1">Share this password with the user via their mobile/WhatsApp</p>
              </div>
              {credMsg && (
                <div className={`p-3 rounded-lg text-sm border ${credMsg.startsWith('✅') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {credMsg}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setCredModal(null); setCredMsg(''); }}>Cancel</Button>
                <Button className="flex-1 bg-primary text-black font-bold" onClick={handleSetCredentials} disabled={!newPassword || settingCreds}>
                  {settingCreds ? 'Creating...' : credModal.user_id ? 'Update Password' : 'Create Login'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── User Delete Confirm ──────────────────────────────────────────────── */}
      {deleteSubmissionConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-red-500/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Delete User?</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  This permanently deletes <span className="text-white font-medium">{deleteSubmissionConfirm.name}</span>,
                  their login, profile, and swipe history. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteSubmissionConfirm(null)}
                disabled={userActionLoading === deleteSubmissionConfirm.id}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
                onClick={handleDeleteSubmission}
                disabled={userActionLoading === deleteSubmissionConfirm.id}
              >
                {userActionLoading === deleteSubmissionConfirm.id ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Woman Add/Edit Modal ─────────────────────────────────────────────── */}
      {womanModal !== false && (
        <WomanModal
          initial={womanModal}
          onSave={handleSaveWoman}
          onClose={() => setWomanModal(false)}
        />
      )}

      {/* ── Delete Confirm ────────────────────────────────────────────────────── */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Delete Profile?</h3>
                <p className="text-muted-foreground text-xs">This cannot be undone. All swipe history for this profile will also be removed.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold" onClick={() => handleDeleteWoman(deleteConfirm)}>
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
