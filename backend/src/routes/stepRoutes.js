const express = require('express');
const router = express.Router();
const {
  addSteps,
  getSteps,
  getStatistics,
  getUserSteps,
} = require('../controllers/stepController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addSteps);
router.get('/', protect, getSteps);
router.get('/statistics', protect, getStatistics);
router.get('/user/:userId', protect, getUserSteps);

module.exports = router;
