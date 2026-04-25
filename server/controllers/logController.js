const DailyLog = require('../models/DailyLog');

// GET /api/log?date=YYYY-MM-DD or GET /api/log for recent logs
const getLogs = async (req, res) => {
  const { date, startDate, endDate } = req.query;

  let filter = { userId: req.user._id };

  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dEnd = new Date(d);
    dEnd.setHours(23, 59, 59, 999);
    filter.date = { $gte: d, $lte: dEnd };
  } else if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const logs = await DailyLog.find(filter).sort({ date: -1 });
  res.json(logs);
};

// POST /api/log — create or update today's log (upsert)
const upsertLog = async (req, res) => {
  const { date, mood, symptoms, flowIntensity, note } = req.body;

  if (!date) {
    res.status(400);
    throw new Error('Please provide a date for your log 🌸');
  }

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const log = await DailyLog.findOneAndUpdate(
    { userId: req.user._id, date: d },
    { mood, symptoms, flowIntensity, note },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json(log);
};

// DELETE /api/log/:id
const deleteLog = async (req, res) => {
  const log = await DailyLog.findOne({ _id: req.params.id, userId: req.user._id });
  if (!log) {
    res.status(404);
    throw new Error('Log entry not found 🌸');
  }
  await log.deleteOne();
  res.json({ message: 'Log entry removed 🌸' });
};

module.exports = { getLogs, upsertLog, deleteLog };
