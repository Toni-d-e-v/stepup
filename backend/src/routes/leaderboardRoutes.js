const express = require('express');
const router = express.Router();
const {
  getDailyLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
  getMyRank,
} = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

router.get('/daily', protect, getDailyLeaderboard);
router.get('/weekly', protect, getWeeklyLeaderboard);
router.get('/monthly', protect, getMonthlyLeaderboard);
router.get('/myrank', protect, getMyRank);

module.exports = router;
