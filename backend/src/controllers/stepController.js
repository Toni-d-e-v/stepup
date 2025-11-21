const Step = require('../models/Step');
const User = require('../models/User');

// @desc    Add or update daily steps
// @route   POST /api/steps
// @access  Private
const addSteps = async (req, res) => {
  try {
    const { date, steps, source } = req.body;
    const userId = req.user._id;

    // Normalize date to start of day
    const stepDate = new Date(date);
    stepDate.setHours(0, 0, 0, 0);

    // Check if entry already exists for this date
    let stepEntry = await Step.findOne({
      user: userId,
      date: stepDate
    });

    if (stepEntry) {
      // Update existing entry
      stepEntry.steps = steps;
      stepEntry.source = source || stepEntry.source;
      await stepEntry.save();
    } else {
      // Create new entry
      stepEntry = await Step.create({
        user: userId,
        date: stepDate,
        steps,
        source: source || 'manual',
      });
    }

    // Update user's total steps
    const totalSteps = await Step.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$steps' } } },
    ]);

    const totalPoints = await Step.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$points' } } },
    ]);

    await User.findByIdAndUpdate(userId, {
      totalSteps: totalSteps[0]?.total || 0,
      totalPoints: totalPoints[0]?.total || 0,
    });

    res.status(201).json(stepEntry);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Steps already recorded for this date' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get user's step history
// @route   GET /api/steps
// @access  Private
const getSteps = async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const userId = req.user._id;

    const query = { user: userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const steps = await Step.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json(steps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user statistics
// @route   GET /api/steps/statistics
// @access  Private
const getStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Today's steps
    const todaySteps = await Step.findOne({
      user: userId,
      date: today
    });

    // Weekly statistics
    const weeklyStats = await Step.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalSteps: { $sum: '$steps' },
          avgSteps: { $avg: '$steps' },
          totalPoints: { $sum: '$points' },
          daysActive: { $sum: 1 },
          goalsAchieved: {
            $sum: { $cond: ['$goalAchieved', 1, 0] }
          },
        },
      },
    ]);

    // Monthly statistics
    const monthlyStats = await Step.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: monthAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalSteps: { $sum: '$steps' },
          avgSteps: { $avg: '$steps' },
          totalPoints: { $sum: '$points' },
          daysActive: { $sum: 1 },
          goalsAchieved: {
            $sum: { $cond: ['$goalAchieved', 1, 0] }
          },
        },
      },
    ]);

    // All-time best day
    const bestDay = await Step.findOne({ user: userId })
      .sort({ steps: -1 })
      .limit(1);

    res.json({
      today: {
        steps: todaySteps?.steps || 0,
        goalAchieved: todaySteps?.goalAchieved || false,
        points: todaySteps?.points || 0,
      },
      weekly: weeklyStats[0] || {
        totalSteps: 0,
        avgSteps: 0,
        totalPoints: 0,
        daysActive: 0,
        goalsAchieved: 0,
      },
      monthly: monthlyStats[0] || {
        totalSteps: 0,
        avgSteps: 0,
        totalPoints: 0,
        daysActive: 0,
        goalsAchieved: 0,
      },
      bestDay: bestDay ? {
        date: bestDay.date,
        steps: bestDay.steps,
      } : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific user's step history (for viewing other users)
// @route   GET /api/steps/user/:userId
// @access  Private
const getUserSteps = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 7 } = req.query;

    const steps = await Step.find({ user: userId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .select('date steps goalAchieved points');

    res.json(steps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addSteps,
  getSteps,
  getStatistics,
  getUserSteps,
};
