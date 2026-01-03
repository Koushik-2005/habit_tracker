import express from 'express';
import {
  getCurrentWeek,
  toggleHabitCompletion,
  getWeekHistory,
  getWeekById,
  getStats,
  getCalendar,
  getHabitsForDate
} from '../controllers/weekController.js';

const router = express.Router();

// GET /api/week/current - Get current week data
router.get('/current', getCurrentWeek);

// POST /api/week/toggle - Toggle habit completion for a day
router.post('/toggle', toggleHabitCompletion);

// GET /api/week/calendar/:year/:month - Get calendar data for a month
router.get('/calendar/:year/:month', getCalendar);

// GET /api/week/date/:date - Get habits for a specific date
router.get('/date/:date', getHabitsForDate);

// GET /api/weeks/history - Get week history
router.get('/history', getWeekHistory);

// GET /api/weeks/stats - Get stats overview
router.get('/stats', getStats);

// GET /api/weeks/:weekId - Get a specific week
router.get('/:weekId', getWeekById);

export default router;
