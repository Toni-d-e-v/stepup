const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminAuth');

// Import admin controllers
const {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  createBulkUsers,
  getSystemStatistics,
  exportData,
} = require('../controllers/adminController');

const {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addMembers,
  removeMember,
  generateGroups,
} = require('../controllers/adminGroupController');

const {
  getAllChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  updateChallengeProgress,
  getChallengeStatistics,
  addParticipants,
} = require('../controllers/adminChallengeController');

// All routes require admin authentication
router.use(protectAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/statistics', getSystemStatistics);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/bulk', createBulkUsers);

// Group Management
router.get('/groups', getAllGroups);
router.post('/groups', createGroup);
router.put('/groups/:id', updateGroup);
router.delete('/groups/:id', deleteGroup);
router.post('/groups/:id/members', addMembers);
router.delete('/groups/:id/members/:userId', removeMember);
router.post('/groups/generate', generateGroups);

// Challenge Management
router.get('/challenges', getAllChallenges);
router.post('/challenges', createChallenge);
router.put('/challenges/:id', updateChallenge);
router.delete('/challenges/:id', deleteChallenge);
router.post('/challenges/:id/update-progress', updateChallengeProgress);
router.get('/challenges/:id/statistics', getChallengeStatistics);
router.post('/challenges/:id/participants', addParticipants);

// Data Export
router.get('/export/:type', exportData);

module.exports = router;
