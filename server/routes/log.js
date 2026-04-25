const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { getLogs, upsertLog, deleteLog } = require('../controllers/logController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('user'));

router.route('/').get(asyncHandler(getLogs)).post(asyncHandler(upsertLog));
router.route('/:id').delete(asyncHandler(deleteLog));

module.exports = router;
