import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

const difficultyColors = {
  Beginner: { bg: 'rgba(0, 245, 160, 0.08)', text: '#00f5a0', border: 'rgba(0, 245, 160, 0.2)' },
  Intermediate: { bg: 'rgba(255, 189, 0, 0.08)', text: '#ffbd00', border: 'rgba(255, 189, 0, 0.2)' },
  Advanced: { bg: 'rgba(255, 71, 87, 0.08)', text: '#ff4757', border: 'rgba(255, 71, 87, 0.2)' }
};

export default function GoalCard({ goal }) {
  const diff = difficultyColors[goal.difficulty] || difficultyColors.Intermediate;
  const isCompleted = goal.progressPercentage === 100 || goal.completed;

  return (
    <Link to={`/goals/${goal._id}`} className="block group">
      <div className="glass-card-hover p-5 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-semibold font-display text-white text-base leading-tight line-clamp-2 group-hover:text-[#00f5a0] transition-colors duration-200">
              {goal.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {goal.durationDays} day{goal.durationDays !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-xs font-display font-semibold px-2 py-0.5 rounded-md" style={{
              background: diff.bg,
              color: diff.text,
              border: `1px solid ${diff.border}`
            }}>
              {goal.difficulty}
            </span>
            {isCompleted && (
              <span className="text-xs font-display font-semibold px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(0, 245, 160, 0.1)', color: '#00f5a0', border: '1px solid rgba(0, 245, 160, 0.25)' }}>
                ✓ Done
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <ProgressBar percentage={goal.progressPercentage} height="h-1.5" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Progress</span>
            <span className="text-xs font-mono font-semibold" style={{ color: '#00f5a0' }}>
              {goal.progressPercentage}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
