import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import ProfileFields, { type Profile } from '@/components/ProfileFields';
import { apiFetch } from '@/lib/api';
import JoiningFeeNotice from '@/components/JoiningFeeNotice';

export default function MemberProfile() {
  const [, params] = useRoute('/member-profile/:id');
  const [profile, setProfile] = useState<Profile>();
  const [error, setError] = useState('');
  useEffect(() => {
    setProfile(undefined); setError('');
    apiFetch(`/api/member-profile/${params?.id}`).then(async res => {
      if (!res.ok) throw new Error(res.status === 403 ? 'Sign in as this member or as an admin to view this profile, then reopen this link.' : 'Unable to load this profile.');
      setProfile(await res.json());
    }).catch(e => setError(e.message));
  }, [params?.id]);
  return <main className="min-h-screen bg-background text-white px-4 py-10"><div className="max-w-3xl mx-auto space-y-5">
    <h1 className="font-serif text-3xl">Member Profile</h1><JoiningFeeNotice />
    {error ? <div role="alert"><p>{error}</p><a href="/login" className="text-primary underline mr-4">Member login</a><a href="/admin" className="text-primary underline">Admin login</a></div> : profile ? <ProfileFields profile={profile} editing={false} update={() => {}} /> : <p>Loading profile...</p>}
    <a href="/dashboard" className="text-primary underline">My panel</a>
  </div></main>;
}
