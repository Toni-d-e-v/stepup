const User = require('../models/User');
const Step = require('../models/Step');
const Group = require('../models/Group');
const Challenge = require('../models/Challenge');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Build filter based on user role
    const userFilter = {};
    const groupFilter = {};

    // SchoolAdmin can only see their school's data
    if (req.user.role === 'schoolAdmin') {
      if (!req.user.school) {
        return res.status(403).json({ message: 'School admin must be assigned to a school' });
      }
      userFilter.school = req.user.school;
      groupFilter.school = req.user.school;
    }

    const totalUsers = await User.countDocuments(userFilter);
    const regularUsers = await User.countDocuments({ ...userFilter, role: 'user' });
    const schoolAdmins = await User.countDocuments({ ...userFilter, role: 'schoolAdmin' });
    const totalGroups = await Group.countDocuments(groupFilter);
    const totalChallenges = await Challenge.countDocuments();

    // Total steps across all users
    const totalStepsResult = await Step.aggregate([
      { $group: { _id: null, total: { $sum: '$steps' } } },
    ]);
    const totalSteps = totalStepsResult[0]?.total || 0;

    // Active users (users with steps in last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const activeUserIds = await Step.distinct('user', {
      date: { $gte: weekAgo },
    });
    const activeUsers = activeUserIds.length;

    // Top users this week
    const topUsers = await Step.aggregate([
      { $match: { date: { $gte: weekAgo } } },
      { $group: { _id: '$user', totalSteps: { $sum: '$steps' } } },
      { $sort: { totalSteps: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          role: '$user.role',
          totalSteps: 1,
        },
      },
    ]);

    // Recent registrations
    const recentUsers = await User.find(userFilter)
      .select('firstName lastName email role createdAt school')
      .populate('school', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Daily steps trend (last 7 days)
    const dailySteps = await Step.aggregate([
      { $match: { date: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalSteps: { $sum: '$steps' },
          userCount: { $addToSet: '$user' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          totalSteps: 1,
          activeUsers: { $size: '$userCount' },
        },
      },
    ]);

    res.json({
      overview: {
        totalUsers,
        regularUsers,
        schoolAdmins,
        activeUsers,
        totalGroups,
        totalChallenges,
        totalSteps,
      },
      topUsers,
      recentUsers,
      dailySteps,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with filtering and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = {};

    // SchoolAdmin can only see users from their school
    if (req.user.role === 'schoolAdmin') {
      if (!req.user.school) {
        return res.status(403).json({ message: 'School admin must be assigned to a school' });
      }
      filter.school = req.user.school;
      // SchoolAdmin can only see regular users, not other admins
      filter.role = 'user';
    } else if (role) {
      // SuperAdmin can filter by role
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const users = await User.find(filter)
      .select('-password')
      .populate('school', 'name')
      .populate('groups', 'name type')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('groups', 'name type members');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's step history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const steps = await Step.find({
      user: user._id,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    // Calculate statistics
    const stats = await Step.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalSteps: { $sum: '$steps' },
          avgSteps: { $avg: '$steps' },
          totalPoints: { $sum: '$points' },
          daysActive: { $sum: 1 },
        },
      },
    ]);

    res.json({
      user,
      steps,
      statistics: stats[0] || {
        totalSteps: 0,
        avgSteps: 0,
        totalPoints: 0,
        daysActive: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, dailyStepGoal } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // SchoolAdmin can only update users from their school
    if (req.user.role === 'schoolAdmin') {
      if (!req.user.school || user.school.toString() !== req.user.school.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      // SchoolAdmin cannot change roles
      if (role && role !== user.role) {
        return res.status(403).json({ message: 'Cannot change user roles' });
      }
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    // Only superAdmin can change roles
    if (role && req.user.role === 'superAdmin') user.role = role;
    if (dailyStepGoal) user.dailyStepGoal = dailyStepGoal;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      dailyStepGoal: updatedUser.dailyStepGoal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // SchoolAdmin can only delete users from their school
    if (req.user.role === 'schoolAdmin') {
      if (!req.user.school || user.school.toString() !== req.user.school.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (user.role !== 'user') {
        return res.status(403).json({ message: 'Cannot delete admin users' });
      }
    }

    // Delete user's steps
    await Step.deleteMany({ user: user._id });

    // Remove user from groups
    await Group.updateMany(
      { members: user._id },
      { $pull: { members: user._id } }
    );

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create bulk users
// @route   POST /api/admin/users/bulk
// @access  Private/Admin
const createBulkUsers = async (req, res) => {
  try {
    const { users } = req.body; // Array of user objects

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of users' });
    }

    const createdUsers = await User.insertMany(users);

    res.status(201).json({
      message: `${createdUsers.length} users created successfully`,
      users: createdUsers.map(u => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getSystemStatistics = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;

    let dateFilter;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'daily') {
      dateFilter = today;
    } else if (period === 'weekly') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { $gte: weekAgo };
    } else if (period === 'monthly') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { $gte: monthAgo };
    } else {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      dateFilter = { $gte: yearAgo };
    }

    // Steps by role
    const stepsByRole = await Step.aggregate([
      { $match: { date: dateFilter } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.role',
          totalSteps: { $sum: '$steps' },
          avgSteps: { $avg: '$steps' },
          userCount: { $addToSet: '$user._id' },
        },
      },
      {
        $project: {
          role: '$_id',
          totalSteps: 1,
          avgSteps: 1,
          activeUsers: { $size: '$userCount' },
        },
      },
    ]);

    // Group activity
    const groupActivity = await Group.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'memberDetails',
        },
      },
      {
        $project: {
          name: 1,
          type: 1,
          memberCount: { $size: '$members' },
          totalSteps: { $sum: '$memberDetails.totalSteps' },
        },
      },
      { $sort: { totalSteps: -1 } },
      { $limit: 10 },
    ]);

    // Goals achievement rate
    const goalsStats = await Step.aggregate([
      { $match: { date: dateFilter } },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          goalsAchieved: { $sum: { $cond: ['$goalAchieved', 1, 0] } },
        },
      },
      {
        $project: {
          achievementRate: {
            $multiply: [{ $divide: ['$goalsAchieved', '$totalDays'] }, 100],
          },
          totalDays: 1,
          goalsAchieved: 1,
        },
      },
    ]);

    res.json({
      period,
      stepsByRole,
      groupActivity,
      goalsAchievement: goalsStats[0] || {
        achievementRate: 0,
        totalDays: 0,
        goalsAchieved: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Private/Admin
const exportData = async (req, res) => {
  try {
    const { type } = req.params;
    let data;

    switch (type) {
      case 'users':
        data = await User.find().select('-password');
        break;
      case 'steps':
        data = await Step.find().populate('user', 'firstName lastName email');
        break;
      case 'groups':
        data = await Group.find().populate('members admin');
        break;
      case 'challenges':
        data = await Challenge.find();
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    res.json({ data, exportDate: new Date(), type });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  createBulkUsers,
  getSystemStatistics,
  exportData,
};
