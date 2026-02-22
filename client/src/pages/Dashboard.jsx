import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GoalCard from '../components/GoalCard';
import ProgressBar from '../components/ProgressBar';

const leagueInfo = {
  Bronze: { color: '#cd7f32', next: 'Silver', nextXP: 200, icon: '🥉' },
  Silver: { color: '#c0c0d0', next: 'Gold', nextXP: 500, icon: '🥈' },
  Gold: { color: '#ffd700', next: 'Diamond', nextXP: 1000, icon: '🥇' },
  Diamond: { color: '#00d4ff', next: null, nextXP: null, icon: '💎' }
};

const leaguePrevXP = { Bronze: 0, Silver: 200, Gold: 500, Diamond: 1000 };

export default function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get('/goals');
        setGoals(res.data);
      } catch (err) {
        console.error('Failed to fetch goals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const league = leagueInfo[user?.league] || leagueInfo.Bronze;
  const prevXP = leaguePrevXP[user?.league] || 0;
  const userXp = user?.xp || 0;

  let xpPercent = 0;
  if (league.nextXP) {
    const rangeSize = league.nextXP - prevXP;
    const userProgress = userXp - prevXP;
    xpPercent = Math.min(100, Math.round((userProgress / rangeSize) * 100));
  } else {
    xpPercent = 100;
  }

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's where you stand today.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* XP Card */}
        <div className="glass-card p-5 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-1">Total XP</p>
              <p className="text-3xl font-bold font-mono" style={{ color: '#00f5a0' }}>
                {userXp.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-1">League</p>
              <div className="flex items-center gap-1.5 justify-end">
                <span>{league.icon}</span>
                <span className="text-lg font-bold font-display" style={{ color: league.color }}>
                  {user?.league}
                </span>
              </div>
            </div>
          </div>
          {league.next && (
            <div>
              <ProgressBar percentage={xpPercent} height="h-2" />
              <p className="text-xs text-slate-600 mt-2 font-mono">
                {userXp.toLocaleString()} / {league.nextXP?.toLocaleString()} XP → {league.next}
              </p>
            </div>
          )}
          {!league.next && (
            <p className="text-xs font-display font-semibold mt-2" style={{ color: '#00d4ff' }}>
              ✦ Maximum league reached
            </p>
          )}
        </div>

        {/* Streak */}
        <div className="glass-card p-5 flex flex-col justify-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-2">Streak</p>
          <p className="text-3xl font-bold font-mono text-white">{user?.streak || 0}</p>
          <p className="text-xs text-slate-500 mt-1">day{user?.streak !== 1 ? 's' : ''} 🔥</p>
        </div>

        {/* Goals */}
        <div className="glass-card p-5 flex flex-col justify-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-2">Active Goals</p>
          <p className="text-3xl font-bold font-mono text-white">{activeGoals.length}</p>
          <p className="text-xs text-slate-500 mt-1">{completedGoals.length} completed</p>
        </div>
      </div>

      {/* Active Goals */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Active Goals</h2>
          <Link to="/goals/create" className="btn-primary text-xs px-4 py-2">
            + New Goal
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="spinner w-6 h-6"></div>
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-4xl mb-4">🎯</p>
            <p className="text-white font-display font-semibold mb-2">No active goals yet</p>
            <p className="text-sm text-slate-500 mb-6">Create your first AI-powered goal to get started.</p>
            <Link to="/goals/create" className="btn-primary inline-flex">
              Create Your First Goal
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map(goal => (
              <GoalCard key={goal._id} goal={goal} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="section-title mb-4">Completed Goals</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map(goal => (
              <GoalCard key={goal._id} goal={goal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
