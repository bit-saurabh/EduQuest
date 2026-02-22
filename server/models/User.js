const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  passwordHash: {
    type: String,
    required: true
  },
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  league: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Diamond'],
    default: 'Bronze'
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActivityDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Calculate league based on XP
userSchema.methods.calculateLeague = function () {
  if (this.xp >= 1000) return 'Diamond';
  if (this.xp >= 500) return 'Gold';
  if (this.xp >= 200) return 'Silver';
  return 'Bronze';
};

// Update league automatically before saving
userSchema.pre('save', function (next) {
  this.league = this.calculateLeague();
  next();
});

module.exports = mongoose.model('User', userSchema);
