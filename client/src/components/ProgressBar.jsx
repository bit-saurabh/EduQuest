export default function ProgressBar({ percentage, height = 'h-2', showLabel = false, color = 'primary' }) {
  const clampedPercent = Math.min(100, Math.max(0, percentage || 0));
  
  const fills = {
    primary: 'linear-gradient(90deg, #00f5a0, #00d4ff)',
    gold: 'linear-gradient(90deg, #ffd700, #ff9d00)',
    red: 'linear-gradient(90deg, #ff4757, #ff6b81)'
  };

  const glows = {
    primary: '0 0 10px rgba(0, 245, 160, 0.4)',
    gold: '0 0 10px rgba(255, 215, 0, 0.4)',
    red: '0 0 10px rgba(255, 71, 87, 0.4)'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-500 font-display">Progress</span>
          <span className="text-xs font-mono font-semibold" style={{ color: '#00f5a0' }}>
            {clampedPercent}%
          </span>
        </div>
      )}
      <div className={`w-full ${height} rounded-full overflow-hidden`} style={{ background: 'rgba(30, 30, 46, 0.8)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${clampedPercent}%`,
            background: fills[color] || fills.primary,
            boxShadow: clampedPercent > 0 ? glows[color] || glows.primary : 'none'
          }}
        />
      </div>
    </div>
  );
}
