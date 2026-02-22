import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProgressBar from '../components/ProgressBar';

const leagueColors = { Bronze: '#cd7f32', Silver: '#c0c0d0', Gold: '#ffd700', Diamond: '#00d4ff' };
const leagueIcons = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Diamond: '💎' };
const leagueNextXP = { Bronze: 200, Silver: 500, Gold: 1000, Diamond: null };
const leaguePrevXP = { Bronze: 0, Silver: 200, Gold: 500, Diamond: 1000 };

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/leaderboard/profile');
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const xp = user?.xp || 0;
  const league = user?.league || 'Bronze';
  const nextXP = leagueNextXP[league];
  const prevXP = leaguePrevXP[league];
  const xpPercent = nextXP ? Math.min(100, Math.round(((xp - prevXP) / (nextXP - prevXP)) * 100)) : 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="page-title mb-8">Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: User info */}
        <div className="md:col-span-1 space-y-4">
          {/* Avatar + name */}
          <div className="glass-card p-6 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold font-display"
              style={{ background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.15), rgba(0, 212, 255, 0.15))', color: '#00f5a0', border: '1px solid rgba(0, 245, 160, 0.2)' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <h2 className="font-bold font-display text-white text-lg">{user?.name}</h2>
            <p className="text-slate-500 text-sm font-mono">@{user?.username}</p>
            <p className="text-slate-600 text-xs mt-1">{user?.email}</p>
          </div>

          {/* League */}
          <div className="glass-card p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-3">League Status</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{leagueIcons[league]}</span>
              <span className="text-xl font-bold font-display" style={{ color: leagueColors[league] }}>
                {league}
              </span>
            </div>
            <ProgressBar percentage={xpPercent} height="h-2" />
            <p className="text-xs text-slate-600 mt-2 font-mono">
              {xp.toLocaleString()} / {nextXP ? nextXP.toLocaleString() : '∞'} XP
              {nextXP && ` → ${Object.keys(leagueNextXP).find(k => leagueNextXP[k] === nextXP)}`}
            </p>
          </div>

          {/* Rank */}
          {profile?.stats?.rank && (
            <div className="glass-card p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-1">Global Rank</p>
              <p className="text-3xl font-bold font-mono text-white">#{profile.stats.rank}</p>
            </div>
          )}
        </div>

        {/* Right: Stats + Goals */}
        <div className="md:col-span-2 space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold font-mono" style={{ color: '#00f5a0' }}>{xp.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Total XP</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold font-mono text-white">{user?.streak || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Day Streak</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold font-mono text-white">{profile?.stats?.totalGoals || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Total Goals</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold font-mono text-white">{profile?.stats?.completedGoals || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Completed</p>
            </div>
          </div>

          {/* XP breakdown */}
          <div className="glass-card p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-4">XP Breakdown</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Complete a day</span>
                <span className="text-sm font-mono font-semibold" style={{ color: '#00f5a0' }}>+10 XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Pass a quiz (≥70%)</span>
                <span className="text-sm font-mono font-semibold" style={{ color: '#00f5a0' }}>+5 XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Complete a goal</span>
                <span className="text-sm font-mono font-semibold" style={{ color: '#00f5a0' }}>+50 XP</span>
              </div>
              <div className="divider"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold font-display text-white">Your total</span>
                <span className="text-base font-bold font-mono" style={{ color: '#00f5a0' }}>{xp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          {/* Recent goals */}
          {profile?.recentGoals?.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-display">Recent Goals</p>
                <Link to="/dashboard" className="text-xs font-display" style={{ color: '#00f5a0' }}>
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {profile.recentGoals.map(goal => (
                  <Link key={goal._id} to={`/goals/${goal._id}`} className="block">
                    <div className="flex items-center justify-between gap-4 hover:bg-[#1a1a26] p-2 rounded-lg transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{goal.title}</p>
                        <p className="text-xs text-slate-500 font-mono">{goal.durationDays} days</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,30,46,0.8)' }}>
                          <div className="h-full rounded-full" style={{ width: `${goal.progressPercentage}%`, background: 'linear-gradient(90deg, #00f5a0, #00d4ff)' }}></div>
                        </div>
                        <span className="text-xs font-mono" style={{ color: '#00f5a0' }}>{goal.progressPercentage}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Member since */}
          <p className="text-xs text-slate-600 text-right font-mono">
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
          </p>
        </div>
      </div>
    </div>
  );
}
