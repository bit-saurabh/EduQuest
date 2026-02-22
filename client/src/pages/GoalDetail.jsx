import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DayCard from '../components/DayCard';
import ProgressBar from '../components/ProgressBar';
import QuizComponent from '../components/QuizComponent';

export default function GoalDetail() {
  const { goalId } = useParams();
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingDay, setCompletingDay] = useState(null);
  const [quizDay, setQuizDay] = useState(null);
  const [xpNotice, setXpNotice] = useState(null);

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  const fetchGoal = async () => {
    try {
      const res = await api.get(`/goals/${goalId}`);
      setGoal(res.data.goal);
      setDays(res.data.days);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goal.');
    } finally {
      setLoading(false);
    }
  };

  const showXpNotice = (xp) => {
    setXpNotice(xp);
    setTimeout(() => setXpNotice(null), 3000);
  };

  const handleComplete = async (dayId) => {
    setCompletingDay(dayId);
    try {
      const res = await api.put(`/goals/days/${dayId}/complete`);
      // Update local state
      setDays(prev => prev.map(d => d._id === dayId ? { ...d, completed: true, xpAwarded: true } : d));
      setGoal(prev => ({ ...prev, progressPercentage: res.data.progressPercentage, completed: res.data.goalCompleted }));
      updateUser({ xp: res.data.userXp, league: res.data.userLeague, streak: res.data.userStreak });
      if (res.data.xpGained > 0) showXpNotice(res.data.xpGained);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark day complete.');
    } finally {
      setCompletingDay(null);
    }
  };

  const handleStudy = (day) => {
    navigate(`/goals/${goalId}/study/${day._id}`);
  };

  const handleQuiz = (day) => {
    setQuizDay(day);
  };

  const handleQuizXp = (xp) => {
    if (xp > 0) showXpNotice(xp);
    // Refresh days to update quizXpAwarded status
    fetchGoal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 text-center">
        <p className="text-red-400 font-display">{error || 'Goal not found.'}</p>
        <Link to="/dashboard" className="btn-secondary mt-4 inline-flex">← Dashboard</Link>
      </div>
    );
  }

  const completedCount = days.filter(d => d.completed).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* XP notification */}
      {xpNotice && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl font-display font-semibold text-sm animate-slide-in"
          style={{ background: 'rgba(0, 245, 160, 0.15)', border: '1px solid rgba(0, 245, 160, 0.35)', color: '#00f5a0' }}>
          +{xpNotice} XP earned! ⚡
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 font-display transition-colors">
          ← Dashboard
        </Link>
        <div className="flex items-start justify-between mt-4 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="page-title truncate">{goal.title}</h1>
              {goal.completed && (
                <span className="text-xs font-display font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(0, 245, 160, 0.1)', color: '#00f5a0', border: '1px solid rgba(0, 245, 160, 0.25)' }}>
                  ✓ Completed
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="font-mono">{goal.durationDays} days</span>
              <span>·</span>
              <span>{goal.difficulty}</span>
              <span>·</span>
              <span className="font-mono">{completedCount}/{goal.durationDays} done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-display font-semibold text-white">Overall Progress</span>
          <span className="text-lg font-bold font-mono" style={{ color: '#00f5a0' }}>
            {goal.progressPercentage}%
          </span>
        </div>
        <ProgressBar percentage={goal.progressPercentage} height="h-3" />
        <div className="flex justify-between mt-3">
          <span className="text-xs text-slate-500">{completedCount} days completed</span>
          <span className="text-xs text-slate-500">{goal.durationDays - completedCount} remaining</span>
        </div>
      </div>

      {/* Days */}
      <div>
        <h2 className="section-title mb-4">Daily Roadmap</h2>
        <div className="space-y-3">
          {days.map(day => (
            <DayCard
              key={day._id}
              day={day}
              onComplete={handleComplete}
              onStudy={handleStudy}
              onQuiz={handleQuiz}
              isCompleting={completingDay === day._id}
            />
          ))}
        </div>
      </div>

      {/* Quiz modal */}
      {quizDay && (
        <QuizComponent
          day={quizDay}
          onClose={() => setQuizDay(null)}
          onXpGained={handleQuizXp}
        />
      )}
    </div>
  );
}
