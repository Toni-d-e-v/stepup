const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/groupController');
const { protect, isAdmin } = require('../middleware/auth');

// Group CRUD
router.get('/', protect, getGroups);
router.post('/', protect, isAdmin, createGroup);
router.get('/:id', protect, getGroup);
router.put('/:id', protect, isAdmin, updateGroup);
router.delete('/:id', protect, isAdmin, deleteGroup);

// Group membership management (admin only)
router.post('/:id/members', protect, isAdmin, addMembers);
router.delete('/:id/members/:userId', protect, isAdmin, removeMember);

// User self-service (join/leave)
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);

// Leaderboard
router.get('/:id/leaderboard', protect, getGroupLeaderboard);

module.exports = router;
