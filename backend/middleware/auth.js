const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('-password -otp -resetToken');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (user.isDeleted) {
        return res.status(401).json({ message: 'Account has been deleted' });
      }

      req.user = user;

      // Keep demo accounts read-only so recruiter/guest previews stay clean.
      const isDemoStudent = user.email === 'demo@kluniversity.in';
      const isDemoAdmin = user.email === 'admin@kluniversity.in';
      if (isDemoStudent || isDemoAdmin) {
        const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
        const allowedDemoMutations = [
          '/api/auth/logout',
          '/api/auth/refresh',
        ];
        const currentPath = req.originalUrl || req.path;
        const isAllowed = allowedDemoMutations.some(path => currentPath.includes(path));

        if (isMutation && !isAllowed) {
          return res.status(403).json({
            message: 'This action is disabled for the Demo account to preserve platform preview integrity.',
            code: 'DEMO_RESTRICTED'
          });
        }
      }

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
