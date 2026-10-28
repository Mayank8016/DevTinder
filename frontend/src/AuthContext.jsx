import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/profile/view')
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await api('/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  };

  return <Ctx.Provider value={{ user, setUser, loading, logout }}>{children}</Ctx.Provider>;
}
