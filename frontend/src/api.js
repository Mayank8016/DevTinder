import { io } from 'socket.io-client';

export const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const createSocket = () => io(BASE, { withCredentials: true });

export const inp =
  'w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 outline-none focus:border-pink-500 transition';
export const btn =
  'rounded-xl px-5 py-2.5 font-semibold bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90 disabled:opacity-50 transition';
