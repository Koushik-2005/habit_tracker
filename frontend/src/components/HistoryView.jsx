import { useState, useEffect } from 'react';
import { getWeekHistory } from '../api';
import LoadingSpinner from './LoadingSpinner';

export default function HistoryView() {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [expandedWeek, setExpandedWeek] = useState(null);

  const limit = 5;

  const fetchHistory = async (skipCount = 0, append = false) => {
    try {
      setLoading(true);
      const response = await getWeekHistory(skipCount, limit);
      
      if (append) {
        setWeeks(prev => [...prev, ...response.data.weeks]);
      } else {
        setWeeks(response.data.weeks);
      }
      
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const loadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchHistory(newSkip, true);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-success-600 bg-success-100';
    if (progress >= 50) return 'text-primary-600 bg-primary-100';
    if (progress >= 25) return 'text-warning-600 bg-warning-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading && weeks.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No history yet</h3>
        <p className="text-gray-500">
          Complete your first week to see it in your history!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {weeks.map(week => (
        <div key={week.weekId} className="bg-white rounded-2xl overflow-hidden">
          {/* Week Header */}
          <button
            onClick={() => setExpandedWeek(expandedWeek === week.weekId ? null : week.weekId)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${getProgressColor(week.progress)}`}>
                {week.progress}%
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">{week.weekId}</h3>
                <p className="text-sm text-gray-500">{week.weekRange}</p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedWeek === week.weekId ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Week Details */}
          {expandedWeek === week.weekId && (
            <div className="border-t border-gray-100 p-4">
              <div className="space-y-3">
                {week.habits.map((habit, index) => {
                  const scheduledDays = habit.scheduledDays;
                  const completedDays = scheduledDays.filter(day => habit.completion[day]).length;
                  
                  return (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-gray-900">{habit.title}</p>
                        <p className="text-xs text-gray-500">{scheduledDays.join(', ')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {completedDays}/{scheduledDays.length}
                        </span>
                        <div className="flex space-x-1">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                            const isScheduled = scheduledDays.includes(day);
                            const isCompleted = habit.completion[day];
                            
                            return (
                              <div
                                key={day}
                                className={`w-5 h-5 rounded text-[10px] flex items-center justify-center ${
                                  !isScheduled
                                    ? 'bg-gray-100 text-gray-400'
                                    : isCompleted
                                      ? 'bg-success-500 text-white'
                                      : 'bg-red-100 text-red-500'
                                }`}
                                title={day}
                              >
                                {isScheduled ? (isCompleted ? '✓' : '✗') : ''}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-all"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
