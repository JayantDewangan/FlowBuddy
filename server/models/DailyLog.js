const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mood: {
    type: String,
    enum: ['happy', 'calm', 'anxious', 'irritable', 'sad', 'energetic'],
    default: null,
  },
  symptoms: [{
    type: String,
    enum: ['cramps', 'bloating', 'headache', 'fatigue', 'backache', 'breast_tenderness', 'acne'],
  }],
  flowIntensity: {
    type: String,
    enum: ['none', 'spotting', 'light', 'medium', 'heavy', null],
    default: null,
  },
  note: { type: String, maxlength: 1000, default: '' },
}, { timestamps: true });

// Compound unique index: one log per user per day
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
