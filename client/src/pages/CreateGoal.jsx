import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

export default function CreateGoal() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'generating' | 'preview' | 'saving'
  const [form, setForm] = useState({
    title: '',
    durationDays: 30,
    difficulty: 'Intermediate',
    dailyTimeMinutes: 60
  });
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'durationDays' || name === 'dailyTimeMinutes' ? Number(value) : value }));
    setError('');
  };

  const validate = () => {
    if (!form.title.trim()) return 'Please enter a goal title.';
    if (form.durationDays < 1 || form.durationDays > 90) return 'Duration must be between 1 and 90 days.';
    if (form.dailyTimeMinutes < 15) return 'Daily time must be at least 15 minutes.';
    return null;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setStep('generating');
    setError('');
    try {
      const res = await api.post('/ai/generate-roadmap', {
        goal: form.title,
        durationDays: form.durationDays,
        difficulty: form.difficulty,
        dailyTimeMinutes: form.dailyTimeMinutes
      });
      setRoadmap(res.data.roadmap);
      setStep('preview');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap. Please try again.');
      setStep('form');
    }
  };

  const handleSave = async () => {
    setStep('saving');
    try {
      await api.post('/goals/create', {
        title: form.title,
        durationDays: form.durationDays,
        difficulty: form.difficulty,
        dailyTimeMinutes: form.dailyTimeMinutes,
        roadmap
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save goal.');
      setStep('preview');
    }
  };

  if (step === 'generating') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="glass-card p-12 text-center max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="spinner" style={{ width: 48, height: 48, borderWidth: 3 }}></div>
            </div>
          </div>
          <h2 className="text-xl font-bold font-display text-white mb-2">Generating Your Roadmap</h2>
          <p className="text-sm text-slate-500">
            AI is crafting a personalized {form.durationDays}-day plan for<br />
            <span className="text-white font-medium">"{form.title}"</span>
          </p>
          <p className="text-xs text-slate-600 mt-4 font-mono">This may take up to 30 seconds...</p>
        </div>
      </div>
    );
  }

  if (step === 'preview' && roadmap) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">{form.title}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {form.durationDays}-day {form.difficulty} plan · ~{form.dailyTimeMinutes} min/day
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('form')} className="btn-secondary">← Regenerate</button>
            <button
              onClick={handleSave}
              disabled={step === 'saving'}
              className="btn-primary disabled:opacity-50"
            >
              {step === 'saving' ? (
                <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div>Saving...</>
              ) : 'Save Goal →'}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-400 font-display p-3 rounded-xl mb-4" style={{ background: 'rgba(255, 71, 87, 0.08)', border: '1px solid rgba(255, 71, 87, 0.15)' }}>
            {error}
          </div>
        )}

        {/* Roadmap preview */}
        <div className="space-y-3">
          {roadmap.slice(0, 5).map((day) => (
            <div key={day.day} className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0"
                  style={{ background: 'rgba(0, 245, 160, 0.1)', color: '#00f5a0', border: '1px solid rgba(0, 245, 160, 0.2)' }}>
                  {day.day}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold font-display text-white text-sm">{day.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{day.topics?.join(' · ')}</p>
                  <p className="text-xs text-slate-400 mt-1">{day.task}</p>
                </div>
                <div className="shrink-0">
                  <span className="text-xs font-mono text-slate-500">{day.estimated_time_minutes}m</span>
                </div>
              </div>
            </div>
          ))}

          {roadmap.length > 5 && (
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-slate-500">
                ... and <span className="text-white font-semibold">{roadmap.length - 5} more days</span> in your full roadmap
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setStep('form')} className="btn-secondary">← Edit & Regenerate</button>
          <button
            onClick={handleSave}
            disabled={step === 'saving'}
            className="btn-primary disabled:opacity-50"
          >
            {step === 'saving' ? (
              <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div>Saving...</>
            ) : 'Save & Start Goal →'}
          </button>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <Link to="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 font-display transition-colors">
          ← Back to Dashboard
        </Link>
        <h1 className="page-title mt-4">Create New Goal</h1>
        <p className="text-slate-500 text-sm mt-1">AI will generate a complete roadmap based on your inputs.</p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <div>
            <label className="label">What do you want to learn?</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Learn Python for Data Science, Master React.js, Study Machine Learning..."
              className="input-field"
              maxLength={100}
            />
            <p className="text-xs text-slate-600 mt-1.5">Be specific — a focused goal gives a better roadmap.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duration (days)</label>
              <input
                type="number"
                name="durationDays"
                value={form.durationDays}
                onChange={handleChange}
                min={1}
                max={90}
                className="input-field"
              />
              <p className="text-xs text-slate-600 mt-1.5">Max 90 days</p>
            </div>
            <div>
              <label className="label">Daily time (minutes)</label>
              <input
                type="number"
                name="dailyTimeMinutes"
                value={form.dailyTimeMinutes}
                onChange={handleChange}
                min={15}
                max={480}
                step={15}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {difficulties.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, difficulty: d }))}
                  className="p-3 rounded-xl text-sm font-semibold font-display transition-all duration-150"
                  style={form.difficulty === d ? {
                    background: 'rgba(0, 245, 160, 0.1)',
                    border: '1px solid rgba(0, 245, 160, 0.35)',
                    color: '#00f5a0'
                  } : {
                    background: 'rgba(30, 30, 46, 0.5)',
                    border: '1px solid #1e1e2e',
                    color: '#6b7280'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-400 font-display p-3 rounded-xl" style={{ background: 'rgba(255, 71, 87, 0.08)', border: '1px solid rgba(255, 71, 87, 0.15)' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Link to="/dashboard" className="btn-secondary flex-1 justify-center">Cancel</Link>
          <button type="submit" className="btn-primary flex-1 justify-center">
            Generate Roadmap with AI →
          </button>
        </div>
      </form>
    </div>
  );
}
