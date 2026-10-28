import { useState } from 'react';
import { api, inp, btn } from '../api';
import { useAuth } from '../AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [f, setF] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    age: user.age || '',
    gender: user.gender || '',
    about: user.about || '',
    photoURL: user.photoURL || '',
    skills: (user.skills || []).join(', '),
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ type: '', text: '' });
    const body = {
      firstName: f.firstName,
      lastName: f.lastName,
      about: f.about,
      photoURL: f.photoURL,
      skills: f.skills.split(',').map((s) => s.trim()).filter(Boolean),
    };
    if (f.age) body.age = Number(f.age);
    if (f.gender) body.gender = f.gender;
    try {
      const d = await api('/profile/edit', { method: 'PATCH', body });
      setUser(d.user);
      setMsg({ type: 'ok', text: 'Profile saved ✔' });
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-lg mx-auto space-y-3">
      <div className="flex items-center gap-4 mb-2">
        <Avatar user={{ ...user, photoURL: f.photoURL }} className="w-20 h-20 text-2xl" />
        <div>
          <h1 className="text-2xl font-bold">Your profile</h1>
          <p className="text-sm text-neutral-400">{user.emailId}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input className={inp} placeholder="First name" value={f.firstName} onChange={set('firstName')} required />
        <input className={inp} placeholder="Last name" value={f.lastName} onChange={set('lastName')} />
      </div>
      <div className="flex gap-2">
        <input className={inp} type="number" min="18" max="75" placeholder="Age" value={f.age} onChange={set('age')} />
        <select className={inp} value={f.gender} onChange={set('gender')}>
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="others">Others</option>
        </select>
      </div>
      <input className={inp} placeholder="Photo URL" value={f.photoURL} onChange={set('photoURL')} />
      <textarea className={inp} rows="3" maxLength="300" placeholder="About you" value={f.about} onChange={set('about')} />
      <input className={inp} placeholder="Skills (comma separated, max 10) e.g. React, Node, MongoDB" value={f.skills} onChange={set('skills')} />
      {msg.text && <p className={`text-sm ${msg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}
      <button disabled={busy} className={`${btn} w-full`}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}
