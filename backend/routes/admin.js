const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { success, error, paginated } = require('../utils/responseEnvelope');
const { parsePagination } = require('../utils/pagination');

// Apply auth and admin protections to all admin routes
router.use(protect);
router.use(requireAdmin);

// ─── GET USERS LIST (PAGINATED) ───────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { limit: 10 });
    const searchQuery = req.query.search || '';

    const filter = {};
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password -otp -resetToken -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return paginated(res, { data: users, page, limit, total, message: 'Users retrieved successfully' });
  } catch (err) {
    next(err);
  }
});

// ─── UPDATE USER ROLE ────────────────────────────────────────────────
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return error(res, { message: 'Invalid role value', statusCode: 400 });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return error(res, { message: 'User not found', statusCode: 404 });
    }

    // Prevent removing admin role from yourself
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return error(res, { message: 'You cannot revoke admin privileges from yourself', statusCode: 400 });
    }

    user.role = role;
    await user.save();

    return success(res, { data: user, message: `User role updated to ${role}` });
  } catch (err) {
    next(err);
  }
});

// ─── TOGGLE USER DELETION STATUS ────────────────────────────────────
router.patch('/users/:id/toggle-status', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return error(res, { message: 'User not found', statusCode: 404 });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return error(res, { message: 'You cannot suspend/deactivate your own account', statusCode: 400 });
    }

    user.isDeleted = !user.isDeleted;
    user.deletedAt = user.isDeleted ? new Date() : null;
    if (user.isDeleted) {
      user.refreshToken = null; // Invalidate current session
    }
    await user.save();

    return success(res, {
      data: user,
      message: `User status changed to ${user.isDeleted ? 'Suspended' : 'Active'}`
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET SYSTEM ANALYTICS ────────────────────────────────────────────
router.get('/analytics', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isDeleted: false });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    // Aggregation for problem solved statistics
    const progressStats = await Progress.aggregate([
      { $unwind: '$problems' },
      {
        $group: {
          _id: '$problems.status',
          count: { $sum: 1 }
        }
      }
    ]);

    const problemStats = {
      solved: 0,
      attempted: 0,
      unsolved: 0
    };

    progressStats.forEach(stat => {
      if (problemStats[stat._id] !== undefined) {
        problemStats[stat._id] = stat.count;
      }
    });

    return success(res, {
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers,
          suspended: totalUsers - activeUsers
        },
        problems: problemStats
      },
      message: 'System analytics retrieved successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
