const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationToken: {
    type: String,
    default: null
  },
  currentStreak: { 
    type: Number, 
    default: 0 
  },
  lastActiveDate: { 
    type: String, 
    default: null // Format: YYYY-MM-DD to check consistency everyday
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
