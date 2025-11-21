const Step = require('../models/Step');
const User = require('../models/User');

// @desc    Get daily leaderboard
// @route   GET /api/leaderboard/daily
// @access  Private
const getDailyLeaderboard = async (req, res) => {
  try {
    const { role, groupId } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build user filter
    const userFilter = {};
    if (role) userFilter.role = role;
    if (groupId) userFilter.groups = groupId;

    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(u => u._id);

    const leaderboard = await Step.aggregate([
      {
        $match: {
          date: today,
          user: { $in: userIds },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$user',
          firstName: '$userInfo.firstName',
          lastName: '$userInfo.lastName',
          role: '$userInfo.role',
          avatar: '$userInfo.avatar',
          steps: 1,
          points: 1,
          goalAchieved: 1,
        },
      },
      { $sort: { steps: -1 } },
      { $limit: 100 },
    ]);

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get weekly leaderboard
// @route   GET /api/leaderboard/weekly
// @access  Private
const getWeeklyLeaderboard = async (req, res) => {
  try {
    const { role, groupId } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Build user filter
    const userFilter = {};
    if (role) userFilter.role = role;
    if (groupId) userFilter.groups = groupId;

    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(u => u._id);

    const leaderboard = await Step.aggregate([
      {
        $match: {
          date: { $gte: weekAgo },
          user: { $in: userIds },
        },
      },
      {
        $group: {
          _id: '$user',
          totalSteps: { $sum: '$steps' },
          totalPoints: { $sum: '$points' },
          daysActive: { $sum: 1 },
          goalsAchieved: {
            $sum: { $cond: ['$goalAchieved', 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          firstName: '$userInfo.firstName',
          lastName: '$userInfo.lastName',
          role: '$userInfo.role',
          avatar: '$userInfo.avatar',
          totalSteps: 1,
          totalPoints: 1,
          daysActive: 1,
          goalsAchieved: 1,
          avgSteps: { $divide: ['$totalSteps', '$daysActive'] },
        },
      },
      { $sort: { totalSteps: -1 } },
      { $limit: 100 },
    ]);

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly leaderboard
// @route   GET /api/leaderboard/monthly
// @access  Private
const getMonthlyLeaderboard = async (req, res) => {
  try {
    const { role, groupId } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Build user filter
    const userFilter = {};
    if (role) userFilter.role = role;
    if (groupId) userFilter.groups = groupId;

    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(u => u._id);

    const leaderboard = await Step.aggregate([
      {
        $match: {
          date: { $gte: monthAgo },
          user: { $in: userIds },
        },
      },
      {
        $group: {
          _id: '$user',
          totalSteps: { $sum: '$steps' },
          totalPoints: { $sum: '$points' },
          daysActive: { $sum: 1 },
          goalsAchieved: {
            $sum: { $cond: ['$goalAchieved', 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          firstName: '$userInfo.firstName',
          lastName: '$userInfo.lastName',
          role: '$userInfo.role',
          avatar: '$userInfo.avatar',
          totalSteps: 1,
          totalPoints: 1,
          daysActive: 1,
          goalsAchieved: 1,
          avgSteps: { $divide: ['$totalSteps', '$daysActive'] },
        },
      },
      { $sort: { totalSteps: -1 } },
      { $limit: 100 },
    ]);

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's current rank
// @route   GET /api/leaderboard/myrank
// @access  Private
const getMyRank = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const userId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dateFilter;
    if (period === 'daily') {
      dateFilter = today;
    } else if (period === 'weekly') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { $gte: weekAgo };
    } else {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { $gte: monthAgo };
    }

    // Get all users with same role
    const currentUser = await User.findById(userId);
    const allUsers = await User.find({ role: currentUser.role }).select('_id');
    const userIds = allUsers.map(u => u._id);

    // Calculate rankings
    const rankings = await Step.aggregate([
      {
        $match: {
          date: period === 'daily' ? dateFilter : dateFilter,
          user: { $in: userIds },
        },
      },
      {
        $group: {
          _id: '$user',
          totalSteps: { $sum: '$steps' },
        },
      },
      { $sort: { totalSteps: -1 } },
    ]);

    const myRank = rankings.findIndex(r => r._id.toString() === userId.toString()) + 1;
    const totalUsers = rankings.length;
    const mySteps = rankings.find(r => r._id.toString() === userId.toString())?.totalSteps || 0;

    res.json({
      rank: myRank || totalUsers + 1,
      totalUsers,
      steps: mySteps,
      period,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDailyLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
  getMyRank,
};
