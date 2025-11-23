const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check if user is an admin (superAdmin or schoolAdmin)
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'superAdmin' || req.user.role === 'schoolAdmin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

// Protect admin routes
const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id)
        .select('-password')
        .populate('school', 'name');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Accept both superAdmin and schoolAdmin roles
      if (req.user.role !== 'superAdmin' && req.user.role !== 'schoolAdmin') {
        return res.status(403).json({ message: 'Admin access required' });
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

module.exports = { isAdmin, protectAdmin };
