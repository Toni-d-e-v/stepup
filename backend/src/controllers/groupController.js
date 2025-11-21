const Group = require('../models/Group');
const User = require('../models/User');

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = {};
    if (type) filter.type = type;

    const groups = await Group.find(filter)
      .populate('admin', 'firstName lastName')
      .populate('members', 'firstName lastName role')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new group
// @route   POST /api/groups
// @access  Private (Professor only)
const createGroup = async (req, res) => {
  try {
    const { name, type, description } = req.body;

    const group = await Group.create({
      name,
      type,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });

    // Add group to user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { groups: group._id },
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('admin', 'firstName lastName email')
      .populate('members', 'firstName lastName role totalSteps totalPoints');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a group
// @route   POST /api/groups/:id/join
// @access  Private
const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if already a member
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    // Add user to group
    group.members.push(req.user._id);
    await group.save();

    // Add group to user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { groups: group._id },
    });

    res.json({ message: 'Successfully joined group', group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Remove user from group
    group.members = group.members.filter(
      memberId => memberId.toString() !== req.user._id.toString()
    );
    await group.save();

    // Remove group from user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { groups: group._id },
    });

    res.json({ message: 'Successfully left group' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group leaderboard
// @route   GET /api/groups/:id/leaderboard
// @access  Private
const getGroupLeaderboard = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'firstName lastName totalSteps totalPoints role avatar');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Sort members by total steps
    const leaderboard = group.members
      .map((member, index) => ({
        rank: index + 1,
        userId: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
        avatar: member.avatar,
        totalSteps: member.totalSteps,
        totalPoints: member.totalPoints,
      }))
      .sort((a, b) => b.totalSteps - a.totalSteps);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGroups,
  createGroup,
  getGroup,
  joinGroup,
  leaveGroup,
  getGroupLeaderboard,
};
