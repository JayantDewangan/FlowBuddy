const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Viewer = require('../models/Viewer');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/email');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Token cookie setting is no longer used, switching to Bearer tokens in localStorage
// const setTokenCookie = (res, token) => { ... }

// POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all fields 🌸');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('This email is already registered! Try logging in 💕');
  }

  const inviteCode = nanoid(10);
  const user = await User.create({ name, email, password, inviteCode });

  const token = generateToken(user._id);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    inviteCode: user.inviteCode,
    token,
  });
};

// POST /api/auth/register-viewer
const registerViewer = async (req, res) => {
  const { name, email, password, inviteCode } = req.body;

  if (!name || !email || !password || !inviteCode) {
    res.status(400);
    throw new Error('Please fill in all fields and include your invite code 🌸');
  }

  const linkedUser = await User.findOne({ inviteCode });
  if (!linkedUser) {
    res.status(400);
    throw new Error("Hmm, that invite code doesn't look right 🤔 Double check it!");
  }

  const exists = await Viewer.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('This email is already registered as a viewer 💕');
  }

  const viewer = await Viewer.create({
    name,
    email,
    password,
    linkedUserId: linkedUser._id,
  });

  // Add viewer to user's viewers list
  linkedUser.viewers.push({
    viewerId: viewer._id,
    privacySettings: {
      sharePhase: false,
      shareMood: false,
      sharePeriodCountdown: false,
      shareSymptomSummary: false,
    },
  });
  await linkedUser.save();

  const token = generateToken(viewer._id);

  res.status(201).json({
    _id: viewer._id,
    name: viewer.name,
    email: viewer.email,
    role: viewer.role,
    linkedUserId: viewer.linkedUserId,
    token,
  });
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter your email and password 🌸');
  }

  // Check user first
  let account = await User.findOne({ email });
  let role = 'user';

  if (!account) {
    account = await Viewer.findOne({ email });
    role = 'viewer';
  }

  if (!account || !(await account.matchPassword(password))) {
    res.status(401);
    throw new Error("Email or password doesn't match — try again 💕");
  }

  const token = generateToken(account._id);

  res.json({
    _id: account._id,
    name: account.name,
    email: account.email,
    role: account.role,
    ...(role === 'user' && { inviteCode: account.inviteCode }),
    ...(role === 'viewer' && { linkedUserId: account.linkedUserId }),
    token,
  });
};

// POST /api/auth/logout
// Logout is now handled by frontend by removing the token from localStorage
const logoutUser = (req, res) => {
  res.json({ message: 'Logged out — see you soon! 💕' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = req.user;
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.role === 'user' && {
      inviteCode: user.inviteCode,
      averageCycleLength: user.averageCycleLength,
      averagePeriodLength: user.averagePeriodLength,
      notificationPreferences: user.notificationPreferences,
    }),
    ...(user.role === 'viewer' && { linkedUserId: user.linkedUserId }),
  });
};

// POST /api/auth/request-otp
const requestOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Please enter your email 🌸');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.findOneAndUpdate(
    { email },
    { otp, createdAt: Date.now() },
    { upsert: true, new: true }
  );

  try {
    console.log(`🌸 Sending OTP to ${email}...`);
    await sendEmail({
      email,
      subject: 'Your FlowBuddy OTP 🌸',
      message: `Your login code is: ${otp}. It will expire in 5 minutes. 💕`
    });
    console.log(`✅ OTP sent to ${email}`);
    res.json({ message: 'OTP sent successfully! Check your email 💕' });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500);
    throw new Error('Could not send OTP email. Please check your EMAIL_USER and EMAIL_PASS settings 💔');
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  const { email, otp, name, isRegistering } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Please enter email and OTP 🌸');
  }

  const record = await Otp.findOne({ email, otp });
  if (!record) {
    res.status(400);
    throw new Error('Invalid or expired OTP 💔');
  }

  await Otp.deleteOne({ _id: record._id });

  let account = await User.findOne({ email });
  let role = 'user';

  if (!account) {
    account = await Viewer.findOne({ email });
    role = 'viewer';
  }

  if (!account) {
    if (!isRegistering || !name) {
       return res.status(200).json({ isNewUser: true, email });
    }
    const inviteCode = nanoid(10);
    const randomPassword = nanoid(20);
    account = await User.create({ name, email, password: randomPassword, inviteCode });
    role = 'user';
  }

  const token = generateToken(account._id);

  res.json({
    _id: account._id,
    name: account.name,
    email: account.email,
    role: account.role,
    ...(role === 'user' && { inviteCode: account.inviteCode }),
    ...(role === 'viewer' && { linkedUserId: account.linkedUserId }),
    token,
  });
};

// POST /api/auth/google
const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    res.status(400);
    throw new Error('Missing Google credential');
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  const { email, name } = payload;

  let account = await User.findOne({ email });
  let role = 'user';

  if (!account) {
    account = await Viewer.findOne({ email });
    role = 'viewer';
  }

  if (!account) {
    const inviteCode = nanoid(10);
    const randomPassword = nanoid(20);
    account = await User.create({ name, email, password: randomPassword, inviteCode });
    role = 'user';
  }

  const token = generateToken(account._id);

  res.json({
    _id: account._id,
    name: account.name,
    email: account.email,
    role: account.role,
    ...(role === 'user' && { inviteCode: account.inviteCode }),
    ...(role === 'viewer' && { linkedUserId: account.linkedUserId }),
    token,
  });
};

module.exports = { registerUser, registerViewer, loginUser, logoutUser, getMe, requestOtp, verifyOtp, googleLogin };
