import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Avatar from '../components/Avatar.jsx';

export default function Matches() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api('/user/connections').then((d) => setList(d.data)).catch((e) => setErr(e.message));
  }, []);

  if (err) return <p className="text-red-400">{err}</p>;
  if (!list) return <p className="text-neutral-400">Loading…</p>;
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Matches</h1>
      {list.length === 0 && <p className="text-neutral-400">No matches yet. Go swipe some devs!</p>}
      <div className="space-y-3">
        {list.map((u) => (
          <Link key={u._id} to={`/chat/${u._id}`} className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-pink-500 transition">
            <Avatar user={u} className="w-14 h-14" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{u.firstName} {u.lastName}</p>
              <p className="text-sm text-neutral-400 truncate">{u.about}</p>
            </div>
            <span className="text-pink-400 text-sm">Chat →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
