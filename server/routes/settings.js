const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { subscribePush, unsubscribePush, updateNotificationPrefs, updateProfile } = require('../controllers/settingsController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('user'));

router.post('/push-subscribe', asyncHandler(subscribePush));
router.delete('/push-subscribe', asyncHandler(unsubscribePush));
router.put('/notifications', asyncHandler(updateNotificationPrefs));
router.put('/profile', asyncHandler(updateProfile));

module.exports = router;
