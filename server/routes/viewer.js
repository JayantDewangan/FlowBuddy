const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { getViewerDashboard } = require('../controllers/viewerController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/dashboard', protect, requireRole('viewer'), asyncHandler(getViewerDashboard));

module.exports = router;
