import Habit from '../models/Habit.js';
import Week from '../models/Week.js';
import { getWeekStart, getWeekEnd, getWeekId } from '../utils/dateUtils.js';

/**
 * Create a new habit
 * POST /api/habits
 */
export async function createHabit(req, res) {
  try {
    const { title, scheduledDays, isCompulsory = false, color = '#0ea5e9' } = req.body;

    if (!title || !scheduledDays || scheduledDays.length === 0) {
      return res.status(400).json({ 
        error: 'Title and at least one scheduled day are required' 
      });
    }

    // Create the habit
    const habit = new Habit({ title, scheduledDays, isCompulsory, color });
    await habit.save();

    // Add habit to current week if it exists
    const currentWeek = await Week.findOne({ isCurrent: true });
    if (currentWeek) {
      currentWeek.habits.push({
        habitId: habit._id,
        title: habit.title,
        scheduledDays: habit.scheduledDays,
        isCompulsory: habit.isCompulsory,
        color: habit.color,
        completion: {
          Mon: false, Tue: false, Wed: false, Thu: false,
          Fri: false, Sat: false, Sun: false
        }
      });
      currentWeek.calculateProgress();
      await currentWeek.save();
    }

    res.status(201).json({ 
      message: 'Habit created successfully',
      habit 
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
}

/**
 * Get all active habits
 * GET /api/habits
 */
export async function getAllHabits(req, res) {
  try {
    const habits = await Habit.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
}

/**
 * Update a habit
 * PUT /api/habits/:id
 */
export async function updateHabit(req, res) {
  try {
    const { id } = req.params;
    const { title, scheduledDays, isActive, isCompulsory, color } = req.body;

    const habit = await Habit.findByIdAndUpdate(
      id,
      { title, scheduledDays, isActive, isCompulsory, color },
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Update habit in current week
    const currentWeek = await Week.findOne({ isCurrent: true });
    if (currentWeek) {
      const habitEntry = currentWeek.habits.find(
        h => h.habitId.toString() === id
      );
      if (habitEntry) {
        habitEntry.title = title;
        habitEntry.scheduledDays = scheduledDays;
        habitEntry.isCompulsory = isCompulsory;
        habitEntry.color = color;
        currentWeek.calculateProgress();
        await currentWeek.save();
      }
    }

    res.json({ message: 'Habit updated successfully', habit });
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
}

/**
 * Delete (deactivate) a habit
 * DELETE /api/habits/:id
 */
export async function deleteHabit(req, res) {
  try {
    const { id } = req.params;

    // Soft delete - mark as inactive
    const habit = await Habit.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Remove from current week
    const currentWeek = await Week.findOne({ isCurrent: true });
    if (currentWeek) {
      currentWeek.habits = currentWeek.habits.filter(
        h => h.habitId.toString() !== id
      );
      currentWeek.calculateProgress();
      await currentWeek.save();
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
}
