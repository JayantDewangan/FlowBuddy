const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { registerUser, registerViewer, loginUser, logoutUser, getMe, requestOtp, verifyOtp, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', asyncHandler(registerUser));
router.post('/register-viewer', asyncHandler(registerViewer));
router.post('/login', asyncHandler(loginUser));
router.post('/request-otp', asyncHandler(requestOtp));
router.post('/verify-otp', asyncHandler(verifyOtp));
router.post('/google', asyncHandler(googleLogin));
router.post('/logout', logoutUser);
router.get('/me', protect, asyncHandler(getMe));

module.exports = router;
