import User from '../models/user.model.js';

// Middleware to check if user is an admin
const isAdmin = async (req, res, next) => {
  try {
    // At this point, the auth middleware should have already verified
    // the token and set the userId in the request
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required' });
    }

    // If user is admin, proceed
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error in admin verification' });
  }
};

export default isAdmin;
