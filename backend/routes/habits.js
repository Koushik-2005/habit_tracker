import express from 'express';
import {
  createHabit,
  getAllHabits,
  updateHabit,
  deleteHabit
} from '../controllers/habitController.js';

const router = express.Router();

// POST /api/habits - Create a new habit
router.post('/', createHabit);

// GET /api/habits - Get all active habits
router.get('/', getAllHabits);

// PUT /api/habits/:id - Update a habit
router.put('/:id', updateHabit);

// DELETE /api/habits/:id - Delete (deactivate) a habit
router.delete('/:id', deleteHabit);

export default router;
