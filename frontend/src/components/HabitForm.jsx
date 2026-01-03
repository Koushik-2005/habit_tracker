import { useState } from 'react';
import { createHabit } from '../api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const COLORS = [
  { name: 'Blue', value: '#0ea5e9' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
];

export default function HabitForm({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [isCompulsory, setIsCompulsory] = useState(false);
  const [color, setColor] = useState('#0ea5e9');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const selectAllDays = () => {
    setSelectedDays(DAYS);
  };

  const selectWeekdays = () => {
    setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  };

  const selectWeekends = () => {
    setSelectedDays(['Sun', 'Sat']);
  };

  const handleCompulsoryToggle = () => {
    const newValue = !isCompulsory;
    setIsCompulsory(newValue);
    // Auto-select weekdays for compulsory habits
    if (newValue && selectedDays.length === 0) {
      selectWeekdays();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a habit name');
      return;
    }

    if (selectedDays.length === 0) {
      setError('Please select at least one day');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createHabit({
        title: title.trim(),
        scheduledDays: selectedDays,
        isCompulsory,
        color
      });
      onSuccess();
    } catch (err) {
      console.error('Error creating habit:', err);
      setError('Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create New Habit</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Habit Name */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Exercise, Read 30 mins..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Compulsory Toggle */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleCompulsoryToggle}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                isCompulsory 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isCompulsory ? 'bg-purple-500' : 'bg-gray-100'
                }`}>
                  <svg className={`w-5 h-5 ${isCompulsory ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className={`font-medium ${isCompulsory ? 'text-purple-700' : 'text-gray-900'}`}>
                    Compulsory Habit
                  </p>
                  <p className="text-xs text-gray-500">
                    Auto-repeats every week on selected days
                  </p>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-all ${
                isCompulsory ? 'bg-purple-500' : 'bg-gray-200'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isCompulsory ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </div>
            </button>
          </div>

          {/* Schedule Days */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Days
            </label>
            
            {/* Quick Select */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={selectAllDays}
                className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
              >
                Every Day
              </button>
              <button
                type="button"
                onClick={selectWeekdays}
                className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={selectWeekends}
                className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
              >
                Weekends
              </button>
            </div>

            {/* Day Buttons */}
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedDays.includes(day)
                      ? isCompulsory 
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-xl transition-all ${
                    color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-3 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                isCompulsory 
                  ? 'bg-purple-500 hover:bg-purple-600' 
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              {loading ? 'Creating...' : isCompulsory ? 'Create Compulsory' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
