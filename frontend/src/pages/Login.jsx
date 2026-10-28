import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, inp, btn } from '../api';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { user, setUser } = useAuth();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ firstName: '', lastName: '', emailId: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={mode === 'signup' ? '/profile' : '/'} replace />;

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const body = mode === 'login' ? { emailId: f.emailId, password: f.password } : f;
      const d = await api(mode === 'login' ? '/login' : '/signup', { method: 'POST', body });
      setUser(d.user);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-neutral-900/60 border border-neutral-800 rounded-3xl p-7 space-y-3">
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
          🔥 DevTinder
        </h1>
        <p className="text-center text-neutral-400 text-sm pb-2">
          {mode === 'login' ? 'Welcome back, dev.' : 'Find your next co-founder or code buddy.'}
        </p>
        {mode === 'signup' && (
          <div className="flex gap-2">
            <input className={inp} placeholder="First name" value={f.firstName} onChange={set('firstName')} required />
            <input className={inp} placeholder="Last name" value={f.lastName} onChange={set('lastName')} />
          </div>
        )}
        <input className={inp} type="email" placeholder="Email" value={f.emailId} onChange={set('emailId')} required />
        <input className={inp} type="password" placeholder="Password" value={f.password} onChange={set('password')} required />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button disabled={busy} className={`${btn} w-full`}>{busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}</button>
        <p className="text-center text-sm text-neutral-400">
          {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
          <button type="button" className="text-pink-400 hover:underline" onClick={() => { setErr(''); setMode(mode === 'login' ? 'signup' : 'login'); }}>
            {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  );
}
