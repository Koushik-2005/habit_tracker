import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

export default function StatsChart({ stats }) {
  if (!stats) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="h-40 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const getBarColor = (progress) => {
    if (progress >= 80) return '#22c55e';
    if (progress >= 50) return '#0ea5e9';
    if (progress >= 25) return '#eab308';
    return '#9ca3af';
  };

  const statsCards = [
    { 
      label: 'Total Weeks', 
      value: stats.totalWeeks, 
      icon: '📅', 
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    { 
      label: 'Active Habits', 
      value: stats.totalHabits, 
      icon: '🎯', 
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    { 
      label: 'This Week', 
      value: `${stats.currentProgress}%`, 
      icon: '📊', 
      gradient: 'from-orange-500 to-yellow-500',
      bgGradient: 'from-orange-50 to-yellow-50'
    },
    { 
      label: 'Avg Progress', 
      value: `${stats.avgProgress}%`, 
      icon: '🏆', 
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div 
            key={card.label}
            className={`bg-gradient-to-br ${card.bgGradient} rounded-2xl p-5 border border-gray-100 shadow-sm card-hover`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{card.icon}</span>
              <p className="text-sm text-gray-600 font-medium">{card.label}</p>
            </div>
            <p className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Progress History</h3>
            <p className="text-sm text-gray-500 mt-0.5">Your habit completion over time</p>
          </div>
          {stats.weeklyProgress && stats.weeklyProgress.length > 0 && (
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-success-500"></span>
                80%+
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary-500"></span>
                50-79%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-warning-500"></span>
                25-49%
              </span>
            </div>
          )}
        </div>
        
        {stats.weeklyProgress && stats.weeklyProgress.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyProgress} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis 
                  dataKey="weekId" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px -10px rgb(0 0 0 / 0.2)',
                    padding: '12px 16px'
                  }}
                  formatter={(value) => [`${value}%`, 'Completion']}
                  labelFormatter={(label) => `Week: ${label}`}
                  cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
                />
                <Bar dataKey="progress" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {stats.weeklyProgress.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.progress)}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex flex-col items-center justify-center text-gray-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📈</span>
            </div>
            <p className="font-medium">No data yet</p>
            <p className="text-sm text-gray-400 mt-1">Complete some weeks to see your progress chart!</p>
          </div>
        )}
      </div>
    </div>
  );
}
