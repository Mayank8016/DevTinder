import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Feed from './pages/Feed.jsx';
import Matches from './pages/Matches.jsx';
import Requests from './pages/Requests.jsx';
import Chat from './pages/Chat.jsx';
import Profile from './pages/Profile.jsx';

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-neutral-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto p-4">
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Feed />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
