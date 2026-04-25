const mongoose = require('mongoose');

const cycleEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  cycleLength: { type: Number, default: null }, // calculated from prev cycle
}, { timestamps: true });

// Auto-calculate cycleLength when endDate is set
cycleEntrySchema.pre('save', async function (next) {
  // cycleLength = days from this start to prev cycle's start (calculated in controller)
  next();
});

module.exports = mongoose.model('CycleEntry', cycleEntrySchema);
