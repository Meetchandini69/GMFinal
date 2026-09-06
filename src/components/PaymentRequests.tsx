import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import PaymentReceipt from './PaymentReceipt';

export type PaymentRequest = {
  user_id: number;
  full_name: string | null;
  mobile: string;
  joining_plan: string | null;
  initiated_at: string | null;
  has_receipt: number;
  subscription_status: string;
};

export default function PaymentRequests({ requests, refresh }: { requests: PaymentRequest[]; refresh: () => Promise<void> }) {
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const approve = async (userId: number) => {
    setBusy(userId);
    setError('');
    try {
      const res = await apiFetch('/api/admin/subscription-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, subscription_status: 'paid' }),
      });
      if (!res.ok) throw new Error('Unable to verify payment. Please try again.');
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to verify payment.'); }
    finally { setBusy(null); }
  };
  return <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">Payment Initiated</h2>
    {error && <p role="alert" className="text-red-400">{error}</p>}
    {!requests.length && <p className="text-muted-foreground">No payment requests yet.</p>}
    {[...requests].sort((a, b) => Number(a.subscription_status === 'paid') - Number(b.subscription_status === 'paid')).map(request => (
      <div key={request.user_id} className="bg-card border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">{request.full_name || `User #${request.user_id}`}</h3>
            <p className="text-sm text-muted-foreground">{request.mobile} · {request.joining_plan || 'Plan not selected'}</p>
            {request.initiated_at && <p className="text-xs text-muted-foreground">Initiated {new Date(request.initiated_at).toLocaleString()}</p>}
          </div>
          <span className={request.subscription_status === 'paid' ? 'text-green-400 text-sm' : 'text-primary text-sm'}>
            {request.subscription_status === 'paid' ? 'Payment verified' : request.has_receipt ? 'Receipt received · Awaiting verification' : 'Payment initiated · Awaiting receipt'}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!!request.has_receipt && <Button variant="outline" size="sm" onClick={() => setExpanded(expanded === request.user_id ? null : request.user_id)}>{expanded === request.user_id ? 'Hide Receipt' : 'View Receipt'}</Button>}
          {request.subscription_status !== 'paid' && <Button size="sm" disabled={busy !== null} onClick={() => approve(request.user_id)} className="bg-primary text-black">{busy === request.user_id ? 'Verifying...' : 'Payment Done'}</Button>}
        </div>
        {expanded === request.user_id && <PaymentReceipt userId={request.user_id} />}
      </div>
    ))}
  </div>;
}
