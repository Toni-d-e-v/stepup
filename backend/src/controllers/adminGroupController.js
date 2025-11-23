const Group = require('../models/Group');
const User = require('../models/User');

// @desc    Get all groups with details
// @route   GET /api/admin/groups
// @access  Private/Admin
const getAllGroups = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;

    const filter = {};

    // SchoolAdmin can only see their school's groups
    if (req.user.role === 'schoolAdmin') {
      if (!req.user.school) {
        return res.status(403).json({ message: 'School admin must be assigned to a school' });
      }
      filter.school = req.user.school;
    }

    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const groups = await Group.find(filter)
      .populate('admin', 'firstName lastName email')
      .populate('school', 'name')
      .populate('members', 'firstName lastName role totalSteps')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Group.countDocuments(filter);

    res.json({
      groups,
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

// @desc    Create new group
// @route   POST /api/admin/groups
// @access  Private/Admin
const createGroup = async (req, res) => {
  try {
    const { name, type, description, adminId, memberIds, school } = req.body;

    // Determine school based on user role
    let schoolId;
    if (req.user.role === 'schoolAdmin') {
      if (!req.user.school) {
        return res.status(403).json({ message: 'School admin must be assigned to a school' });
      }
      schoolId = req.user.school;
    } else if (req.user.role === 'superAdmin') {
      if (!school) {
        return res.status(400).json({ message: 'School is required' });
      }
      schoolId = school;
    }

    // Verify admin exists
    const admin = await User.findById(adminId || req.user._id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // If memberIds provided, verify they belong to the same school
    if (memberIds && memberIds.length > 0) {
      const members = await User.find({
        _id: { $in: memberIds },
        school: schoolId
      });

      if (members.length !== memberIds.length) {
        return res.status(400).json({
          message: 'All members must belong to the same school as the group'
        });
      }
    }

    const group = await Group.create({
      name,
      type,
      description,
      admin: adminId || req.user._id,
      school: schoolId,
      members: memberIds || [],
    });

    // Add group to users
    if (memberIds && memberIds.length > 0) {
      await User.updateMany(
        { _id: { $in: memberIds } },
        { $push: { groups: group._id } }
      );
    }

    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'firstName lastName email')
      .populate('school', 'name')
      .populate('members', 'firstName lastName role');

    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update group
// @route   PUT /api/admin/groups/:id
// @access  Private/Admin
const updateGroup = async (req, res) => {
  try {
    const { name, type, description, adminId } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    if (req.user.role === 'schoolAdmin') {
      if (!req.user.school || group.school.toString() !== req.user.school.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (name) group.name = name;
    if (type) group.type = type;
    if (description !== undefined) group.description = description;
    if (adminId) {
      const admin = await User.findById(adminId);
      if (!admin) {
        return res.status(404).json({ message: 'Admin user not found' });
      }
      group.admin = adminId;
    }

    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate('admin', 'firstName lastName email')
      .populate('school', 'name')
      .populate('members', 'firstName lastName role');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete group
// @route   DELETE /api/admin/groups/:id
// @access  Private/Admin
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    if (req.user.role === 'schoolAdmin') {
      if (!req.user.school || group.school.toString() !== req.user.school.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Remove group from all users
    await User.updateMany(
      { groups: group._id },
      { $pull: { groups: group._id } }
    );

    await Group.findByIdAndDelete(req.params.id);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add members to group
// @route   POST /api/admin/groups/:id/members
// @access  Private/Admin
const addMembers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Please provide user IDs' });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    if (req.user.role === 'schoolAdmin') {
      if (!req.user.school || group.school.toString() !== req.user.school.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Verify all users belong to the same school
    const users = await User.find({
      _id: { $in: userIds },
      school: group.school
    });

    if (users.length !== userIds.length) {
      return res.status(400).json({
        message: 'All users must belong to the same school as the group'
      });
    }

    // Add new members (avoiding duplicates)
    const newMembers = userIds.filter(id => !group.members.includes(id));
    group.members.push(...newMembers);
    await group.save();

    // Add group to users
    await User.updateMany(
      { _id: { $in: newMembers } },
      { $addToSet: { groups: group._id } }
    );

    const updatedGroup = await Group.findById(group._id)
      .populate('members', 'firstName lastName role email');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/admin/groups/:id/members/:userId
// @access  Private/Admin
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    if (req.user.role === 'schoolAdmin') {
      if (!req.user.school || group.school.toString() !== req.user.school.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    group.members = group.members.filter(
      memberId => memberId.toString() !== userId
    );
    await group.save();

    // Remove group from user
    await User.findByIdAndUpdate(userId, {
      $pull: { groups: group._id },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate groups automatically
// @route   POST /api/admin/groups/generate
// @access  Private/Admin
const generateGroups = async (req, res) => {
  try {
    const { type, pattern, school } = req.body;
    // type: 'class' or 'generation'
    // pattern: { prefix: 'Class', start: 1, end: 10 } or { name: 'Generation 2024', role: 'user' }

    // Determine school based on user role
    let schoolId;
    if (req.user.role === 'schoolAdmin') {
      if (!req.user.school) {
        return res.status(403).json({ message: 'School admin must be assigned to a school' });
      }
      schoolId = req.user.school;
    } else if (req.user.role === 'superAdmin') {
      if (!school) {
        return res.status(400).json({ message: 'School is required' });
      }
      schoolId = school;
    }

    const createdGroups = [];

    if (type === 'class' && pattern.prefix && pattern.start && pattern.end) {
      // Generate class groups (e.g., Class 1, Class 2, ...)
      for (let i = pattern.start; i <= pattern.end; i++) {
        const group = await Group.create({
          name: `${pattern.prefix} ${i}`,
          type: 'class',
          description: `Auto-generated class group ${i}`,
          admin: req.user._id,
          school: schoolId,
          members: [],
        });
        createdGroups.push(group);
      }
    } else if (type === 'generation' && pattern.name) {
      // Generate generation group for all users from the school
      const users = await User.find({
        role: pattern.role || 'user',
        school: schoolId
      });
      const userIds = users.map(u => u._id);

      const group = await Group.create({
        name: pattern.name,
        type: 'generation',
        description: `Auto-generated generation group for ${pattern.role || 'users'}`,
        admin: req.user._id,
        school: schoolId,
        members: userIds,
      });

      // Add group to all users
      await User.updateMany(
        { _id: { $in: userIds } },
        { $addToSet: { groups: group._id } }
      );

      createdGroups.push(group);
    } else if (type === 'all_students') {
      // Create "All Students" group (now "All Users" for the school)
      const users = await User.find({ role: 'user', school: schoolId });
      const userIds = users.map(u => u._id);

      const group = await Group.create({
        name: 'All Users',
        type: 'all_students',
        description: 'Group containing all users from the school',
        admin: req.user._id,
        school: schoolId,
        members: userIds,
      });

      await User.updateMany(
        { _id: { $in: userIds } },
        { $addToSet: { groups: group._id } }
      );

      createdGroups.push(group);
    } else {
      return res.status(400).json({ message: 'Invalid pattern for group generation' });
    }

    res.status(201).json({
      message: `${createdGroups.length} groups created successfully`,
      groups: createdGroups,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addMembers,
  removeMember,
  generateGroups,
};
