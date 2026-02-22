import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const leagueColors = {
  Bronze: '#cd7f32',
  Silver: '#c0c0d0',
  Gold: '#ffd700',
  Diamond: '#00d4ff'
};

const leagueIcons = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Diamond: '💎'
};

const rankStyle = (rank) => {
  if (rank === 1) return { color: '#ffd700', bg: 'rgba(255, 215, 0, 0.08)', border: 'rgba(255, 215, 0, 0.2)' };
  if (rank === 2) return { color: '#c0c0d0', bg: 'rgba(192, 192, 208, 0.06)', border: 'rgba(192, 192, 208, 0.15)' };
  if (rank === 3) return { color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.06)', border: 'rgba(205, 127, 50, 0.15)' };
  return { color: '#4b5563', bg: 'transparent', border: '#1e1e2e' };
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLeague, setActiveLeague] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/leaderboard');
        setLeaderboard(res.data.leaderboard);
        setCurrentUserRank(res.data.currentUserRank);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const leagues = ['All', 'Diamond', 'Gold', 'Silver', 'Bronze'];

  const filtered = activeLeague === 'All'
    ? leaderboard
    : leaderboard.filter(u => u.league === activeLeague);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="page-title">Leaderboard</h1>
        <p className="text-slate-500 text-sm mt-1">Ranked by total XP. Top 100 players.</p>
      </div>

      {/* User's own rank */}
      {currentUserRank && (
        <div className="glass-card p-4 mb-6 flex items-center justify-between" style={{ border: '1px solid rgba(0, 245, 160, 0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-sm"
              style={{ background: 'rgba(0, 245, 160, 0.1)', color: '#00f5a0' }}>
              #{currentUserRank.rank}
            </div>
            <div>
              <p className="font-semibold font-display text-white text-sm">Your Rank</p>
              <p className="text-xs text-slate-500">@{currentUserRank.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-bold font-mono" style={{ color: '#00f5a0' }}>{currentUserRank.xp.toLocaleString()}</p>
              <p className="text-xs text-slate-500">XP</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-display font-semibold" style={{ color: leagueColors[currentUserRank.league] }}>
                {leagueIcons[currentUserRank.league]} {currentUserRank.league}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* League filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {leagues.map(l => (
          <button
            key={l}
            onClick={() => setActiveLeague(l)}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-150"
            style={activeLeague === l ? {
              background: 'rgba(0, 245, 160, 0.1)',
              border: '1px solid rgba(0, 245, 160, 0.3)',
              color: '#00f5a0'
            } : {
              background: 'rgba(30, 30, 46, 0.5)',
              border: '1px solid #1e1e2e',
              color: '#6b7280'
            }}
          >
            {l !== 'All' && leagueIcons[l]} {l}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-slate-500 font-display">No players in {activeLeague} league yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => {
            const rs = rankStyle(entry.rank);
            const isCurrentUser = entry.id?.toString() === user?._id?.toString() || entry.username === user?.username;
            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-150"
                style={{
                  background: isCurrentUser ? 'rgba(0, 245, 160, 0.04)' : rs.bg,
                  border: `1px solid ${isCurrentUser ? 'rgba(0, 245, 160, 0.2)' : rs.border}`
                }}
              >
                {/* Rank */}
                <div className="w-8 shrink-0 text-center">
                  {entry.rank <= 3 ? (
                    <span className="text-lg">{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}</span>
                  ) : (
                    <span className="text-sm font-mono font-semibold" style={{ color: rs.color }}>
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Name/Username */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold font-display text-sm text-white truncate">
                      {entry.name}
                      {isCurrentUser && <span className="ml-1.5 text-xs" style={{ color: '#00f5a0' }}>← you</span>}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">@{entry.username}</p>
                </div>

                {/* Streak */}
                <div className="hidden sm:block text-center">
                  <p className="text-xs font-mono text-white">{entry.streak}</p>
                  <p className="text-xs text-slate-600">streak</p>
                </div>

                {/* League */}
                <div className="text-right">
                  <p className="text-xs font-display font-semibold" style={{ color: leagueColors[entry.league] }}>
                    {leagueIcons[entry.league]} {entry.league}
                  </p>
                </div>

                {/* XP */}
                <div className="text-right w-20 shrink-0">
                  <p className="text-sm font-bold font-mono" style={{ color: '#00f5a0' }}>
                    {entry.xp.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600">XP</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
