const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: String, required: true }
}, { _id: false });

const daySchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
    index: true
  },
  dayNumber: {
    type: Number,
    required: true,
    min: 1
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  topics: [{
    type: String,
    trim: true
  }],
  task: {
    type: String,
    trim: true
  },
  estimatedTimeMinutes: {
    type: Number,
    default: 60
  },
  quiz: [quizSchema],
  completed: {
    type: Boolean,
    default: false
  },
  xpAwarded: {
    type: Boolean,
    default: false
  },
  quizXpAwarded: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate days per goal
daySchema.index({ goalId: 1, dayNumber: 1 }, { unique: true });

module.exports = mongoose.model('Day', daySchema);
