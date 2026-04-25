const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const privacySettingsSchema = new mongoose.Schema({
  sharePhase: { type: Boolean, default: false },
  shareMood: { type: Boolean, default: false },
  sharePeriodCountdown: { type: Boolean, default: false },
  shareSymptomSummary: { type: Boolean, default: false },
}, { _id: false });

const viewerEntrySchema = new mongoose.Schema({
  viewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Viewer' },
  privacySettings: { type: privacySettingsSchema, default: () => ({}) },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, default: 'user', enum: ['user'] },
  averageCycleLength: { type: Number, default: 28 },
  averagePeriodLength: { type: Number, default: 5 },
  inviteCode: { type: String, unique: true, sparse: true },
  viewers: [viewerEntrySchema],
  pushSubscriptions: [{ type: Object }],
  notificationPreferences: {
    periodReminder: { type: Boolean, default: true },
    fertileWindowReminder: { type: Boolean, default: true },
    dailyLogReminder: { type: Boolean, default: false },
    dailyLogTime: { type: String, default: '20:00' },
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
