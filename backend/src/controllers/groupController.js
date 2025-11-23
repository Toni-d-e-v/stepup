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

    // If user is a regular user, only show groups they're a member of
    if (req.user.role === 'user') {
      filter.members = req.user._id;
    }
    // If user is a schoolAdmin, only show groups from their school
    else if (req.user.role === 'schoolAdmin') {
      if (!req.user.school) {
        return res.status(403).json({ message: 'School admin must be assigned to a school' });
      }
      filter.school = req.user.school;
    }
    // SuperAdmin can see all groups (no filter added)

    const groups = await Group.find(filter)
      .populate('admin', 'firstName lastName')
      .populate('school', 'name')
      .populate('members', 'firstName lastName role')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new group
// @route   POST /api/groups
// @access  Private (SchoolAdmin/SuperAdmin only)
const createGroup = async (req, res) => {
  try {
    const { name, type, description, memberIds } = req.body;

    // Only schoolAdmin and superAdmin can create groups
    if (req.user.role !== 'schoolAdmin' && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Only admins can create groups' });
    }

    // SchoolAdmin must have a school assigned
    if (req.user.role === 'schoolAdmin' && !req.user.school) {
      return res.status(403).json({ message: 'School admin must be assigned to a school' });
    }

    // For schoolAdmin, use their school. For superAdmin, require school in request
    const schoolId = req.user.role === 'schoolAdmin'
      ? req.user.school
      : req.body.school;

    if (!schoolId) {
      return res.status(400).json({ message: 'School is required' });
    }

    // If memberIds provided, verify they belong to the same school
    if (memberIds && memberIds.length > 0) {
      const members = await User.find({
        _id: { $in: memberIds },
        school: schoolId
      });

      if (members.length !== memberIds.length) {
        return res.status(400).json({
          message: 'All members must belong to the same school'
        });
      }
    }

    const group = await Group.create({
      name,
      type,
      description,
      admin: req.user._id,
      school: schoolId,
      members: memberIds || [],
    });

    // Add group to all members' groups array
    if (memberIds && memberIds.length > 0) {
      await User.updateMany(
        { _id: { $in: memberIds } },
        { $push: { groups: group._id } }
      );
    }

    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'firstName lastName')
      .populate('school', 'name')
      .populate('members', 'firstName lastName role');

    res.status(201).json(populatedGroup);
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
      .populate('school', 'name')
      .populate('members', 'firstName lastName role totalSteps totalPoints');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check access: users can only see groups they're in, schoolAdmins can only see their school's groups
    if (req.user.role === 'user') {
      const isMember = group.members.some(
        member => member._id.toString() === req.user._id.toString()
      );
      if (!isMember) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'schoolAdmin') {
      if (group.school._id.toString() !== req.user.school.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (Admin only)
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    const isGroupAdmin = group.admin.toString() === req.user._id.toString();
    const isSchoolAdmin = req.user.role === 'schoolAdmin' &&
                          group.school.toString() === req.user.school.toString();
    const isSuperAdmin = req.user.role === 'superAdmin';

    if (!isGroupAdmin && !isSchoolAdmin && !isSuperAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this group' });
    }

    const { name, type, description } = req.body;

    if (name) group.name = name;
    if (type) group.type = type;
    if (description !== undefined) group.description = description;

    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate('admin', 'firstName lastName')
      .populate('school', 'name')
      .populate('members', 'firstName lastName role');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private (Admin only)
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    const isGroupAdmin = group.admin.toString() === req.user._id.toString();
    const isSchoolAdmin = req.user.role === 'schoolAdmin' &&
                          group.school.toString() === req.user.school.toString();
    const isSuperAdmin = req.user.role === 'superAdmin';

    if (!isGroupAdmin && !isSchoolAdmin && !isSuperAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this group' });
    }

    // Remove group from all members
    await User.updateMany(
      { _id: { $in: group.members } },
      { $pull: { groups: group._id } }
    );

    await group.deleteOne();

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add members to group
// @route   POST /api/groups/:id/members
// @access  Private (SchoolAdmin/SuperAdmin only)
const addMembers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of user IDs' });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    const isSchoolAdmin = req.user.role === 'schoolAdmin' &&
                          group.school.toString() === req.user.school.toString();
    const isSuperAdmin = req.user.role === 'superAdmin';

    if (!isSchoolAdmin && !isSuperAdmin) {
      return res.status(403).json({ message: 'Not authorized to add members' });
    }

    // Verify all users belong to the same school as the group
    const users = await User.find({
      _id: { $in: userIds },
      school: group.school
    });

    if (users.length !== userIds.length) {
      return res.status(400).json({
        message: 'All users must belong to the same school as the group'
      });
    }

    // Filter out users who are already members
    const newMemberIds = userIds.filter(
      userId => !group.members.some(memberId => memberId.toString() === userId)
    );

    if (newMemberIds.length === 0) {
      return res.status(400).json({ message: 'All users are already members' });
    }

    // Add new members to group
    group.members.push(...newMemberIds);
    await group.save();

    // Add group to users' groups array
    await User.updateMany(
      { _id: { $in: newMemberIds } },
      { $push: { groups: group._id } }
    );

    const updatedGroup = await Group.findById(group._id)
      .populate('admin', 'firstName lastName')
      .populate('school', 'name')
      .populate('members', 'firstName lastName role totalSteps totalPoints');

    res.json({
      message: `Successfully added ${newMemberIds.length} member(s)`,
      group: updatedGroup
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private (SchoolAdmin/SuperAdmin only)
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    const isSchoolAdmin = req.user.role === 'schoolAdmin' &&
                          group.school.toString() === req.user.school.toString();
    const isSuperAdmin = req.user.role === 'superAdmin';

    if (!isSchoolAdmin && !isSuperAdmin) {
      return res.status(403).json({ message: 'Not authorized to remove members' });
    }

    // Check if user is a member
    const memberIndex = group.members.findIndex(
      memberId => memberId.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: 'User is not a member of this group' });
    }

    // Remove member from group
    group.members.splice(memberIndex, 1);
    await group.save();

    // Remove group from user's groups
    await User.findByIdAndUpdate(userId, {
      $pull: { groups: group._id }
    });

    const updatedGroup = await Group.findById(group._id)
      .populate('admin', 'firstName lastName')
      .populate('school', 'name')
      .populate('members', 'firstName lastName role totalSteps totalPoints');

    res.json({
      message: 'Member removed successfully',
      group: updatedGroup
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a group (user self-join - kept for backward compatibility)
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

    // Verify user belongs to same school
    if (req.user.school.toString() !== group.school.toString()) {
      return res.status(403).json({ message: 'Can only join groups from your school' });
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

    // Check access
    if (req.user.role === 'user') {
      const isMember = group.members.some(
        member => member._id.toString() === req.user._id.toString()
      );
      if (!isMember) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'schoolAdmin') {
      if (group.school.toString() !== req.user.school.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
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
      .sort((a, b) => b.totalSteps - a.totalSteps)
      .map((member, index) => ({ ...member, rank: index + 1 })); // Re-assign ranks after sorting

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGroups,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  addMembers,
  removeMember,
  joinGroup,
  leaveGroup,
  getGroupLeaderboard,
};
