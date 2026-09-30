const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  contentType: { 
    type: String, 
    enum: ['task', 'scratchpad'], 
    required: true 
  },
  text: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed'], 
    default: 'pending' 
  },
  dateSlot: { 
    type: String, 
    default: null // e.g., "2026-09-24" for daily views, or null for random notes
  }
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);
