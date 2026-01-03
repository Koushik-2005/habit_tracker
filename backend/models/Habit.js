import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Habit title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  scheduledDays: {
    type: [String],
    required: [true, 'At least one scheduled day is required'],
    validate: {
      validator: function(days) {
        const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.length > 0 && days.every(day => validDays.includes(day));
      },
      message: 'Invalid scheduled days'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCompulsory: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#0ea5e9' // primary-500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
