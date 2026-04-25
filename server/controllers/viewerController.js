const User = require('../models/User');
const Viewer = require('../models/Viewer');
const CycleEntry = require('../models/CycleEntry');
const DailyLog = require('../models/DailyLog');
const {
  calculateAverages,
  predictNextPeriod,
  getCurrentPhase,
  getDaysUntilNextPeriod,
  getCountdownMessage,
} = require('../utils/cycleEngine');

// Abstracted symptom summary — never raw data
const getSymptomSummary = (symptoms) => {
  if (!symptoms || symptoms.length === 0) return null;

  const tough = ['cramps', 'headache', 'backache', 'fatigue'];
  const hasTough = symptoms.some((s) => tough.includes(s));

  if (hasTough && symptoms.length >= 3) {
    return "She's having a tough day — extra kindness goes a long way 🤍";
  }
  if (hasTough) {
    return "She's not feeling 100% today — a little check-in could mean the world 💕";
  }
  return "She might just need some gentle support today 🌸";
};

// Phase support tips for viewers
const getViewerPhaseTips = (phase) => {
  const tips = {
    menstrual: {
      friendlyName: 'Flow phase 🌺',
      message: "She's in her flow phase — her body is working hard and she might need extra warmth and rest right now.",
      tips: [
        '🍵 Bring her something warm — tea, a hot meal, or a heating pad',
        "🤫 Give her space if she seems quiet — it's not you, she's just tired",
        "💬 A simple \"I'm here for you\" can mean everything right now",
      ],
    },
    follicular: {
      friendlyName: 'Rising phase 🌸',
      message: "She's in her rising phase — energy is coming back and she might feel more social and optimistic!",
      tips: [
        "🌟 Great time to make plans together — she's feeling up for it",
        "💡 She loves trying new things right now — suggest something fun",
        '😊 Compliments land really well during this phase',
      ],
    },
    ovulation: {
      friendlyName: 'Glow phase ✨',
      message: "She's in her glow phase — confident, communicative, and feeling her best!",
      tips: [
        "🗣️ Have those important conversations now — she's in a great headspace",
        "🎉 Say yes to date nights or hangouts — she'll shine",
        "💕 She's extra loving right now — make the most of it!",
      ],
    },
    luteal: {
      friendlyName: 'Wind-down phase 🌙',
      message: "She's winding down — she might need more comfort, patience, and quiet time this week.",
      tips: [
        '🫂 Hugs and physical comfort can help a lot right now',
        '🍫 Offering snacks (especially chocolate!) is always a good idea',
        "🎧 Don't push big decisions — let things be gentle and low-key",
      ],
    },
  };
  return tips[phase] || tips.luteal;
};

// GET /api/viewer/dashboard
const getViewerDashboard = async (req, res) => {
  // req.user is the Viewer document
  const viewer = req.user;
  const linkedUser = await User.findById(viewer.linkedUserId);

  if (!linkedUser) {
    res.status(404);
    throw new Error("Hmm, the person who invited you doesn't seem to have an active account 💔");
  }

  // Find this viewer's privacy settings in the user's viewers array
  const viewerEntry = linkedUser.viewers.find(
    (v) => v.viewerId && v.viewerId.toString() === viewer._id.toString()
  );

  if (!viewerEntry) {
    res.status(403);
    throw new Error("It looks like your access has been revoked 💔");
  }

  const privacy = viewerEntry.privacySettings;

  // Compute data from user's cycles
  const cycles = await CycleEntry.find({ userId: linkedUser._id }).sort({ startDate: 1 });
  const { avgCycleLength, avgPeriodLength } = calculateAverages(cycles);

  const dashboard = {
    userName: linkedUser.name,
  };

  if (cycles.length > 0) {
    const lastCycle = cycles[cycles.length - 1];
    const today = new Date();

    // Phase info
    if (privacy.sharePhase) {
      const phaseInfo = getCurrentPhase(today, lastCycle.startDate, avgPeriodLength, avgCycleLength);
      const viewerTips = getViewerPhaseTips(phaseInfo.phase);
      dashboard.phase = {
        friendlyName: viewerTips.friendlyName,
        message: viewerTips.message,
        tips: viewerTips.tips,
      };
    }

    // Period countdown
    if (privacy.sharePeriodCountdown) {
      const nextPeriod = predictNextPeriod(new Date(lastCycle.startDate), avgCycleLength);
      const daysUntil = getDaysUntilNextPeriod(today, nextPeriod);

      if (daysUntil <= 5) {
        dashboard.periodCountdown = {
          daysUntil,
          message:
            daysUntil <= 0
              ? `Her period may have started — she might need extra support 🌺`
              : daysUntil === 1
              ? 'Her period is expected tomorrow — maybe be extra gentle 💕'
              : `Her period is expected in ${daysUntil} days 🌸`,
        };
      }
    }
  }

  // Today's mood (abstracted)
  if (privacy.shareMood) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayLog = await DailyLog.findOne({
      userId: linkedUser._id,
      date: { $gte: today, $lte: todayEnd },
    });

    if (todayLog && todayLog.mood) {
      const moodEmojis = {
        happy: '😊',
        calm: '😌',
        anxious: '😟',
        irritable: '😤',
        sad: '😢',
        energetic: '⚡',
      };
      dashboard.mood = {
        emoji: moodEmojis[todayLog.mood] || '💕',
        label: todayLog.mood,
      };
    }
  }

  // Symptom summary (abstracted — never raw)
  if (privacy.shareSymptomSummary) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayLog = await DailyLog.findOne({
      userId: linkedUser._id,
      date: { $gte: today, $lte: todayEnd },
    });

    if (todayLog && todayLog.symptoms && todayLog.symptoms.length > 0) {
      dashboard.symptomSummary = getSymptomSummary(todayLog.symptoms);
    }
  }

  // If nothing is shared, let viewer know
  if (Object.keys(dashboard).length === 1) {
    dashboard.noDataShared = true;
    dashboard.message = `${linkedUser.name} hasn't shared any details with you yet — that's okay! Just knowing you care is enough 💕`;
  }

  res.json(dashboard);
};

module.exports = { getViewerDashboard };
