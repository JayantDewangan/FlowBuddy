const CycleEntry = require('../models/CycleEntry');
const User = require('../models/User');
const { calculateAverages, daysBetween } = require('../utils/cycleEngine');

// GET /api/cycle — get all cycles for current user
const getCycles = async (req, res) => {
  const cycles = await CycleEntry.find({ userId: req.user._id }).sort({ startDate: -1 });
  res.json(cycles);
};

// POST /api/cycle — log a new period start
const createCycle = async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate) {
    res.status(400);
    throw new Error('Please provide a start date 🌸');
  }

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  // Check for overlapping existing cycle
  const existing = await CycleEntry.findOne({
    userId: req.user._id,
    startDate: start,
  });
  if (existing) {
    res.status(400);
    throw new Error('A cycle entry for this date already exists 💕');
  }

  // Calculate cycleLength from previous entry
  const previousCycles = await CycleEntry.find({ userId: req.user._id }).sort({ startDate: -1 });
  let cycleLength = null;
  if (previousCycles.length > 0) {
    cycleLength = daysBetween(previousCycles[0].startDate, start);
  }

  const cycle = await CycleEntry.create({
    userId: req.user._id,
    startDate: start,
    endDate: endDate ? new Date(endDate) : null,
    cycleLength,
  });

  // Recalculate user averages
  const allCycles = [cycle, ...previousCycles];
  const { avgCycleLength, avgPeriodLength } = calculateAverages(allCycles);
  await User.findByIdAndUpdate(req.user._id, { avgCycleLength, avgPeriodLength });

  res.status(201).json(cycle);
};

// PUT /api/cycle/:id — update a cycle (e.g. add end date)
const updateCycle = async (req, res) => {
  const cycle = await CycleEntry.findOne({ _id: req.params.id, userId: req.user._id });
  if (!cycle) {
    res.status(404);
    throw new Error("Cycle entry not found 🌸");
  }

  if (req.body.startDate) cycle.startDate = new Date(req.body.startDate);
  if (req.body.endDate !== undefined) {
    cycle.endDate = req.body.endDate ? new Date(req.body.endDate) : null;
  }

  await cycle.save();

  // Recalculate averages
  const allCycles = await CycleEntry.find({ userId: req.user._id });
  const { avgCycleLength, avgPeriodLength } = calculateAverages(allCycles);
  await User.findByIdAndUpdate(req.user._id, { avgCycleLength, avgPeriodLength });

  res.json(cycle);
};

// DELETE /api/cycle/:id
const deleteCycle = async (req, res) => {
  const cycle = await CycleEntry.findOne({ _id: req.params.id, userId: req.user._id });
  if (!cycle) {
    res.status(404);
    throw new Error('Cycle entry not found 🌸');
  }

  await cycle.deleteOne();

  // Recalculate averages
  const allCycles = await CycleEntry.find({ userId: req.user._id });
  if (allCycles.length > 0) {
    const { avgCycleLength, avgPeriodLength } = calculateAverages(allCycles);
    await User.findByIdAndUpdate(req.user._id, { avgCycleLength, avgPeriodLength });
  }

  res.json({ message: 'Cycle entry removed 🌸' });
};

module.exports = { getCycles, createCycle, updateCycle, deleteCycle };
