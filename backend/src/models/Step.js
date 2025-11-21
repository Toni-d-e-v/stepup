const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  steps: {
    type: Number,
    required: [true, 'Please provide number of steps'],
    min: 0,
  },
  calories: {
    type: Number,
    default: 0,
  },
  distance: {
    type: Number,
    default: 0,
  },
  goalAchieved: {
    type: Boolean,
    default: false,
  },
  points: {
    type: Number,
    default: 0,
  },
  source: {
    type: String,
    enum: ['manual', 'apple_health', 'google_fit'],
    default: 'manual',
  },
}, {
  timestamps: true,
});

// Create compound index for user and date to ensure one entry per day
stepSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate points before saving
stepSchema.pre('save', function(next) {
  // Award points if goal is achieved
  if (this.steps >= 10000) {
    this.goalAchieved = true;
    this.points = Math.floor(this.steps / 1000); // 1 point per 1000 steps
  }

  // Estimate calories (rough estimate: 0.04 cal per step)
  this.calories = Math.round(this.steps * 0.04);

  // Estimate distance in km (rough estimate: 1300 steps = 1 km)
  this.distance = (this.steps / 1300).toFixed(2);

  next();
});

module.exports = mongoose.model('Step', stepSchema);
