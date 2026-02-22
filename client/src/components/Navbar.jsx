import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const leagueColors = {
  Bronze: '#cd7f32',
  Silver: '#c0c0d0',
  Gold: '#ffd700',
  Diamond: '#00d4ff'
};

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`text-sm font-medium font-display transition-all duration-200 px-3 py-1.5 rounded-lg ${
        isActive
          ? 'text-white bg-[#1e1e2e]'
          : 'text-slate-400 hover:text-white hover:bg-[#1a1a26]'
      }`}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const leagueColor = leagueColors[user?.league] || '#cd7f32';

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1e1e2e]" style={{
      background: 'rgba(10, 10, 15, 0.85)',
      backdropFilter: 'blur(20px)'
    }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold font-display" style={{
            background: 'linear-gradient(135deg, #00f5a0, #00d4ff)',
            color: '#0a0a0f'
          }}>
            EQ
          </div>
          <span className="font-bold font-display text-white text-sm hidden sm:block">EduQuest</span>
          <span className="text-xs font-mono text-slate-600 hidden sm:block">2.0</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              {/* XP + League */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-semibold" style={{ color: '#00f5a0' }}>
                    {user.xp.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-3.5 w-px bg-[#1e1e2e]"></div>
                <span className="text-xs font-display font-semibold" style={{ color: leagueColor }}>
                  {user.league}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-display font-medium px-3 py-1.5 rounded-lg hover:bg-[#1e1e2e]"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
