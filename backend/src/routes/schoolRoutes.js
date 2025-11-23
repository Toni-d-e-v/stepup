const express = require('express');
const router = express.Router();
const {
  getSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
  addSchoolAdmin,
  removeSchoolAdmin,
} = require('../controllers/schoolController');
const { protect, isSuperAdmin } = require('../middleware/auth');

// Public routes (needed for registration)
router.get('/', getSchools);
router.get('/:id', getSchool);

// Super admin only routes
router.post('/', protect, isSuperAdmin, createSchool);
router.put('/:id', protect, isSuperAdmin, updateSchool);
router.delete('/:id', protect, isSuperAdmin, deleteSchool);
router.post('/:id/admins', protect, isSuperAdmin, addSchoolAdmin);
router.delete('/:id/admins/:userId', protect, isSuperAdmin, removeSchoolAdmin);

module.exports = router;
