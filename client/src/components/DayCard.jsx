export default function DayCard({ day, onComplete, onStudy, onQuiz, isCompleting }) {
  const isLocked = false; // Can implement sequential locking if needed

  return (
    <div className={`glass-card p-5 transition-all duration-300 ${
      day.completed
        ? 'border-[rgba(0,245,160,0.15)]'
        : 'border-[#1e1e2e]'
    }`}
      style={day.completed ? { boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(0, 245, 160, 0.03)' } : {}}
    >
      {/* Day header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-mono shrink-0 ${
            day.completed
              ? 'bg-[rgba(0,245,160,0.15)] text-[#00f5a0]'
              : 'bg-[#1e1e2e] text-slate-400'
          }`}>
            {day.completed ? '✓' : day.dayNumber}
          </div>
          <div>
            <h4 className="font-semibold font-display text-white text-sm leading-tight">
              {day.title}
            </h4>
            <span className="text-xs font-mono text-slate-500 mt-0.5">
              ~{day.estimatedTimeMinutes || 60} min
            </span>
          </div>
        </div>
        <div className={`text-xs font-display font-semibold px-2 py-0.5 rounded-md ${
          day.completed
            ? 'text-[#00f5a0] bg-[rgba(0,245,160,0.1)]'
            : 'text-slate-500 bg-[#1e1e2e]'
        }`}>
          {day.completed ? 'Completed' : 'Pending'}
        </div>
      </div>

      {/* Topics */}
      {day.topics && day.topics.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-2">Topics</p>
          <div className="flex flex-wrap gap-1.5">
            {day.topics.map((topic, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-medium text-slate-300"
                style={{ background: 'rgba(30, 30, 46, 0.8)', border: '1px solid #1e1e2e' }}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Task */}
      {day.task && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(0, 245, 160, 0.03)', border: '1px solid rgba(0, 245, 160, 0.08)' }}>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-display mb-1">Today's Task</p>
          <p className="text-sm text-slate-300 leading-relaxed">{day.task}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-4">
        {!day.completed && (
          <button
            onClick={() => onComplete(day._id)}
            disabled={isCompleting}
            className="btn-primary text-xs px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompleting ? (
              <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div>Marking...</>
            ) : (
              <><span>✓</span> Mark Complete</>
            )}
          </button>
        )}

        {day.topics && day.topics.length > 0 && (
          <button
            onClick={() => onStudy(day)}
            className="btn-secondary text-xs px-4 py-2"
          >
            📖 Study Topics
          </button>
        )}

        {day.quiz && day.quiz.length > 0 && (
          <button
            onClick={() => onQuiz(day)}
            className="btn-ghost text-xs px-4 py-2"
            style={day.quizXpAwarded ? { color: '#ffd700' } : {}}
          >
            {day.quizXpAwarded ? '⭐ Quiz Done' : '🎯 Take Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}
