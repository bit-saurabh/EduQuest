import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function QuizComponent({ day, onClose, onXpGained }) {
  const { updateUser } = useAuth();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSelect = (questionIndex, option) => {
    if (result) return; // Disable after submit
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < day.quiz.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const formattedAnswers = day.quiz.map((_, i) => ({
        questionIndex: i,
        selectedAnswer: answers[i] || ''
      }));
      const res = await api.post(`/goals/days/${day._id}/quiz`, { answers: formattedAnswers });
      setResult(res.data);
      if (res.data.xpGained > 0) {
        updateUser({ xp: res.data.userXp });
        onXpGained?.(res.data.xpGained);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl glass-card max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e1e2e]">
          <div>
            <h2 className="font-bold font-display text-white text-lg">Day {day.dayNumber} Quiz</h2>
            <p className="text-sm text-slate-500 mt-0.5">{day.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            ✕
          </button>
        </div>

        {/* Result state */}
        {result ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{result.passed ? '🎯' : '📚'}</div>
              <p className="text-3xl font-bold font-mono" style={{ color: result.passed ? '#00f5a0' : '#ff4757' }}>
                {result.score}%
              </p>
              <p className="text-slate-400 mt-1 font-display">
                {result.correct}/{result.total} correct
              </p>
              {result.passed ? (
                <div className="mt-3">
                  {result.xpGained > 0 ? (
                    <p className="text-sm font-display font-semibold" style={{ color: '#ffd700' }}>
                      +{result.xpGained} XP earned!
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 font-display">XP already awarded for this quiz.</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 mt-2">Score 70% or more to pass and earn XP.</p>
              )}
            </div>

            {/* Question review */}
            <div className="space-y-3">
              {result.results.map((r, i) => (
                <div key={i} className="p-3 rounded-xl" style={{
                  background: r.isCorrect ? 'rgba(0, 245, 160, 0.05)' : 'rgba(255, 71, 87, 0.05)',
                  border: `1px solid ${r.isCorrect ? 'rgba(0, 245, 160, 0.15)' : 'rgba(255, 71, 87, 0.15)'}`
                }}>
                  <p className="text-sm font-medium text-white mb-1">{r.question}</p>
                  <p className="text-xs text-slate-400">Your answer: <span style={{ color: r.isCorrect ? '#00f5a0' : '#ff4757' }}>{r.userAnswer}</span></p>
                  {!r.isCorrect && <p className="text-xs text-slate-400">Correct: <span style={{ color: '#00f5a0' }}>{r.correctAnswer}</span></p>}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleRetry} className="btn-secondary flex-1">Retry Quiz</button>
              <button onClick={onClose} className="btn-primary flex-1">Done</button>
            </div>
          </div>
        ) : (
          /* Questions */
          <div className="p-6 space-y-6">
            {day.quiz.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-semibold text-white mb-3 font-display">
                  <span className="text-slate-500 mr-2">Q{qi + 1}.</span>{q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = answers[qi] === opt;
                    return (
                      <button
                        key={oi}
                        onClick={() => handleSelect(qi, opt)}
                        className="w-full text-left p-3 rounded-xl text-sm transition-all duration-150"
                        style={{
                          background: isSelected ? 'rgba(0, 245, 160, 0.1)' : 'rgba(30, 30, 46, 0.5)',
                          border: isSelected ? '1px solid rgba(0, 245, 160, 0.35)' : '1px solid #1e1e2e',
                          color: isSelected ? '#00f5a0' : '#94a3b8'
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {error && <p className="text-sm text-red-400 font-display">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length < day.quiz.length}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div>Submitting...</> : 'Submit Quiz'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
