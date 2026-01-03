/**
 * Timezone-aware date utilities for Asia/Kolkata
 * All week calculations are based on SUNDAY as the start of the week (Sunday → Saturday)
 */

const TIMEZONE = 'Asia/Kolkata';
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_DAYS_ORDERED = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Get current date components in IST timezone
 * Returns { year, month, day, dayOfWeek, hours, minutes }
 */
export function getISTComponents() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const get = (type) => parts.find(p => p.type === type)?.value;
  
  return {
    year: parseInt(get('year')),
    month: parseInt(get('month')) - 1, // 0-indexed
    day: parseInt(get('day')),
    weekday: get('weekday'),
    hours: parseInt(get('hour')),
    minutes: parseInt(get('minute'))
  };
}

/**
 * Get current date in IST timezone as a Date object set to midnight
 */
export function getCurrentDateIST() {
  const { year, month, day } = getISTComponents();
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Get today's date string in YYYY-MM-DD format (IST)
 */
export function getTodayDateString() {
  const { year, month, day } = getISTComponents();
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Get the day name (Sun, Mon, etc.) for current date in IST
 */
export function getTodayName() {
  const { weekday } = getISTComponents();
  return weekday;
}

/**
 * Get the start of the current week (Sunday 00:00:00) in IST
 */
export function getWeekStart(date = null) {
  const currentDate = date || getCurrentDateIST();
  const dayOfWeek = currentDate.getDay(); // 0 = Sunday
  
  // Go back to Sunday (dayOfWeek = 0 means already Sunday)
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);
  
  return weekStart;
}

/**
 * Get the end of the current week (Saturday 23:59:59) in IST
 */
export function getWeekEnd(date = null) {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Saturday
  weekEnd.setHours(23, 59, 59, 999);
  
  return weekEnd;
}

/**
 * Generate a unique week identifier (e.g., "2026-W01")
 * Uses the year of the week's END date (Saturday) to determine the year
 * This ensures weeks spanning Dec-Jan are labeled with the new year
 */
export function getWeekId(date = null) {
  const weekStart = getWeekStart(date);
  const weekEnd = getWeekEnd(date);
  
  // Use the year from the week's end date (Saturday)
  // This way a week ending Jan 3, 2026 is labeled 2026-W01
  const year = weekEnd.getFullYear();
  
  // Find the first Sunday of the target year
  const firstSunday = new Date(year, 0, 1);
  while (firstSunday.getDay() !== 0) {
    firstSunday.setDate(firstSunday.getDate() + 1);
  }
  
  // If weekStart is before the first Sunday of the year, it's W01
  if (weekStart < firstSunday) {
    return `${year}-W01`;
  }
  
  // Calculate week number
  const pastDays = Math.floor((weekStart - firstSunday) / 86400000);
  const weekNumber = Math.floor(pastDays / 7) + 1;
  
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Format date for display (e.g., "Jan 2, 2026")
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: TIMEZONE
  });
}

/**
 * Format date range for week display
 */
export function formatWeekRange(weekStart, weekEnd) {
  const start = formatDate(weekStart);
  const end = formatDate(weekEnd);
  return `${start} - ${end}`;
}

/**
 * Get dates for each day of the week
 */
export function getWeekDates(weekStart) {
  const dates = {};
  const startDate = new Date(weekStart);
  
  WEEK_DAYS_ORDERED.forEach((day, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    dates[day] = date.toISOString().split('T')[0];
  });
  
  return dates;
}

/**
 * Check if a given date is in the current week
 */
export function isCurrentWeek(weekStart) {
  const currentWeekStart = getWeekStart();
  const givenWeekStart = new Date(weekStart);
  
  return currentWeekStart.toDateString() === givenWeekStart.toDateString();
}

/**
 * Get day index (0-6) for ordering, where Sunday = 0
 */
export function getDayIndex(day) {
  return WEEK_DAYS_ORDERED.indexOf(day);
}

/**
 * Get calendar month data for a given month
 * Returns array of week arrays, each containing day objects
 */
export function getCalendarMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
  
  const weeks = [];
  let currentWeek = [];
  
  // Helper to format date as YYYY-MM-DD
  const formatDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  
  // Add empty slots for days before the first of month
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month, -(startDayOfWeek - i - 1));
    currentWeek.push({
      date: prevMonthDay.getDate(),
      fullDate: formatDateStr(prevMonthDay),
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  const todayStr = getTodayDateString();
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const fullDate = formatDateStr(date);
    
    currentWeek.push({
      date: day,
      fullDate,
      isCurrentMonth: true,
      isToday: fullDate === todayStr,
      dayName: DAYS_OF_WEEK[date.getDay()]
    });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Fill remaining days from next month
  if (currentWeek.length > 0) {
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      const date = new Date(year, month + 1, nextMonthDay);
      currentWeek.push({
        date: nextMonthDay,
        fullDate: formatDateStr(date),
        isCurrentMonth: false,
        isToday: false
      });
      nextMonthDay++;
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
}

/**
 * Get data for a specific date
 */
export function getDateInfo(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay();
  const dayName = DAYS_OF_WEEK[dayOfWeek];
  const weekStart = getWeekStart(date);
  const weekEnd = getWeekEnd(date);
  const weekId = getWeekId(date);
  
  return {
    date: dateStr,
    dayName,
    dayIndex: dayOfWeek,
    weekId,
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0]
  };
}

export { DAYS_OF_WEEK, WEEK_DAYS_ORDERED, TIMEZONE };
