import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function StudyContent() {
  const { goalId, dayId } = useParams();

  const [day, setDay] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDay = async () => {
      try {
        const res = await api.get(`/goals/${goalId}`);
        const dayData = res.data.days.find(d => d._id === dayId);
        if (dayData) {
          setDay(dayData);
          if (dayData.topics?.length > 0) {
            setSelectedTopic(dayData.topics[0]);
          }
        }
      } catch (err) {
        setError('Failed to load day data.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchDay();
  }, [goalId, dayId]);

  const handleExplain = async (topic) => {
    setSelectedTopic(topic);
    setContent(null);
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/ai/generate-content', {
        topic,
        context: day?.title
      });
      setContent(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate content. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to={`/goals/${goalId}`} className="text-xs text-slate-500 hover:text-slate-300 font-display transition-colors">
          ← Back to Goal
        </Link>
        <h1 className="page-title mt-4">Study Topics</h1>
        {day && (
          <p className="text-slate-500 text-sm mt-1">Day {day.dayNumber} — {day.title}</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Topic list */}
        <div className="md:col-span-1">
          <div className="glass-card p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-3">Topics</p>
            <div className="space-y-1.5">
              {day?.topics?.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleExplain(topic)}
                  className="w-full text-left p-3 rounded-xl text-sm transition-all duration-150"
                  style={selectedTopic === topic ? {
                    background: 'rgba(0, 245, 160, 0.1)',
                    border: '1px solid rgba(0, 245, 160, 0.25)',
                    color: '#00f5a0'
                  } : {
                    background: 'transparent',
                    border: '1px solid transparent',
                    color: '#94a3b8'
                  }}
                >
                  <span className="font-medium">{topic}</span>
                </button>
              ))}
            </div>

            {day?.topics?.length === 0 && (
              <p className="text-sm text-slate-600">No topics available.</p>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="md:col-span-2">
          {!selectedTopic && (
            <div className="glass-card p-8 text-center">
              <p className="text-3xl mb-3">📖</p>
              <p className="text-slate-400 font-display">Select a topic to get an AI explanation</p>
            </div>
          )}

          {selectedTopic && !content && !loading && (
            <div className="glass-card p-8 text-center">
              <p className="text-2xl mb-3">💡</p>
              <p className="text-white font-display font-semibold mb-2">{selectedTopic}</p>
              <p className="text-slate-400 text-sm mb-6">Click to get an AI-powered explanation of this topic.</p>
              <button onClick={() => handleExplain(selectedTopic)} className="btn-primary">
                Explain This Topic
              </button>
            </div>
          )}

          {loading && (
            <div className="glass-card p-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div>
              </div>
              <p className="text-slate-400 font-display text-sm">Generating explanation for<br /><span className="text-white font-semibold">"{selectedTopic}"</span></p>
            </div>
          )}

          {error && (
            <div className="glass-card p-6">
              <p className="text-red-400 font-display text-sm mb-3">{error}</p>
              <button onClick={() => handleExplain(selectedTopic)} className="btn-secondary text-sm">Try Again</button>
            </div>
          )}

          {content && !loading && (
            <div className="space-y-4 animate-fade-up">
              {/* Summary */}
              <div className="glass-card p-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-2">Overview</p>
                <h2 className="text-xl font-bold font-display text-white mb-3">{content.topic}</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{content.summary}</p>
              </div>

              {/* Key Points */}
              {content.key_points?.length > 0 && (
                <div className="glass-card p-6">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-3">Key Points</p>
                  <ul className="space-y-2.5">
                    {content.key_points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5"
                          style={{ background: 'rgba(0, 245, 160, 0.1)', color: '#00f5a0' }}>
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples */}
              {content.examples?.length > 0 && (
                <div className="glass-card p-6">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-3">Examples</p>
                  <div className="space-y-3">
                    {content.examples.map((ex, i) => (
                      <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(0, 245, 160, 0.03)', border: '1px solid rgba(0, 245, 160, 0.08)' }}>
                        {typeof ex === 'object' ? (
                          <>
                            <p className="text-sm font-semibold font-display text-white mb-1">{ex.title}</p>
                            <p className="text-sm text-slate-400">{ex.description}</p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-300">{ex}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {content.tips?.length > 0 && (
                <div className="glass-card p-6">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-3">💡 Pro Tips</p>
                  <ul className="space-y-2">
                    {content.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <span style={{ color: '#00f5a0' }}>→</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => handleExplain(selectedTopic)}
                className="btn-ghost text-sm w-full justify-center mt-2"
              >
                ↺ Regenerate Explanation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
