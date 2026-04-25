const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const viewerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, default: 'viewer', enum: ['viewer'] },
  linkedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relationship: { 
    type: String, 
    default: 'friend', 
    enum: ['boyfriend', 'husband', 'parent', 'doctor', 'friend', 'other'] 
  },
}, { timestamps: true });

viewerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

viewerSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Viewer', viewerSchema);
