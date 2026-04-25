const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Viewer = require('../models/Viewer');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: "You're not logged in yet 🌸" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user first, then viewer
    let account = await User.findById(decoded.id).select('-password');
    if (!account) {
      account = await Viewer.findById(decoded.id).select('-password');
    }

    if (!account) {
      return res.status(401).json({ message: 'Account not found 💔' });
    }

    req.user = account;
    req.role = account.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired — please log in again 🌸' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: "You don't have access to this 🚫" });
    }
    next();
  };
};

module.exports = { protect, requireRole };
