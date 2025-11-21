const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Group = require('../models/Group');
const Step = require('../models/Step');

// @desc    Get all challenges
// @route   GET /api/admin/challenges
// @access  Private/Admin
const getAllChallenges = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const challenges = await Challenge.find(filter)
      .populate('groups', 'name type')
      .populate('participants.user', 'firstName lastName role')
      .sort({ startDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Challenge.countDocuments(filter);

    res.json({
      challenges,
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

// @desc    Create new challenge
// @route   POST /api/admin/challenges
// @access  Private/Admin
const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      targetSteps,
      startDate,
      endDate,
      groupIds,
      rewardPoints,
      rewardBadge,
    } = req.body;

    // Determine status based on dates
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    let status = 'upcoming';
    if (now >= start && now <= end) {
      status = 'active';
    } else if (now > end) {
      status = 'completed';
    }

    const challenge = await Challenge.create({
      title,
      description,
      type,
      targetSteps,
      startDate: start,
      endDate: end,
      groups: groupIds || [],
      status,
      rewards: {
        points: rewardPoints || 0,
        badge: rewardBadge || '',
      },
    });

    // If groups specified, add all group members as participants
    if (groupIds && groupIds.length > 0) {
      const groups = await Group.find({ _id: { $in: groupIds } });
      const userIds = new Set();

      groups.forEach(group => {
        group.members.forEach(memberId => {
          userIds.add(memberId.toString());
        });
      });

      challenge.participants = Array.from(userIds).map(userId => ({
        user: userId,
        steps: 0,
        completed: false,
      }));

      await challenge.save();
    }

    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('groups', 'name type')
      .populate('participants.user', 'firstName lastName role');

    res.status(201).json(populatedChallenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update challenge
// @route   PUT /api/admin/challenges/:id
// @access  Private/Admin
const updateChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      targetSteps,
      startDate,
      endDate,
      status,
      rewardPoints,
      rewardBadge,
    } = req.body;

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (title) challenge.title = title;
    if (description) challenge.description = description;
    if (type) challenge.type = type;
    if (targetSteps) challenge.targetSteps = targetSteps;
    if (startDate) challenge.startDate = new Date(startDate);
    if (endDate) challenge.endDate = new Date(endDate);
    if (status) challenge.status = status;
    if (rewardPoints !== undefined) challenge.rewards.points = rewardPoints;
    if (rewardBadge !== undefined) challenge.rewards.badge = rewardBadge;

    await challenge.save();

    const updatedChallenge = await Challenge.findById(challenge._id)
      .populate('groups', 'name type')
      .populate('participants.user', 'firstName lastName role');

    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete challenge
// @route   DELETE /api/admin/challenges/:id
// @access  Private/Admin
const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    await Challenge.findByIdAndDelete(req.params.id);

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update challenge progress
// @route   POST /api/admin/challenges/:id/update-progress
// @access  Private/Admin
const updateChallengeProgress = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Calculate steps for each participant during challenge period
    for (let participant of challenge.participants) {
      const steps = await Step.aggregate([
        {
          $match: {
            user: participant.user,
            date: {
              $gte: challenge.startDate,
              $lte: challenge.endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSteps: { $sum: '$steps' },
          },
        },
      ]);

      const totalSteps = steps[0]?.totalSteps || 0;
      participant.steps = totalSteps;
      participant.completed = totalSteps >= challenge.targetSteps;
    }

    await challenge.save();

    const updatedChallenge = await Challenge.findById(challenge._id)
      .populate('participants.user', 'firstName lastName role');

    res.json({
      message: 'Challenge progress updated',
      challenge: updatedChallenge,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get challenge statistics
// @route   GET /api/admin/challenges/:id/statistics
// @access  Private/Admin
const getChallengeStatistics = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('participants.user', 'firstName lastName role');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const totalParticipants = challenge.participants.length;
    const completedCount = challenge.participants.filter(p => p.completed).length;
    const completionRate = totalParticipants > 0
      ? (completedCount / totalParticipants) * 100
      : 0;

    const averageSteps = totalParticipants > 0
      ? challenge.participants.reduce((sum, p) => sum + p.steps, 0) / totalParticipants
      : 0;

    const topParticipants = challenge.participants
      .sort((a, b) => b.steps - a.steps)
      .slice(0, 10)
      .map((p, index) => ({
        rank: index + 1,
        user: p.user,
        steps: p.steps,
        completed: p.completed,
        progress: ((p.steps / challenge.targetSteps) * 100).toFixed(1),
      }));

    res.json({
      challenge: {
        title: challenge.title,
        type: challenge.type,
        targetSteps: challenge.targetSteps,
        status: challenge.status,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
      },
      statistics: {
        totalParticipants,
        completedCount,
        completionRate: completionRate.toFixed(1),
        averageSteps: Math.round(averageSteps),
      },
      topParticipants,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add participants to challenge
// @route   POST /api/admin/challenges/:id/participants
// @access  Private/Admin
const addParticipants = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Please provide user IDs' });
    }

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Add new participants (avoiding duplicates)
    const existingUserIds = challenge.participants.map(p => p.user.toString());
    const newParticipants = userIds
      .filter(id => !existingUserIds.includes(id))
      .map(userId => ({
        user: userId,
        steps: 0,
        completed: false,
      }));

    challenge.participants.push(...newParticipants);
    await challenge.save();

    const updatedChallenge = await Challenge.findById(challenge._id)
      .populate('participants.user', 'firstName lastName role');

    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  updateChallengeProgress,
  getChallengeStatistics,
  addParticipants,
};
