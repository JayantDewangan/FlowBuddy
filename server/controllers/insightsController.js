const CycleEntry = require('../models/CycleEntry');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const {
  calculateAverages,
  predictNextPeriod,
  getCurrentPhase,
  getDaysUntilNextPeriod,
  getCountdownMessage,
  buildCalendarData,
} = require('../utils/cycleEngine');

// GET /api/insights
const getInsights = async (req, res) => {
  const user = await User.findById(req.user._id);
  const cycles = await CycleEntry.find({ userId: req.user._id }).sort({ startDate: 1 });
  const logs = await DailyLog.find({ userId: req.user._id });

  const { avgCycleLength, avgPeriodLength, cycleLengths, periodDurations } =
    calculateAverages(cycles);

  // Most common symptoms
  const symptomCount = {};
  logs.forEach((log) => {
    (log.symptoms || []).forEach((s) => {
      symptomCount[s] = (symptomCount[s] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symptom, count]) => ({ symptom, count }));

  // Mood distribution
  const moodCount = { happy: 0, calm: 0, anxious: 0, irritable: 0, sad: 0, energetic: 0 };
  logs.forEach((log) => {
    if (log.mood && moodCount[log.mood] !== undefined) moodCount[log.mood]++;
  });

  // Mood by phase (approximate)
  const moodByPhase = { menstrual: {}, follicular: {}, ovulation: {}, luteal: {} };
  if (cycles.length > 0) {
    logs.forEach((log) => {
      if (!log.mood) return;
      // Find which cycle this log belongs to
      const logDate = new Date(log.date);
      const relevantCycle = [...cycles]
        .reverse()
        .find((c) => new Date(c.startDate) <= logDate);
      if (!relevantCycle) return;

      const phaseInfo = getCurrentPhase(
        logDate,
        relevantCycle.startDate,
        avgPeriodLength,
        avgCycleLength
      );
      const phase = phaseInfo.phase;
      if (moodByPhase[phase]) {
        moodByPhase[phase][log.mood] = (moodByPhase[phase][log.mood] || 0) + 1;
      }
    });
  }

  // Prediction
  let prediction = null;
  if (cycles.length > 0) {
    const lastCycle = cycles[cycles.length - 1];
    const nextPeriod = predictNextPeriod(new Date(lastCycle.startDate), avgCycleLength);
    const today = new Date();
    const daysUntil = getDaysUntilNextPeriod(today, nextPeriod);

    prediction = {
      nextPeriodDate: nextPeriod.toISOString().split('T')[0],
      daysUntil,
      message: getCountdownMessage(daysUntil),
    };
  }

  // Current phase
  let currentPhase = null;
  if (cycles.length > 0) {
    const lastCycle = cycles[cycles.length - 1];
    currentPhase = getCurrentPhase(
      new Date(),
      lastCycle.startDate,
      avgPeriodLength,
      avgCycleLength
    );
  }

  res.json({
    avgCycleLength,
    avgPeriodLength,
    totalCycles: cycles.length,
    totalLogs: logs.length,
    cycleLengths,
    periodDurations,
    topSymptoms,
    moodCount,
    moodByPhase,
    prediction,
    currentPhase,
    hasEnoughData: cycles.length >= 2,
  });
};

// GET /api/insights/calendar?month=0&year=2025
const getCalendar = async (req, res) => {
  const month = parseInt(req.query.month ?? new Date().getMonth());
  const year = parseInt(req.query.year ?? new Date().getFullYear());

  const user = await User.findById(req.user._id);
  const cycles = await CycleEntry.find({ userId: req.user._id });

  const calendarData = buildCalendarData(
    cycles,
    user.averageCycleLength || 28,
    user.averagePeriodLength || 5,
    month,
    year
  );

  // Overlay daily log data
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const logs = await DailyLog.find({
    userId: req.user._id,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });

  logs.forEach((log) => {
    const key = new Date(log.date).toISOString().split('T')[0];
    if (calendarData[key]) {
      calendarData[key].hasLog = true;
      calendarData[key].mood = log.mood;
    }
  });

  res.json(calendarData);
};

module.exports = { getInsights, getCalendar };
