import { useEffect, useState } from 'react';

export default function ProgressBar({ progress, weekRange }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    // Animate progress on mount
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getProgressGradient = () => {
    if (progress >= 80) return 'from-emerald-400 via-green-500 to-emerald-600';
    if (progress >= 50) return 'from-blue-400 via-primary-500 to-blue-600';
    if (progress >= 25) return 'from-yellow-400 via-orange-500 to-yellow-600';
    return 'from-gray-300 via-gray-400 to-gray-500';
  };

  const getProgressMessage = () => {
    if (progress >= 100) return { emoji: "🎉", text: "Perfect week!" };
    if (progress >= 80) return { emoji: "🔥", text: "Amazing progress!" };
    if (progress >= 50) return { emoji: "💪", text: "Keep going!" };
    if (progress >= 25) return { emoji: "🌱", text: "Good start!" };
    return { emoji: "⭐", text: "Let's do this!" };
  };

  const message = getProgressMessage();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Weekly Progress</h2>
          {weekRange && (
            <p className="text-sm text-gray-500">{weekRange}</p>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {animatedProgress}
            </span>
            <span className="text-xl font-semibold text-gray-400">%</span>
          </div>
          <p className="text-sm text-gray-500 flex items-center justify-end gap-1">
            <span className="text-lg">{message.emoji}</span>
            <span>{message.text}</span>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${getProgressGradient()} relative`}
          style={{ width: `${animatedProgress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
        
        {/* Milestone markers */}
        {[25, 50, 75].map(milestone => (
          <div
            key={milestone}
            className={`absolute top-0 bottom-0 w-0.5 ${
              animatedProgress >= milestone ? 'bg-white/50' : 'bg-gray-300'
            }`}
            style={{ left: `${milestone}%` }}
          />
        ))}
      </div>

      {/* Progress Labels */}
      <div className="flex justify-between mt-3 text-xs">
        {[0, 25, 50, 75, 100].map((mark) => (
          <span 
            key={mark}
            className={`font-medium transition-colors ${
              animatedProgress >= mark ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            {mark}%
          </span>
        ))}
      </div>
    </div>
  );
}
