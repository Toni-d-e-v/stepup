const School = require('../models/School');
const User = require('../models/User');

// @desc    Get all schools
// @route   GET /api/schools
// @access  Public (needed for registration)
const getSchools = async (req, res) => {
  try {
    const schools = await School.find({ active: true })
      .select('name address city country')
      .sort('name');

    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single school
// @route   GET /api/schools/:id
// @access  Public
const getSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id)
      .populate('schoolAdmins', 'firstName lastName email');

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    res.json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new school
// @route   POST /api/schools
// @access  Private/SuperAdmin
const createSchool = async (req, res) => {
  try {
    const { name, address, city, country } = req.body;

    // Check if school already exists
    const schoolExists = await School.findOne({ name });

    if (schoolExists) {
      return res.status(400).json({ message: 'School already exists' });
    }

    const school = await School.create({
      name,
      address,
      city,
      country,
      createdBy: req.user._id,
    });

    res.status(201).json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update school
// @route   PUT /api/schools/:id
// @access  Private/SuperAdmin
const updateSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const { name, address, city, country, active } = req.body;

    school.name = name || school.name;
    school.address = address !== undefined ? address : school.address;
    school.city = city !== undefined ? city : school.city;
    school.country = country !== undefined ? country : school.country;
    school.active = active !== undefined ? active : school.active;

    const updatedSchool = await school.save();

    res.json(updatedSchool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete school
// @route   DELETE /api/schools/:id
// @access  Private/SuperAdmin
const deleteSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Soft delete by setting active to false
    school.active = false;
    await school.save();

    res.json({ message: 'School deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add school admin to school
// @route   POST /api/schools/:id/admins
// @access  Private/SuperAdmin
const addSchoolAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user role to schoolAdmin
    user.role = 'schoolAdmin';
    user.school = school._id;
    await user.save();

    // Add to school's admin list if not already there
    if (!school.schoolAdmins.includes(userId)) {
      school.schoolAdmins.push(userId);
      await school.save();
    }

    res.json({ message: 'School admin added successfully', school });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create and assign school admin
// @route   POST /api/schools/:id/create-admin
// @access  Private/SuperAdmin
const createSchoolAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Create new user with schoolAdmin role
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'schoolAdmin',
      school: school._id,
    });

    // Add to school's admin list
    school.schoolAdmins.push(user._id);
    await school.save();

    // Populate and return
    await user.populate('school', 'name');

    res.status(201).json({
      message: 'School admin created successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        school: user.school,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove school admin from school
// @route   DELETE /api/schools/:id/admins/:userId
// @access  Private/SuperAdmin
const removeSchoolAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user role back to user
    user.role = 'user';
    await user.save();

    // Remove from school's admin list
    school.schoolAdmins = school.schoolAdmins.filter(
      (adminId) => adminId.toString() !== userId
    );
    await school.save();

    res.json({ message: 'School admin removed successfully', school });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
  createSchoolAdmin,
  addSchoolAdmin,
  removeSchoolAdmin,
};
