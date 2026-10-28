import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, createSocket, inp, btn } from '../api';
import { useAuth } from '../AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';

export default function Chat() {
  const { id } = useParams();
  const { user } = useAuth();
  const [target, setTarget] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const sock = useRef(null);
  const end = useRef(null);

  useEffect(() => {
    let dead = false;
    let s;
    api(`/chat/${id}`)
      .then((d) => {
        if (dead) return;
        setTarget(d.user);
        setMsgs(d.messages);
        s = createSocket();
        sock.current = s;
        s.emit('joinChat', { targetUserId: id });
        s.on('messageReceived', (m) => setMsgs((p) => [...p, m]));
      })
      .catch((e) => setErr(e.message));
    return () => { dead = true; s?.disconnect(); };
  }, [id]);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sock.current?.emit('sendMessage', { targetUserId: id, text });
    setText('');
  };

  if (err) return <p className="text-red-400">{err} <Link to="/matches" className="underline">Back</Link></p>;
  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-neutral-900/50 border border-neutral-800 rounded-3xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-neutral-800">
        <Link to="/matches" className="text-neutral-400">←</Link>
        {target && <Avatar user={target} className="w-10 h-10" />}
        <p className="font-semibold">{target ? `${target.firstName} ${target.lastName}` : '…'}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {msgs.length === 0 && <p className="text-center text-neutral-500 text-sm mt-10">Say hi 👋</p>}
        {msgs.map((m) => {
          const mine = String(m.senderId) === String(user._id);
          return (
            <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl break-words ${mine ? 'bg-gradient-to-r from-pink-500 to-orange-400 rounded-br-sm' : 'bg-neutral-800 rounded-bl-sm'}`}>
                {m.text}
                <div className="text-[10px] opacity-60 text-right">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="p-3 border-t border-neutral-800 flex gap-2">
        <input className={inp} placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} />
        <button className={btn}>Send</button>
      </form>
    </div>
  );
}
