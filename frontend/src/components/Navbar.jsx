import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Avatar from './Avatar.jsx';

const link = ({ isActive }) =>
  `px-3 py-1.5 rounded-lg text-sm ${isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur border-b border-neutral-800">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
        <Link to="/" className="text-xl font-extrabold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mr-auto">
          🔥 DevTinder
        </Link>
        <NavLink to="/" end className={link}>Discover</NavLink>
        <NavLink to="/matches" className={link}>Matches</NavLink>
        <NavLink to="/requests" className={link}>Likes</NavLink>
        <NavLink to="/profile" className="ml-1"><Avatar user={user} className="w-8 h-8" /></NavLink>
        <button onClick={logout} className="text-sm text-neutral-400 hover:text-white ml-1">Logout</button>
      </div>
    </nav>
  );
}
