export default function Header({ weekRange, onAddHabit }) {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Habit Tracker
              </h1>
              {weekRange && (
                <p className="text-xs text-gray-500 font-medium">{weekRange}</p>
              )}
            </div>
          </div>

          {/* Add Habit Button */}
          <button
            onClick={onAddHabit}
            className="group inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-primary-500 to-blue-500 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-primary-500/25 btn-press"
          >
            <svg 
              className="w-5 h-5 mr-1.5 group-hover:rotate-90 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            Add Habit
          </button>
        </div>
      </div>
    </header>
  );
}
