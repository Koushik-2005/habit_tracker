export default function StreakBadge({ streak, type = 'days' }) {
  const getStreakEmoji = () => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '🔥';
    if (streak >= 7) return '⚡';
    if (streak >= 3) return '💪';
    return '🌱';
  };

  const getStreakColor = () => {
    if (streak >= 30) return 'from-yellow-400 to-orange-500';
    if (streak >= 14) return 'from-orange-400 to-red-500';
    if (streak >= 7) return 'from-purple-400 to-pink-500';
    if (streak >= 3) return 'from-blue-400 to-cyan-500';
    return 'from-green-400 to-emerald-500';
  };

  if (streak === 0) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${getStreakColor()} text-white text-sm font-bold shadow-lg`}>
      <span>{getStreakEmoji()}</span>
      <span>{streak}</span>
      <span className="text-xs font-medium opacity-90">{type}</span>
    </div>
  );
}
