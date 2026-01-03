import mongoose from 'mongoose';

// Schema for individual habit tracking within a week
const habitEntrySchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  scheduledDays: {
    type: [String],
    required: true
  },
  isCompulsory: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#0ea5e9'
  },
  // Completion status for each day of the week
  completion: {
    Mon: { type: Boolean, default: false },
    Tue: { type: Boolean, default: false },
    Wed: { type: Boolean, default: false },
    Thu: { type: Boolean, default: false },
    Fri: { type: Boolean, default: false },
    Sat: { type: Boolean, default: false },
    Sun: { type: Boolean, default: false }
  }
}, { _id: false });

// Main Week schema
const weekSchema = new mongoose.Schema({
  weekStart: {
    type: Date,
    required: true,
    unique: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  // Week identifier string (e.g., "2026-W01")
  weekId: {
    type: String,
    required: true,
    unique: true
  },
  // Array of habits being tracked this week
  habits: [habitEntrySchema],
  // Calculated progress percentage
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Is this the current week?
  isCurrent: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
weekSchema.index({ weekStart: -1 });
weekSchema.index({ isCurrent: 1 });

// Method to calculate progress
weekSchema.methods.calculateProgress = function() {
  let totalScheduled = 0;
  let totalCompleted = 0;

  this.habits.forEach(habit => {
    habit.scheduledDays.forEach(day => {
      totalScheduled++;
      if (habit.completion[day]) {
        totalCompleted++;
      }
    });
  });

  this.progress = totalScheduled > 0 
    ? Math.round((totalCompleted / totalScheduled) * 100) 
    : 0;
  
  return this.progress;
};

const Week = mongoose.model('Week', weekSchema);

export default Week;
