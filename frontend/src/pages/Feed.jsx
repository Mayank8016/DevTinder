import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Avatar from '../components/Avatar.jsx';

function Card({ u, interactive, onSwipe }) {
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const startX = useRef(0);

  const down = (e) => { if (!interactive) return; startX.current = e.clientX; setDrag(true); e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => { if (drag) setDx(e.clientX - startX.current); };
  const up = () => {
    if (!drag) return;
    setDrag(false);
    if (dx > 110) onSwipe('interested');
    else if (dx < -110) onSwipe('ignored');
    else setDx(0);
  };

  return (
    <div
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      style={interactive ? { transform: `translateX(${dx}px) rotate(${dx / 20}deg)`, transition: drag ? 'none' : 'transform .25s' } : undefined}
      className={`absolute inset-0 rounded-3xl overflow-hidden bg-neutral-900 shadow-2xl select-none touch-pan-y ${interactive ? 'cursor-grab active:cursor-grabbing' : 'scale-95 opacity-60'}`}
    >
      {u.photoURL ? (
        <img src={u.photoURL} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 grid place-items-center text-9xl font-black">
          {u.firstName[0]}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-5 pt-28 bg-gradient-to-t from-black/90 to-transparent">
        {u.isBot && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-200">🤖 AI</span>}
        <h2 className="text-2xl font-bold">
          {u.firstName} {u.lastName}{u.age ? `, ${u.age}` : ''}
        </h2>
        {u.gender && <p className="text-xs uppercase tracking-wide text-neutral-300">{u.gender}</p>}
        <p className="text-sm text-neutral-200 mt-1 line-clamp-2">{u.about}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {u.skills?.slice(0, 6).map((s) => (
            <span key={s} className="px-2.5 py-1 text-xs rounded-full bg-white/20 backdrop-blur">{s}</span>
          ))}
        </div>
      </div>
      {interactive && dx > 40 && <span className="absolute top-6 left-6 border-4 border-green-400 text-green-400 font-black text-2xl px-3 py-1 rounded-lg -rotate-12">LIKE</span>}
      {interactive && dx < -40 && <span className="absolute top-6 right-6 border-4 border-red-400 text-red-400 font-black text-2xl px-3 py-1 rounded-lg rotate-12">NOPE</span>}
    </div>
  );
}

export default function Feed() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const d = await api('/user/feed?limit=10');
      setUsers(d.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const swipe = async (status) => {
    const u = users[0];
    if (!u) return;
    const rest = users.slice(1);
    setUsers(rest);
    try {
      const r = await api(`/request/send/${status}/${u._id}`, { method: 'POST' });
      if (r.match) setMatch(u);
    } catch (e) {
      setErr(e.message);
    }
    if (rest.length === 0) load();
  };

  if (loading) return <p className="text-center text-neutral-400 mt-20">Finding developers…</p>;

  return (
    <div className="flex flex-col items-center">
      {err && <p className="text-sm text-red-400 mb-2">{err}</p>}
      {users.length === 0 ? (
        <div className="text-center mt-20 text-neutral-400">
          <p className="text-5xl mb-3">🎉</p>
          <p>You're all caught up. Check back later for new devs!</p>
        </div>
      ) : (
        <>
          <div className="relative w-full max-w-sm aspect-[3/4] mt-2">
            {users.slice(0, 2).reverse().map((u, i, arr) => (
              <Card key={u._id} u={u} interactive={i === arr.length - 1} onSwipe={swipe} />
            ))}
          </div>
          <div className="flex gap-8 mt-6">
            <button onClick={() => swipe('ignored')} className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 text-2xl text-red-400 hover:scale-110 transition">✕</button>
            <button onClick={() => swipe('interested')} className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 text-2xl text-green-400 hover:scale-110 transition">♥</button>
          </div>
          <p className="text-xs text-neutral-500 mt-3">Drag the card or use the buttons</p>
        </>
      )}

      {match && (
        <div className="fixed inset-0 z-30 bg-black/80 grid place-items-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center max-w-sm w-full">
            <p className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">It's a match!</p>
            <div className="flex justify-center my-5"><Avatar user={match} className="w-24 h-24 text-3xl" /></div>
            <p className="text-neutral-300">You and {match.firstName} liked each other.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMatch(null)} className="flex-1 rounded-xl py-2.5 bg-neutral-800">Keep swiping</button>
              <Link to={`/chat/${match._id}`} className="flex-1 rounded-xl py-2.5 font-semibold bg-gradient-to-r from-pink-500 to-orange-400">Say hi</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
