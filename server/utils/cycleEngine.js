/**
 * FlowBuddy Cycle Engine
 * Pure functions for all cycle phase and prediction calculations.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Get the difference in days between two dates (b - a)
 */
const daysBetween = (a, b) => {
  const diffMs = new Date(b).setHours(0, 0, 0, 0) - new Date(a).setHours(0, 0, 0, 0);
  return Math.round(diffMs / MS_PER_DAY);
};

/**
 * Add days to a date, returns a new Date
 */
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Calculate average cycle length and period duration from CycleEntry records.
 * Requires at least 2 entries for cycle length, 1 completed entry for period duration.
 */
const calculateAverages = (cycles) => {
  const sorted = [...cycles].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  // Cycle lengths: gap between consecutive start dates
  const cycleLengths = [];
  for (let i = 1; i < sorted.length; i++) {
    const len = daysBetween(sorted[i - 1].startDate, sorted[i].startDate);
    if (len > 10 && len < 60) cycleLengths.push(len); // sanity range
  }

  // Period durations: entries with endDate
  const periodDurations = sorted
    .filter((c) => c.endDate)
    .map((c) => daysBetween(c.startDate, c.endDate) + 1);

  const avgCycleLength =
    cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((s, v) => s + v, 0) / cycleLengths.length)
      : 28;

  const avgPeriodLength =
    periodDurations.length > 0
      ? Math.round(periodDurations.reduce((s, v) => s + v, 0) / periodDurations.length)
      : 5;

  return { avgCycleLength, avgPeriodLength, cycleLengths, periodDurations };
};

/**
 * Predict the next period start date.
 * @param {Date} lastPeriodStart - Start of the most recent period
 * @param {number} avgCycleLength - Average cycle length in days
 * @returns {Date}
 */
const predictNextPeriod = (lastPeriodStart, avgCycleLength) => {
  return addDays(lastPeriodStart, avgCycleLength);
};

/**
 * Calculate ovulation day: typically 14 days before the next period.
 */
const getOvulationDay = (nextPeriodStart) => {
  return addDays(nextPeriodStart, -14);
};

/**
 * Calculate fertile window: 5 days before ovulation through 1 day after.
 */
const getFertileWindow = (ovulationDay) => {
  return {
    start: addDays(ovulationDay, -5),
    end: addDays(ovulationDay, 1),
  };
};

/**
 * Determine the current cycle phase for a given date.
 * @param {Date} today
 * @param {Date} lastPeriodStart
 * @param {number} avgPeriodLength
 * @param {number} avgCycleLength
 * @returns {{ phase, dayOfCycle, description, tips, friendlyName }}
 */
const getCurrentPhase = (today, lastPeriodStart, avgPeriodLength, avgCycleLength) => {
  const todayNorm = new Date(today);
  todayNorm.setHours(0, 0, 0, 0);

  const periodStart = new Date(lastPeriodStart);
  periodStart.setHours(0, 0, 0, 0);

  const dayOfCycle = daysBetween(periodStart, todayNorm) + 1; // 1-indexed

  const nextPeriod = predictNextPeriod(periodStart, avgCycleLength);
  const ovulationDay = getOvulationDay(nextPeriod);
  const fertileWindow = getFertileWindow(ovulationDay);

  const ovDayOfCycle = daysBetween(periodStart, ovulationDay) + 1;
  const fertileStart = daysBetween(periodStart, fertileWindow.start) + 1;
  const fertileEnd = daysBetween(periodStart, fertileWindow.end) + 1;

  let phase, friendlyName, description, tips;

  if (dayOfCycle <= avgPeriodLength) {
    phase = 'menstrual';
    friendlyName = 'Flow phase 🌺';
    description =
      "Your body is doing its thing — this is your time to slow down. Energy might be lower, and that's totally okay. Be gentle with yourself.";
    tips = [
      '🛁 Warm baths or a heating pad can ease cramps',
      '🍫 Dark chocolate and iron-rich foods are your friends',
      '😴 Prioritize rest — your body is working hard',
    ];
  } else if (dayOfCycle < fertileStart) {
    phase = 'follicular';
    friendlyName = 'Rising phase 🌸';
    description =
      "You're coming back to life! Estrogen is rising, your energy is picking up, and you might feel more social and creative. A great time to start new things!";
    tips = [
      '💃 Try a fun new workout or activity',
      '📝 Great time to brainstorm and plan',
      '🥗 Fresh foods and light meals feel great now',
    ];
  } else if (dayOfCycle >= fertileStart && dayOfCycle <= fertileEnd) {
    phase = 'ovulation';
    friendlyName = 'Glow phase ✨';
    description =
      "You're at your peak! Communication flows easily, confidence is high, and you probably feel your best. Your energy is magnetic right now.";
    tips = [
      '🗣️ Perfect time for important conversations',
      '💪 Push yourself a little in workouts — your body can handle it',
      "🌟 Say yes to social plans — you'll shine!",
    ];
  } else {
    phase = 'luteal';
    friendlyName = 'Wind-down phase 🌙';
    description =
      "You're heading into your cozy wind-down phase. Progesterone is rising, and you might crave comfort, quiet, and warmth. Totally normal to want more me-time.";
    tips = [
      '🧘 Gentle yoga or walks are perfect right now',
      '🍵 Herbal teas and warm foods feel grounding',
      '📚 Great time for quiet hobbies — reading, journaling, crafting',
    ];
  }

  return { phase, friendlyName, dayOfCycle, description, tips };
};

/**
 * Count down days to next period. Negative = period is late.
 */
const getDaysUntilNextPeriod = (today, nextPeriodStart) => {
  return daysBetween(today, nextPeriodStart);
};

/**
 * Get a friendly countdown message.
 */
const getCountdownMessage = (daysUntil) => {
  if (daysUntil < 0) {
    const late = Math.abs(daysUntil);
    return `Your period is ${late} day${late !== 1 ? 's' : ''} late — that's okay! 💕`;
  }
  if (daysUntil === 0) return "Your period might be starting today 🌺";
  if (daysUntil === 1) return "Your period is expected tomorrow 🌸";
  return `Your period is expected in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} ✨`;
};

/**
 * Build a calendar data map for a given month.
 * Returns an object keyed by ISO date strings with day type info.
 */
const buildCalendarData = (cycles, avgCycleLength, avgPeriodLength, month, year) => {
  const map = {};

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const key = date.toISOString().split('T')[0];
    map[key] = { type: 'empty' };
  }

  // Mark actual period days
  const sorted = [...cycles].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  sorted.forEach((cycle) => {
    const start = new Date(cycle.startDate);
    start.setHours(0, 0, 0, 0);
    const end = cycle.endDate ? new Date(cycle.endDate) : addDays(start, avgPeriodLength - 1);
    end.setHours(0, 0, 0, 0);

    let cur = new Date(start);
    while (cur <= end) {
      const k = cur.toISOString().split('T')[0];
      if (map[k] !== undefined) map[k] = { type: 'period' };
      cur = addDays(cur, 1);
    }
  });

  // Predict future periods and mark fertile/ovulation windows
  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1];
    let predictedStart = predictNextPeriod(new Date(last.startDate), avgCycleLength);

    // Mark up to 3 future cycles
    for (let c = 0; c < 3; c++) {
      const ovDay = getOvulationDay(predictedStart);
      const fertile = getFertileWindow(ovDay);

      // Fertile window
      let cur = new Date(fertile.start);
      while (cur <= new Date(fertile.end)) {
        const k = cur.toISOString().split('T')[0];
        if (map[k] !== undefined && map[k].type === 'empty') map[k] = { type: 'fertile' };
        cur = addDays(cur, 1);
      }

      // Ovulation day (overrides fertile)
      const ovKey = ovDay.toISOString().split('T')[0];
      if (map[ovKey] !== undefined) map[ovKey] = { type: 'ovulation' };

      // Predicted period
      let pCur = new Date(predictedStart);
      const pEnd = addDays(predictedStart, avgPeriodLength - 1);
      while (pCur <= pEnd) {
        const k = pCur.toISOString().split('T')[0];
        if (map[k] !== undefined && map[k].type === 'empty')
          map[k] = { type: 'predicted' };
        pCur = addDays(pCur, 1);
      }

      predictedStart = predictNextPeriod(predictedStart, avgCycleLength);
    }
  }

  return map;
};

module.exports = {
  daysBetween,
  addDays,
  calculateAverages,
  predictNextPeriod,
  getOvulationDay,
  getFertileWindow,
  getCurrentPhase,
  getDaysUntilNextPeriod,
  getCountdownMessage,
  buildCalendarData,
};
