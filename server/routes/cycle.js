const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { getCycles, createCycle, updateCycle, deleteCycle } = require('../controllers/cycleController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('user'));

router.route('/').get(asyncHandler(getCycles)).post(asyncHandler(createCycle));
router.route('/:id').put(asyncHandler(updateCycle)).delete(asyncHandler(deleteCycle));

module.exports = router;
