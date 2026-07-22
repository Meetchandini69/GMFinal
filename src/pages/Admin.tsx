import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import {
  Crown, LogOut, Users, CheckCircle, Clock, XCircle,
  Key, Eye, ChevronDown, ChevronUp, UserCheck, AlertCircle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

type Submission = {
  id: number;
  name: string;
  mobile: string;
  city: string;
  age: string;
  status: string;
  created_at: string;
  user_id?: number;
  is_active?: number;
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
  date_of_paying?: string;
  payment_mode?: string;
  photo_url?: string;
  member_status?: string;
  submitted_at?: string;
};

export default function Admin() {
  const [, navigate] = useLocation();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [credModal, setCredModal] = useState<Submission | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [settingCreds, setSettingCreds] = useState(false);
  const [credMsg, setCredMsg] = useState('');
  const [profileDetail, setProfileDetail] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

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

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    const data = await res.json();
    console.log("PROFILE DATA:", data);

    setProfileDetail(data);
  } catch (err) {
    console.error("Profile load failed:", err);
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

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
      approved: 'bg-green-400/10 text-green-400 border-green-400/30',
      rejected: 'bg-red-400/10 text-red-400 border-red-400/30',
    };
    return map[status] || map.pending;
  };

  const filtered = submissions.filter(s => filter === 'all' || s.status === filter);

  // ── Admin Login screen ────────────────────────────────────────────────
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

  // ── Admin Dashboard ───────────────────────────────────────────────────
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
            <Button size="sm" variant="outline" onClick={loadSubmissions}>Refresh</Button>
            <Button size="sm" variant="ghost" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">

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
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Submissions list */}
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
                {/* Row */}
                <div className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">{sub.name.charAt(0).toUpperCase()}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold truncate">{sub.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusBadge(sub.status)}`}>
                        {sub.status}
                      </span>
                      {sub.user_id && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/30 font-medium">
                          has login
                        </span>
                      )}
                      {sub.member_status === 'pending_review' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-yellow-400/10 text-yellow-400 border-yellow-400/30 font-medium">
                          awaiting review
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      +91 {sub.mobile} · {sub.city} · {sub.age} · #{sub.id} · {new Date(sub.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Set credentials button */}
                    <Button
                      size="sm"
                      className="bg-primary text-black text-xs h-8 px-3 font-semibold"
                      onClick={() => { setCredModal(sub); setCredMsg(''); setNewPassword(''); }}
                    >
                      <Key className="w-3 h-3 mr-1" />
                      {sub.user_id ? 'Reset Pwd' : 'Set Login'}
                    </Button>

                    {/* Expand */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground"
                      onClick={() => {
                        console.log("Expand clicked", sub);

                        if (expanded === sub.id) {
                          setExpanded(null);
                          setProfileDetail(null);
                        } else {
                          setExpanded(sub.id);

                          if (sub.user_id) {
                            console.log("Calling loadProfile", sub.user_id);
                            loadProfile(sub.user_id);
                          } else {
                            console.log("No user_id found");
                          }
                        }
                      }}
                    >
                      {expanded === sub.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded detail */}
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
                            ['Date of Paying', profileDetail.date_of_paying],
                            ['Payment Mode', profileDetail.payment_mode],
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
                            <img src={profileDetail.photo_url} alt="Profile" className="w-24 h-24 object-cover rounded-xl border border-white/10" />
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
      </div>

      {/* ── Credentials Modal ───────────────────────────────────────────────── */}
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
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setCredModal(null); setCredMsg(''); }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary text-black font-bold"
                  onClick={handleSetCredentials}
                  disabled={!newPassword || settingCreds}
                >
                  {settingCreds ? 'Creating...' : credModal.user_id ? 'Update Password' : 'Create Login'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
