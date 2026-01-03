import { useState, useEffect } from 'react';
import { getCalendar } from '../api';

const DAYS_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar({ selectedDate, onDateSelect, isCollapsed, onToggleCollapse, todayDate }) {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // visibleMonth controls which month is rendered in the calendar
  // This is separate from selectedDate - selecting a date doesn't change the visible month
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // Fetch calendar data when visibleMonth changes
  useEffect(() => {
    fetchCalendar();
  }, [visibleMonth]);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const response = await getCalendar(visibleMonth.year, visibleMonth.month);
      setCalendarData(response.data);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setVisibleMonth(prev => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setVisibleMonth(prev => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const goToToday = () => {
    // Use the backend's today date if available
    const today = todayDate || calendarData?.today;
    if (today) {
      const [year, month] = today.split('-').map(Number);
      // Update visible month to show today's month
      setVisibleMonth({ year, month });
      // Also select today
      onDateSelect(today);
    }
  };

  // Check if a date is in the future (after today)
  const isFutureDate = (fullDate) => {
    const today = todayDate || calendarData?.today;
    if (!today) return false;
    return fullDate > today;
  };

  const getDayClasses = (day) => {
    const baseClasses = 'w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 relative';
    
    if (!day.isCurrentMonth) {
      return `${baseClasses} text-gray-300 cursor-not-allowed`;
    }

    const isFuture = isFutureDate(day.fullDate);
    
    let classes = baseClasses;
    
    // Today highlight
    if (day.isToday) {
      classes += ' ring-2 ring-primary-500 ring-offset-2';
    }
    
    // Selected date
    if (day.fullDate === selectedDate) {
      classes += ' bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg shadow-primary-500/30';
    } else if (isFuture) {
      // Future dates - different styling (dashed border, lighter)
      classes += ' text-gray-400 border border-dashed border-gray-300 hover:border-primary-400 hover:text-primary-500';
    } else if (day.isComplete) {
      classes += ' bg-green-100 text-green-700 hover:bg-green-200';
    } else if (day.hasHabits && day.completedCount > 0) {
      classes += ' bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
    } else if (day.hasHabits) {
      classes += ' bg-gray-100 text-gray-700 hover:bg-gray-200';
    } else {
      classes += ' text-gray-600 hover:bg-gray-100';
    }
    
    if (day.isCurrentMonth) {
      classes += ' cursor-pointer';
    }
    
    return classes;
  };

  // Mobile collapsed view
  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed bottom-4 right-4 z-40 bg-gradient-to-br from-primary-500 to-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-primary-500/30 flex items-center gap-2 md:hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-medium">Calendar</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">
            {calendarData?.monthName} {calendarData?.year}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 rounded-lg hover:bg-white/80 text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs font-medium bg-white rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 rounded-lg hover:bg-white/80 text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onToggleCollapse}
          className="absolute top-2 right-2 p-2 rounded-lg hover:bg-white/50 text-gray-500 md:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {DAYS_HEADER.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="p-3 pt-1">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-1">
            {calendarData?.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                  const isFuture = isFutureDate(day.fullDate);
                  const isClickable = day.isCurrentMonth;
                  
                  return (
                    <button
                      key={dayIndex}
                      onClick={() => isClickable && onDateSelect(day.fullDate)}
                      disabled={!isClickable}
                      className={getDayClasses(day)}
                    >
                      {day.date}
                      {/* Completion indicator dot - only show for past/today dates with habits */}
                      {day.isCurrentMonth && !isFuture && day.hasHabits && (
                        <span 
                          className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                            day.isComplete 
                              ? 'bg-green-500' 
                              : day.completedCount > 0 
                                ? 'bg-yellow-500' 
                                : 'bg-gray-400'
                          }`}
                        />
                      )}
                      {/* Future date indicator - small plus icon hint */}
                      {day.isCurrentMonth && isFuture && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary-400 rounded-full opacity-50" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
