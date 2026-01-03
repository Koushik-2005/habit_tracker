import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TodayView from './components/TodayView';
import WeeklyGrid from './components/WeeklyGrid';
import HabitForm from './components/HabitForm';
import ProgressBar from './components/ProgressBar';
import StatsChart from './components/StatsChart';
import HistoryView from './components/HistoryView';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Toast from './components/Toast';
import Confetti from './components/Confetti';
import QuoteCard from './components/QuoteCard';
import StreakBadge from './components/StreakBadge';
import Calendar from './components/Calendar';
import DateView from './components/DateView';
import { getCurrentWeek, toggleHabitCompletion, getStats, deleteHabit } from './api';

function App() {
  const [weekData, setWeekData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousProgress, setPreviousProgress] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarCollapsed, setCalendarCollapsed] = useState(true);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch current week data
  const fetchWeekData = useCallback(async () => {
    try {
      setError(null);
      const response = await getCurrentWeek();
      setWeekData(response.data);
    } catch (err) {
      console.error('Error fetching week data:', err);
      setError('Failed to load data. Please check your connection.');
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchWeekData(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [fetchWeekData, fetchStats]);

  // Handle habit toggle
  const handleToggle = async (habitId, day) => {
    try {
      const response = await toggleHabitCompletion(habitId, day);
      
      // Store previous progress to detect 100% completion
      const oldProgress = weekData?.progress || 0;
      
      // Update local state optimistically
      setWeekData(prev => ({
        ...prev,
        progress: response.data.progress,
        habits: prev.habits.map(habit => 
          habit.habitId === habitId
            ? {
                ...habit,
                completion: {
                  ...habit.completion,
                  [day]: response.data.completed
                }
              }
            : habit
        )
      }));

      // Check for 100% completion celebration
      if (response.data.progress === 100 && oldProgress < 100) {
        setShowConfetti(true);
        showToast('🎉 Perfect week! All habits completed!', 'celebration');
      } else if (response.data.completed) {
        showToast('Habit completed! Keep it up! 💪', 'success');
      }

      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error('Error toggling habit:', err);
      setError('Failed to update. Please try again.');
      showToast('Failed to update habit', 'error');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle new habit created
  const handleHabitCreated = () => {
    setShowHabitForm(false);
    fetchWeekData();
    fetchStats();
    showToast('New habit created! 🌟', 'success');
  };

  // Handle delete habit
  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteHabit(habitId);
      
      // Update local state
      setWeekData(prev => ({
        ...prev,
        habits: prev.habits.filter(h => h.habitId !== habitId)
      }));
      
      // Refresh data
      fetchWeekData();
      fetchStats();
      showToast('Habit deleted', 'info');
    } catch (err) {
      console.error('Error deleting habit:', err);
      setError('Failed to delete habit. Please try again.');
      showToast('Failed to delete habit', 'error');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Calculate streak (consecutive weeks with >80% completion)
  const calculateStreak = () => {
    if (!stats?.weekly) return 0;
    let streak = 0;
    for (const week of [...stats.weekly].reverse()) {
      if (week.completionRate >= 80) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    const today = weekData?.todayDate;
    if (date === today) {
      setSelectedDate(null);
      setActiveTab('today');
    } else {
      setSelectedDate(date);
    }
    setCalendarCollapsed(true);
  };

  // Handle back from date view
  const handleBackToToday = () => {
    setSelectedDate(null);
    setActiveTab('today');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header 
        weekRange={weekData?.weekRange} 
        onAddHabit={() => setShowHabitForm(true)} 
      />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

            {/* Show DateView when a date is selected, otherwise show normal tabs */}
            {selectedDate ? (
              <DateView
                selectedDate={selectedDate}
                todayDate={weekData?.todayDate}
                onToggle={handleToggle}
                onBack={handleBackToToday}
              />
            ) : (
              <>
                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in-up">
                  {/* Quote Card */}
                  <div className="md:col-span-2">
                    <QuoteCard />
                  </div>
                  
                  {/* Streak Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <p className="text-sm text-gray-500 mb-2">Weekly Streak</p>
                    <StreakBadge streak={calculateStreak()} type="weeks" />
                    <p className="text-xs text-gray-400 mt-2">80%+ completion</p>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <ProgressBar 
                    progress={weekData?.progress || 0} 
                    weekRange={weekData?.weekRange}
                  />
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl mb-6 shadow-sm border border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  {[
                    { id: 'today', label: 'Today', icon: '📅' },
                    { id: 'week', label: 'This Week', icon: '📊' },
                    { id: 'stats', label: 'Stats', icon: '📈' },
                    { id: 'history', label: 'History', icon: '📚' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-md shadow-primary-500/25'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  {activeTab === 'today' && weekData && (
                    <TodayView
                      habits={weekData.habits}
                      today={weekData.today}
                      onToggle={handleToggle}
                      onDelete={handleDeleteHabit}
                    />
                  )}

                  {activeTab === 'week' && weekData && (
                    <WeeklyGrid
                      habits={weekData.habits}
                      daysOrder={weekData.daysOrder}
                      weekDates={weekData.weekDates}
                      today={weekData.today}
                      onToggle={handleToggle}
                      onDelete={handleDeleteHabit}
                    />
                  )}

                  {activeTab === 'stats' && (
                    <StatsChart stats={stats} />
                  )}

                  {activeTab === 'history' && (
                    <HistoryView />
                  )}
                </div>
              </>
            )}
          </main>

          {/* Right Side Calendar Panel - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <Calendar
                selectedDate={selectedDate || weekData?.todayDate}
                onDateSelect={handleDateSelect}
                isCollapsed={false}
                onToggleCollapse={() => {}}
                todayDate={weekData?.todayDate}
              />
              
              {/* Week info card */}
              <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Current Week</h4>
                <p className="text-sm font-semibold text-gray-900">{weekData?.weekRange}</p>
                <p className="text-xs text-gray-400 mt-1">Sunday → Saturday</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Calendar Button/Overlay */}
      <div className="lg:hidden">
        <Calendar
          selectedDate={selectedDate || weekData?.todayDate}
          onDateSelect={handleDateSelect}
          isCollapsed={calendarCollapsed}
          onToggleCollapse={() => setCalendarCollapsed(!calendarCollapsed)}
          todayDate={weekData?.todayDate}
        />
        
        {/* Mobile Calendar Overlay */}
        {!calendarCollapsed && (
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setCalendarCollapsed(true)}>
            <div 
              className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 rounded-t-3xl animate-slide-in-up"
              onClick={e => e.stopPropagation()}
            >
              <Calendar
                selectedDate={selectedDate || weekData?.todayDate}
                onDateSelect={handleDateSelect}
                isCollapsed={false}
                onToggleCollapse={() => setCalendarCollapsed(true)}
                todayDate={weekData?.todayDate}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      {showHabitForm && (
        <HabitForm 
          onClose={() => setShowHabitForm(false)} 
          onSuccess={handleHabitCreated}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confetti Celebration */}
      {showConfetti && (
        <Confetti onComplete={() => setShowConfetti(false)} />
      )}
    </div>
  );
}

export default App;
