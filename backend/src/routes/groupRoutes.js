const express = require('express');
const router = express.Router();
const {
  getGroups,
  createGroup,
  getGroup,
  joinGroup,
  leaveGroup,
  getGroupLeaderboard,
} = require('../controllers/groupController');
const { protect, isProfessor } = require('../middleware/auth');

router.get('/', protect, getGroups);
router.post('/', protect, isProfessor, createGroup);
router.get('/:id', protect, getGroup);
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);
router.get('/:id/leaderboard', protect, getGroupLeaderboard);

module.exports = router;
