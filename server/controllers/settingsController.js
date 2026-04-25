const User = require('../models/User');

// POST /api/settings/push-subscribe
const subscribePush = async (req, res) => {
  const { subscription } = req.body;
  if (!subscription) {
    res.status(400);
    throw new Error('No subscription provided');
  }

  const user = await User.findById(req.user._id);
  // Avoid duplicates
  const exists = user.pushSubscriptions.some(
    (s) => JSON.stringify(s) === JSON.stringify(subscription)
  );
  if (!exists) {
    user.pushSubscriptions.push(subscription);
    await user.save();
  }

  res.json({ message: 'Push notifications enabled 🔔' });
};

// DELETE /api/settings/push-subscribe
const unsubscribePush = async (req, res) => {
  const { endpoint } = req.body;
  const user = await User.findById(req.user._id);
  user.pushSubscriptions = user.pushSubscriptions.filter((s) => s.endpoint !== endpoint);
  await user.save();
  res.json({ message: 'Push notifications disabled' });
};

// PUT /api/settings/notifications
const updateNotificationPrefs = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { periodReminder, fertileWindowReminder, dailyLogReminder, dailyLogTime } = req.body;

  if (periodReminder !== undefined) user.notificationPreferences.periodReminder = periodReminder;
  if (fertileWindowReminder !== undefined)
    user.notificationPreferences.fertileWindowReminder = fertileWindowReminder;
  if (dailyLogReminder !== undefined)
    user.notificationPreferences.dailyLogReminder = dailyLogReminder;
  if (dailyLogTime) user.notificationPreferences.dailyLogTime = dailyLogTime;

  await user.save();
  res.json({ message: 'Notification preferences saved 💕', notificationPreferences: user.notificationPreferences });
};

// PUT /api/settings/profile
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, averageCycleLength, averagePeriodLength } = req.body;

  if (name) user.name = name;
  if (averageCycleLength) user.averageCycleLength = averageCycleLength;
  if (averagePeriodLength) user.averagePeriodLength = averagePeriodLength;

  await user.save();
  res.json({ message: 'Profile updated 💕', name: user.name, averageCycleLength: user.averageCycleLength, averagePeriodLength: user.averagePeriodLength });
};

module.exports = { subscribePush, unsubscribePush, updateNotificationPrefs, updateProfile };
