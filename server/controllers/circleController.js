const { nanoid } = require('nanoid');
const User = require('../models/User');
const Viewer = require('../models/Viewer');

// POST /api/circle/invite/regenerate — generate a new invite code
const regenerateInvite = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.inviteCode = nanoid(10);
  await user.save();
  res.json({ inviteCode: user.inviteCode });
};

// GET /api/circle/viewers — list all viewers with their privacy settings
const getViewers = async (req, res) => {
  const user = await User.findById(req.user._id).populate('viewers.viewerId', 'name email createdAt relationship');
  
  const viewers = user.viewers
    .filter((v) => v.viewerId) // filter out deleted viewers
    .map((v) => ({
      _id: v.viewerId._id,
      name: v.viewerId.name,
      email: v.viewerId.email,
      joinedAt: v.viewerId.createdAt,
      relationship: v.viewerId.relationship,
      privacySettings: v.privacySettings,
    }));

  res.json(viewers);
};

// PUT /api/circle/viewers/:viewerId — update privacy toggles for a viewer
const updatePrivacy = async (req, res) => {
  const user = await User.findById(req.user._id);
  const viewerEntry = user.viewers.find(
    (v) => v.viewerId && v.viewerId.toString() === req.params.viewerId
  );

  if (!viewerEntry) {
    res.status(404);
    throw new Error('Viewer not found in your circle 🌸');
  }

  const { sharePhase, shareMood, sharePeriodCountdown, shareSymptomSummary } = req.body;

  if (sharePhase !== undefined) viewerEntry.privacySettings.sharePhase = sharePhase;
  if (shareMood !== undefined) viewerEntry.privacySettings.shareMood = shareMood;
  if (sharePeriodCountdown !== undefined)
    viewerEntry.privacySettings.sharePeriodCountdown = sharePeriodCountdown;
  if (shareSymptomSummary !== undefined)
    viewerEntry.privacySettings.shareSymptomSummary = shareSymptomSummary;

  await user.save();
  res.json({ message: 'Privacy settings updated 💕', privacySettings: viewerEntry.privacySettings });
};

// DELETE /api/circle/viewers/:viewerId — revoke access
const revokeViewer = async (req, res) => {
  const user = await User.findById(req.user._id);
  const before = user.viewers.length;

  user.viewers = user.viewers.filter(
    (v) => !v.viewerId || v.viewerId.toString() !== req.params.viewerId
  );

  if (user.viewers.length === before) {
    res.status(404);
    throw new Error('Viewer not found in your circle 🌸');
  }

  await user.save();

  // Optionally delete the viewer account too
  await Viewer.findByIdAndDelete(req.params.viewerId);

  res.json({ message: 'Access revoked — they can no longer see your info 💕' });
};

// PUT /api/circle/viewers/:viewerId/relationship — update relationship tag
const updateRelationship = async (req, res) => {
  const viewer = await Viewer.findOne({ _id: req.params.viewerId, linkedUserId: req.user._id });
  if (!viewer) return res.status(404).json({ message: 'Viewer not found 🌸' });

  viewer.relationship = req.body.relationship;
  await viewer.save();
  res.json({ message: 'Relationship updated 💕', relationship: viewer.relationship });
};

module.exports = { regenerateInvite, getViewers, updatePrivacy, revokeViewer, updateRelationship };
