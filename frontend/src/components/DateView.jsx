import { useState, useEffect } from 'react';
import { getHabitsForDate, getHabits, createHabit } from '../api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = [
  { name: 'Blue', value: '#0ea5e9' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
];

export default function DateView({ selectedDate, onToggle, onBack, todayDate }) {
  const [dateData, setDateData] = useState(null);
  const [allHabits, setAllHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFutureDate, setIsFutureDate] = useState(false);
  
  // Inline habit form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDays, setNewDays] = useState([]);
  const [newColor, setNewColor] = useState('#0ea5e9');
  const [newIsCompulsory, setNewIsCompulsory] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDate && todayDate) {
      setIsFutureDate(selectedDate > todayDate);
      fetchDateData();
    }
  }, [selectedDate, todayDate]);

  const fetchDateData = async () => {
    try {
      setLoading(true);
      
      // For future dates, get all active habits to show what's scheduled
      if (selectedDate > todayDate) {
        const habitsRes = await getHabits();
        setAllHabits(habitsRes.data || []);
        
        // Get the day name for the selected date
        const date = new Date(selectedDate + 'T00:00:00');
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        
        setDateData({
          date: selectedDate,
          dayName,
          habits: [],
          isFuture: true
        });
      } else {
        const response = await getHabitsForDate(selectedDate);
        setDateData(response.data);
      }
    } catch (error) {
      console.error('Error fetching date data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get habits scheduled for the future date's day
  const getScheduledHabitsForDay = () => {
    if (!dateData?.dayName || !allHabits.length) return [];
    return allHabits.filter(h => h.isActive && h.scheduledDays.includes(dateData.dayName));
  };

  // Toggle day selection for new habit
  const toggleDay = (day) => {
    setNewDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Reset form
  const resetForm = () => {
    setNewTitle('');
    setNewDays([]);
    setNewColor('#0ea5e9');
    setNewIsCompulsory(false);
    setFormError('');
    setShowAddForm(false);
  };

  // Pre-select the current day when opening form
  const openAddForm = () => {
    if (dateData?.dayName) {
      setNewDays([dateData.dayName]);
    }
    setShowAddForm(true);
  };

  // Handle new habit submission
  const handleAddHabit = async (e) => {
    e.preventDefault();
    
    if (!newTitle.trim()) {
      setFormError('Please enter a habit name');
      return;
    }
    if (newDays.length === 0) {
      setFormError('Please select at least one day');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await createHabit({
        title: newTitle.trim(),
        scheduledDays: newDays,
        isCompulsory: newIsCompulsory,
        color: newColor
      });
      resetForm();
      // Refresh habits list
      const habitsRes = await getHabits();
      setAllHabits(habitsRes.data || []);
    } catch (err) {
      console.error('Error creating habit:', err);
      setFormError('Failed to create habit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dateData) {
    return null;
  }

  const scheduledHabits = isFutureDate ? getScheduledHabitsForDay() : dateData.habits;

  // Future date view
  if (isFutureDate) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        {/* Future Date Header */}
        <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Today
          </button>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-medium">
                🔮 Future
              </span>
            </div>
            <p className="text-white/70 text-sm font-medium uppercase tracking-wide">
              {dateData.dayName}
            </p>
            <h2 className="text-2xl font-bold mt-1">
              {formatDisplayDate(selectedDate)}
            </h2>
            <p className="text-white/70 text-sm mt-3">
              Plan ahead by adding habits for this day
            </p>
          </div>
        </div>

        {/* Scheduled Habits Preview */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <span>📋</span>
              Habits scheduled for {dateData.dayName}
            </h3>
          </div>
          
          {scheduledHabits.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No habits for {dateData.dayName}</h3>
              <p className="text-gray-500 text-sm mb-4">
                You haven't scheduled any habits for {dateData.dayName}s yet.
              </p>
              {!showAddForm && (
                <button
                  onClick={openAddForm}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-blue-500 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-blue-600 shadow-lg shadow-primary-500/25 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Habit
                </button>
              )}
            </div>
          ) : (
            <>
              {scheduledHabits.map((habit, index) => (
                <div
                  key={habit._id}
                  className={`flex items-center p-4 ${
                    habit.isCompulsory ? 'border-l-4 border-l-purple-500 bg-purple-50/30' : ''
                  } ${index !== scheduledHabits.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div 
                    className="w-8 h-8 rounded-xl border-2 border-dashed flex items-center justify-center mr-4"
                    style={{ borderColor: habit.color || '#d1d5db' }}
                  >
                    <span 
                      className="w-3 h-3 rounded-full opacity-50"
                      style={{ backgroundColor: habit.color || '#9ca3af' }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {habit.title}
                      </h3>
                      {habit.isCompulsory && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {habit.scheduledDays.join(' • ')}
                    </p>
                  </div>

                  <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                    Upcoming
                  </span>
                </div>
              ))}
              
              {!showAddForm && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={openAddForm}
                    className="w-full flex items-center justify-center gap-2 py-2 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Another Habit
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Inline Add Habit Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <span>✨</span>
                  Add New Habit
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddHabit} className="p-4 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {formError}
                </div>
              )}

              {/* Habit Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Morning Exercise, Read 30 mins..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                  autoFocus
                />
              </div>

              {/* Compulsory Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setNewIsCompulsory(!newIsCompulsory)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    newIsCompulsory 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      newIsCompulsory ? 'bg-purple-500' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-4 h-4 ${newIsCompulsory ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${newIsCompulsory ? 'text-purple-700' : 'text-gray-900'}`}>
                        Compulsory Habit
                      </p>
                      <p className="text-xs text-gray-500">
                        Auto-repeats weekly
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full p-0.5 transition-all ${
                    newIsCompulsory ? 'bg-purple-500' : 'bg-gray-200'
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      newIsCompulsory ? 'translate-x-4' : 'translate-x-0'
                    }`}></div>
                  </div>
                </button>
              </div>

              {/* Schedule Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Schedule Days
                </label>
                <div className="flex gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setNewDays(DAYS)}
                    className="px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])}
                    className="px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                  >
                    Weekdays
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDays(['Sun', 'Sat'])}
                    className="px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                  >
                    Weekends
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${
                        newDays.includes(day)
                          ? newIsCompulsory 
                            ? 'bg-purple-500 text-white'
                            : 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Color
                </label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewColor(c.value)}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        newColor === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                    newIsCompulsory 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'bg-primary-500 hover:bg-primary-600'
                  }`}
                >
                  {submitting ? 'Creating...' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info about future dates */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <p className="text-sm text-blue-800">
            This is a future date. Add habits now to track them when the day arrives. 
            Habits you create will automatically appear on their scheduled days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Date Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Today
        </button>
        
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wide">
            {dateData.dayName}
          </p>
          <h2 className="text-2xl font-bold mt-1">
            {formatDisplayDate(selectedDate)}
          </h2>
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <span className="text-2xl font-bold">{dateData.completedCount}</span>
              <span className="text-white/70 ml-1">/ {dateData.totalCount}</span>
            </div>
            <div>
              <p className="text-sm text-white/70">Completion</p>
              <p className="text-lg font-semibold">{dateData.progress}%</p>
            </div>
          </div>
          {!dateData.isCurrentWeek && (
            <span className="inline-block mt-3 px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
              📚 Historical Data
            </span>
          )}
        </div>
      </div>

      {/* Habits List */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {dateData.habits.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No habits scheduled</h3>
            <p className="text-gray-500 text-sm">
              There are no habits scheduled for this day.
            </p>
          </div>
        ) : (
          dateData.habits.map((habit, index) => (
            <div
              key={habit.habitId}
              className={`flex items-center p-4 hover:bg-gray-50/80 transition-all duration-200 ${
                habit.isCompulsory ? 'border-l-4 border-l-purple-500 bg-purple-50/30' : ''
              } ${index !== dateData.habits.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <button
                onClick={() => dateData.isCurrentWeek && onToggle(habit.habitId, dateData.dayName)}
                disabled={!dateData.isCurrentWeek}
                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center mr-4 transition-all duration-200 ${
                  !dateData.isCurrentWeek ? 'cursor-not-allowed opacity-60' : 'btn-press'
                }`}
                style={{
                  backgroundColor: habit.completed ? (habit.color || '#22c55e') : 'white',
                  borderColor: habit.completed ? (habit.color || '#22c55e') : '#e5e7eb',
                  boxShadow: habit.completed ? `0 4px 14px ${habit.color || '#22c55e'}40` : undefined
                }}
              >
                {habit.completed && (
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
                    habit.completed 
                      ? 'text-gray-400 line-through' 
                      : 'text-gray-900'
                  }`}>
                    {habit.title}
                  </h3>
                  {habit.isCompulsory && (
                    <span className="flex-shrink-0 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {habit.scheduledDays.join(' • ')}
                </p>
              </div>

              {habit.completed && (
                <span 
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full"
                  style={{ 
                    backgroundColor: `${habit.color || '#22c55e'}15`,
                    color: habit.color || '#22c55e'
                  }}
                >
                  Done ✓
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info for historical data */}
      {!dateData.isCurrentWeek && dateData.habits.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <p className="text-sm text-amber-800">
            This is historical data from a past week. You can view the completion status but cannot modify it.
          </p>
        </div>
      )}
    </div>
  );
}
