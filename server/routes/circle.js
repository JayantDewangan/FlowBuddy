const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { regenerateInvite, getViewers, updatePrivacy, revokeViewer, updateRelationship } = require('../controllers/circleController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('user'));

router.post('/invite/regenerate', asyncHandler(regenerateInvite));
router.get('/viewers', asyncHandler(getViewers));
router.put('/viewers/:viewerId', asyncHandler(updatePrivacy));
router.put('/viewers/:viewerId/relationship', asyncHandler(updateRelationship));
router.delete('/viewers/:viewerId', asyncHandler(revokeViewer));

module.exports = router;
