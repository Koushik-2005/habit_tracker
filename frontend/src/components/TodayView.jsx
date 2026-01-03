import { useState } from 'react';

export default function TodayView({ habits, today, onToggle, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(null);

  // Filter habits scheduled for today, sort compulsory first
  const todayHabits = habits
    .filter(habit => habit.scheduledDays.includes(today))
    .sort((a, b) => (b.isCompulsory ? 1 : 0) - (a.isCompulsory ? 1 : 0));

  const completedCount = todayHabits.filter(
    habit => habit.completion[today]
  ).length;

  const compulsoryCount = todayHabits.filter(h => h.isCompulsory).length;
  const compulsoryCompleted = todayHabits.filter(h => h.isCompulsory && h.completion[today]).length;

  if (todayHabits.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🌴</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No habits for today</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          You don't have any habits scheduled for {today}. Take a break and recharge!
        </p>
      </div>
    );
  }

  const progressPercent = Math.round((completedCount / todayHabits.length) * 100);

  return (
    <div className="space-y-4">
      {/* Today's Summary */}
      <div className="bg-gradient-to-br from-primary-500 via-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Today's Progress</p>
            <h2 className="text-4xl font-bold mt-2">
              {completedCount} <span className="text-2xl text-blue-200">/ {todayHabits.length}</span>
            </h2>
            <p className="text-blue-100 text-sm mt-1">habits completed</p>
            {compulsoryCount > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-1 bg-purple-500/30 rounded-lg text-xs font-medium">
                  🔄 {compulsoryCompleted}/{compulsoryCount} compulsory
                </span>
              </div>
            )}
          </div>
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${progressPercent * 2.51} 251`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Habit List */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {todayHabits.map((habit, index) => (
          <div
            key={habit.habitId}
            className={`flex items-center p-4 hover:bg-gray-50/80 transition-all duration-200 group ${
              habit.isCompulsory ? 'border-l-4 border-l-purple-500 bg-purple-50/30' : ''
            } ${index !== todayHabits.length - 1 ? 'border-b border-gray-100' : ''}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <button
              onClick={() => onToggle(habit.habitId, today)}
              className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center mr-4 transition-all duration-200 btn-press shadow-sm hover:shadow-md`}
              style={{
                backgroundColor: habit.completion[today] ? (habit.color || '#22c55e') : 'white',
                borderColor: habit.completion[today] ? (habit.color || '#22c55e') : '#e5e7eb',
                boxShadow: habit.completion[today] ? `0 4px 14px ${habit.color || '#22c55e'}40` : undefined
              }}
            >
              {habit.completion[today] && (
                <svg 
                  className="w-4 h-4 text-white check-animate" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-medium truncate transition-all duration-200 ${
                  habit.completion[today] 
                    ? 'text-gray-400 line-through' 
                    : 'text-gray-900'
                }`}>
                  {habit.title}
                </h3>
                {habit.isCompulsory && (
                  <span className="flex-shrink-0 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide shadow-sm">
                    Required
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {habit.scheduledDays.join(' • ')}
              </p>
            </div>

            {habit.completion[today] && (
              <span 
                className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full mr-3 shadow-sm"
                style={{ 
                  backgroundColor: `${habit.color || '#22c55e'}15`,
                  color: habit.color || '#22c55e'
                }}
              >
                Done ✓
              </span>
            )}

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(menuOpen === habit.habitId ? null : habit.habitId)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {menuOpen === habit.habitId && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-10 animate-fade-in-up">
                  <button
                    onClick={() => {
                      setMenuOpen(null);
                      onDelete(habit.habitId);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Habit
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
