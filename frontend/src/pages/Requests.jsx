import { useEffect, useState } from 'react';
import { api } from '../api';
import Avatar from '../components/Avatar.jsx';

export default function Requests() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api('/user/requests/received').then((d) => setList(d.data)).catch((e) => setErr(e.message));
  }, []);

  const review = async (status, requestId) => {
    try {
      await api(`/request/review/${status}/${requestId}`, { method: 'POST' });
      setList((l) => l.filter((r) => r.requestId !== requestId));
    } catch (e) {
      setErr(e.message);
    }
  };

  if (!list) return <p className="text-neutral-400">{err || 'Loading…'}</p>;
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Who liked you</h1>
      {err && <p className="text-red-400 text-sm mb-2">{err}</p>}
      {list.length === 0 && <p className="text-neutral-400">No pending likes right now.</p>}
      <div className="space-y-3">
        {list.map(({ requestId, user: u }) => (
          <div key={requestId} className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <Avatar user={u} className="w-14 h-14" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{u.firstName} {u.lastName}{u.age ? `, ${u.age}` : ''}</p>
              <p className="text-sm text-neutral-400 truncate">{u.skills?.join(' · ') || u.about}</p>
            </div>
            <button onClick={() => review('rejected', requestId)} className="px-3 py-2 rounded-xl bg-neutral-800 text-red-400">Reject</button>
            <button onClick={() => review('accepted', requestId)} className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 font-semibold">Accept</button>
          </div>
        ))}
      </div>
    </>
  );
}
