const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { getInsights, getCalendar } = require('../controllers/insightsController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('user'));

router.get('/', asyncHandler(getInsights));
router.get('/calendar', asyncHandler(getCalendar));

module.exports = router;
