const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Check if user is a super admin
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superAdmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Super admins only.' });
  }
};

// Check if user is a school admin
const isSchoolAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'schoolAdmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. School admins only.' });
  }
};

// Check if user is either super admin or school admin
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'superAdmin' || req.user.role === 'schoolAdmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin access required.' });
  }
};

module.exports = { protect, isSuperAdmin, isSchoolAdmin, isAdmin };
