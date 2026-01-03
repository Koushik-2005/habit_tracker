import axios from 'axios';

// Get API URL from environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const checkHealth = () => api.get('/api/health');

// Habits API
export const createHabit = (habitData) => api.post('/api/habits', habitData);
export const getHabits = () => api.get('/api/habits');
export const updateHabit = (id, habitData) => api.put(`/api/habits/${id}`, habitData);
export const deleteHabit = (id) => api.delete(`/api/habits/${id}`);

// Weeks API
export const getCurrentWeek = () => api.get('/api/week/current');
export const toggleHabitCompletion = (habitId, day) => 
  api.post('/api/week/toggle', { habitId, day });
export const getWeekHistory = (skip = 0, limit = 10) => 
  api.get(`/api/weeks/history?skip=${skip}&limit=${limit}`);
export const getWeekById = (weekId) => api.get(`/api/weeks/${weekId}`);
export const getStats = () => api.get('/api/weeks/stats');

// Calendar API
export const getCalendar = (year, month) => 
  api.get(`/api/week/calendar/${year}/${month}`);
export const getHabitsForDate = (date) => 
  api.get(`/api/week/date/${date}`);

export default api;
