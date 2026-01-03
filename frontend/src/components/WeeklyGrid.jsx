import { useState } from 'react';

export default function WeeklyGrid({ habits, daysOrder, weekDates, today, onToggle, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(null);

  // Sort habits: compulsory first
  const sortedHabits = [...habits].sort((a, b) => 
    (b.isCompulsory ? 1 : 0) - (a.isCompulsory ? 1 : 0)
  );

  if (habits.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
        <p className="text-gray-500">
          Add your first habit to start tracking your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header Row */}
      <div className="grid grid-cols-9 gap-px bg-gray-100">
        <div className="bg-gray-50 p-3">
          <span className="text-xs font-medium text-gray-500 uppercase">Habit</span>
        </div>
        {daysOrder.map(day => (
          <div 
            key={day} 
            className={`bg-gray-50 p-3 text-center ${
              day === today ? 'bg-primary-50' : ''
            }`}
          >
            <span className={`text-xs font-medium uppercase ${
              day === today ? 'text-primary-600' : 'text-gray-500'
            }`}>
              {day}
            </span>
            {weekDates && (
              <p className={`text-[10px] mt-0.5 ${
                day === today ? 'text-primary-500' : 'text-gray-400'
              }`}>
                {new Date(weekDates[day]).getDate()}
              </p>
            )}
          </div>
        ))}
        <div className="bg-gray-50 p-3 text-center">
          <span className="text-xs font-medium text-gray-500 uppercase"></span>
        </div>
      </div>

      {/* Habit Rows */}
      <div className="divide-y divide-gray-100">
        {sortedHabits.map(habit => (
          <div 
            key={habit.habitId} 
            className={`grid grid-cols-9 gap-px hover:bg-gray-50 ${
              habit.isCompulsory ? 'border-l-4 border-l-purple-500' : ''
            }`}
          >
            {/* Habit Name */}
            <div className="p-3 flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: habit.color || '#0ea5e9' }}
              />
              <span className="text-sm font-medium text-gray-900 truncate" title={habit.title}>
                {habit.title}
              </span>
              {habit.isCompulsory && (
                <span className="px-1 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-bold rounded uppercase flex-shrink-0">
                  C
                </span>
              )}
            </div>

            {/* Day Cells */}
            {daysOrder.map(day => {
              const isScheduled = habit.scheduledDays.includes(day);
              const isCompleted = habit.completion[day];
              const isToday = day === today;
              const habitColor = habit.color || '#0ea5e9';
              // Get the actual date for this day from weekDates
              const dateForDay = weekDates?.[day];

              return (
                <div 
                  key={day}
                  className={`p-3 flex items-center justify-center ${
                    isToday ? 'bg-primary-50/50' : ''
                  }`}
                >
                  {isScheduled ? (
                    <button
                      onClick={() => dateForDay && onToggle(habit.habitId, dateForDay)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all`}
                      style={{
                        backgroundColor: isCompleted ? habitColor : (isToday ? `${habitColor}20` : '#f3f4f6'),
                        border: isToday && !isCompleted ? `2px solid ${habitColor}50` : 'none'
                      }}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isCompleted ? (
                        <svg 
                          className="w-5 h-5 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2.5} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      ) : (
                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: isToday ? habitColor : '#d1d5db' }}
                        ></span>
                      )}
                    </button>
                  ) : (
                    <span className="w-8 h-8 flex items-center justify-center text-gray-300">
                      —
                    </span>
                  )}
                </div>
              );
            })}

            {/* Delete Action */}
            <div className="p-3 flex items-center justify-center relative">
              <button
                onClick={() => setMenuOpen(menuOpen === habit.habitId ? null : habit.habitId)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {menuOpen === habit.habitId && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                  <button
                    onClick={() => {
                      setMenuOpen(null);
                      onDelete(habit.habitId);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
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
