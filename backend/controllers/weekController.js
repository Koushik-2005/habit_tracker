import Week from '../models/Week.js';
import Habit from '../models/Habit.js';
import { 
  getWeekStart, 
  getWeekEnd, 
  getWeekId, 
  getTodayName,
  getTodayDateString,
  formatWeekRange,
  getWeekDates,
  getCurrentDateIST,
  getCalendarMonth,
  getDateInfo,
  WEEK_DAYS_ORDERED
} from '../utils/dateUtils.js';

/**
 * Create a new week if needed (called on startup and by cron)
 */
export async function createNewWeekIfNeeded() {
  try {
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();
    const weekId = getWeekId();

    // Check if current week already exists
    const existingWeek = await Week.findOne({ weekId });
    if (existingWeek) {
      console.log(`📅 Week ${weekId} already exists`);
      return existingWeek;
    }

    // Mark all previous weeks as not current
    await Week.updateMany({}, { isCurrent: false });

    // Get all active habits (compulsory habits are always included)
    const habits = await Habit.find({ isActive: true });

    // Create habit entries for the new week
    // Compulsory habits are automatically included with reset completion status
    // Week runs from Sunday to Saturday
    const habitEntries = habits.map(habit => ({
      habitId: habit._id,
      title: habit.title,
      scheduledDays: habit.scheduledDays,
      isCompulsory: habit.isCompulsory || false,
      color: habit.color || '#0ea5e9',
      completion: {
        Sun: false, Mon: false, Tue: false, Wed: false,
        Thu: false, Fri: false, Sat: false
      }
    }));

    // Create new week
    const newWeek = new Week({
      weekStart,
      weekEnd,
      weekId,
      habits: habitEntries,
      isCurrent: true,
      progress: 0
    });

    await newWeek.save();
    console.log(`✅ Created new week: ${weekId}`);
    return newWeek;
  } catch (error) {
    console.error('Error creating new week:', error);
    throw error;
  }
}

/**
 * Get current week data
 * GET /api/week/current
 */
export async function getCurrentWeek(req, res) {
  try {
    // Ensure current week exists
    let currentWeek = await Week.findOne({ isCurrent: true });
    
    if (!currentWeek) {
      currentWeek = await createNewWeekIfNeeded();
    }

    const today = getTodayName();
    const weekDates = getWeekDates(currentWeek.weekStart);

    res.json({
      weekId: currentWeek.weekId,
      weekStart: currentWeek.weekStart,
      weekEnd: currentWeek.weekEnd,
      weekRange: formatWeekRange(currentWeek.weekStart, currentWeek.weekEnd),
      today,
      todayDate: getTodayDateString(),
      weekDates,
      habits: currentWeek.habits,
      progress: currentWeek.progress,
      daysOrder: WEEK_DAYS_ORDERED
    });
  } catch (error) {
    console.error('Error fetching current week:', error);
    res.status(500).json({ error: 'Failed to fetch current week' });
  }
}

/**
 * Toggle habit completion for a specific day
 * POST /api/week/toggle
 */
export async function toggleHabitCompletion(req, res) {
  try {
    const { habitId, day } = req.body;

    if (!habitId || !day) {
      return res.status(400).json({ error: 'habitId and day are required' });
    }

    if (!WEEK_DAYS_ORDERED.includes(day)) {
      return res.status(400).json({ error: 'Invalid day' });
    }

    const currentWeek = await Week.findOne({ isCurrent: true });
    if (!currentWeek) {
      return res.status(404).json({ error: 'No current week found' });
    }

    // Find the habit in the week
    const habitEntry = currentWeek.habits.find(
      h => h.habitId.toString() === habitId
    );

    if (!habitEntry) {
      return res.status(404).json({ error: 'Habit not found in current week' });
    }

    // Check if this day is scheduled for this habit
    if (!habitEntry.scheduledDays.includes(day)) {
      return res.status(400).json({ 
        error: 'Habit is not scheduled for this day' 
      });
    }

    // Toggle the completion status
    habitEntry.completion[day] = !habitEntry.completion[day];
    
    // Recalculate progress
    currentWeek.calculateProgress();
    
    await currentWeek.save();

    res.json({
      message: 'Habit completion toggled',
      habitId,
      day,
      completed: habitEntry.completion[day],
      progress: currentWeek.progress
    });
  } catch (error) {
    console.error('Error toggling habit completion:', error);
    res.status(500).json({ error: 'Failed to toggle habit completion' });
  }
}

/**
 * Get week history (previous weeks)
 * GET /api/weeks/history
 */
export async function getWeekHistory(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const weeks = await Week.find({ isCurrent: false })
      .sort({ weekStart: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Week.countDocuments({ isCurrent: false });

    const formattedWeeks = weeks.map(week => ({
      weekId: week.weekId,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      weekRange: formatWeekRange(week.weekStart, week.weekEnd),
      habits: week.habits,
      progress: week.progress
    }));

    res.json({
      weeks: formattedWeeks,
      total,
      hasMore: skip + weeks.length < total
    });
  } catch (error) {
    console.error('Error fetching week history:', error);
    res.status(500).json({ error: 'Failed to fetch week history' });
  }
}

/**
 * Get a specific week by ID
 * GET /api/weeks/:weekId
 */
export async function getWeekById(req, res) {
  try {
    const { weekId } = req.params;
    
    const week = await Week.findOne({ weekId });
    if (!week) {
      return res.status(404).json({ error: 'Week not found' });
    }

    res.json({
      weekId: week.weekId,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      weekRange: formatWeekRange(week.weekStart, week.weekEnd),
      habits: week.habits,
      progress: week.progress,
      isCurrent: week.isCurrent,
      daysOrder: WEEK_DAYS_ORDERED
    });
  } catch (error) {
    console.error('Error fetching week:', error);
    res.status(500).json({ error: 'Failed to fetch week' });
  }
}

/**
 * Get stats overview
 * GET /api/weeks/stats
 */
export async function getStats(req, res) {
  try {
    const totalWeeks = await Week.countDocuments();
    const allWeeks = await Week.find().sort({ weekStart: -1 });
    
    // Calculate average progress
    const avgProgress = allWeeks.length > 0
      ? Math.round(allWeeks.reduce((sum, w) => sum + w.progress, 0) / allWeeks.length)
      : 0;

    // Get current week
    const currentWeek = await Week.findOne({ isCurrent: true });

    // Get total habits
    const totalHabits = await Habit.countDocuments({ isActive: true });

    // Weekly progress for chart (last 8 weeks)
    const weeklyProgress = allWeeks.slice(0, 8).reverse().map(week => ({
      weekId: week.weekId,
      progress: week.progress,
      weekRange: formatWeekRange(week.weekStart, week.weekEnd)
    }));

    res.json({
      totalWeeks,
      avgProgress,
      totalHabits,
      currentProgress: currentWeek?.progress || 0,
      weeklyProgress
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

/**
 * Get calendar data for a specific month
 * GET /api/week/calendar/:year/:month
 */
export async function getCalendar(req, res) {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month) - 1; // JavaScript months are 0-indexed
    
    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }
    
    const weeks = getCalendarMonth(year, month);
    
    // Get all weeks that fall within this calendar month
    const firstDate = weeks[0][0].fullDate;
    const lastDate = weeks[weeks.length - 1][6].fullDate;
    
    const dbWeeks = await Week.find({
      weekStart: { $lte: new Date(lastDate) },
      weekEnd: { $gte: new Date(firstDate) }
    });
    
    // Build a map of date -> completion data
    const dateCompletionMap = {};
    
    dbWeeks.forEach(week => {
      week.habits.forEach(habit => {
        WEEK_DAYS_ORDERED.forEach((day, index) => {
          const weekStartDate = new Date(week.weekStart);
          const dateObj = new Date(weekStartDate);
          dateObj.setDate(weekStartDate.getDate() + index);
          const dateStr = dateObj.toISOString().split('T')[0];
          
          if (!dateCompletionMap[dateStr]) {
            dateCompletionMap[dateStr] = { scheduled: 0, completed: 0 };
          }
          
          if (habit.scheduledDays.includes(day)) {
            dateCompletionMap[dateStr].scheduled++;
            if (habit.completion[day]) {
              dateCompletionMap[dateStr].completed++;
            }
          }
        });
      });
    });
    
    // Enhance calendar data with completion info
    const enhancedWeeks = weeks.map(week => 
      week.map(day => ({
        ...day,
        hasHabits: dateCompletionMap[day.fullDate]?.scheduled > 0,
        completedCount: dateCompletionMap[day.fullDate]?.completed || 0,
        totalCount: dateCompletionMap[day.fullDate]?.scheduled || 0,
        isComplete: dateCompletionMap[day.fullDate]?.scheduled > 0 && 
                    dateCompletionMap[day.fullDate]?.completed === dateCompletionMap[day.fullDate]?.scheduled
      }))
    );
    
    res.json({
      year,
      month: month + 1,
      monthName: new Date(year, month).toLocaleString('en-US', { month: 'long' }),
      weeks: enhancedWeeks,
      today: getTodayDateString(),
      currentDay: getTodayName()
    });
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
}

/**
 * Get habits for a specific date
 * GET /api/week/date/:date
 */
export async function getHabitsForDate(req, res) {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const dateInfo = getDateInfo(date);
    
    // Find the week containing this date
    const week = await Week.findOne({ weekId: dateInfo.weekId });
    
    if (!week) {
      return res.json({
        date,
        dayName: dateInfo.dayName,
        weekId: dateInfo.weekId,
        habits: [],
        isCurrentWeek: false,
        message: 'No data available for this date'
      });
    }
    
    // Filter habits scheduled for this day
    const dayHabits = week.habits
      .filter(h => h.scheduledDays.includes(dateInfo.dayName))
      .map(h => ({
        habitId: h.habitId,
        title: h.title,
        isCompulsory: h.isCompulsory,
        color: h.color,
        completed: h.completion[dateInfo.dayName],
        scheduledDays: h.scheduledDays
      }));
    
    const completedCount = dayHabits.filter(h => h.completed).length;
    
    res.json({
      date,
      dayName: dateInfo.dayName,
      weekId: dateInfo.weekId,
      weekRange: formatWeekRange(week.weekStart, week.weekEnd),
      habits: dayHabits,
      completedCount,
      totalCount: dayHabits.length,
      progress: dayHabits.length > 0 ? Math.round((completedCount / dayHabits.length) * 100) : 0,
      isCurrentWeek: week.isCurrent
    });
  } catch (error) {
    console.error('Error fetching habits for date:', error);
    res.status(500).json({ error: 'Failed to fetch habits for date' });
  }
}
