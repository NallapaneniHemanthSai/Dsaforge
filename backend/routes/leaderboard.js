const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// ─── GET LEADERBOARD ──────────────────────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    const { filter = 'alltime', page = 1 } = req.query;
    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;

    // Get all verified, non-deleted users
    const users = await User.find({ isVerified: true, isDeleted: { $ne: true } })
      .select('name username email createdAt')
      .lean();

    // Get progress for all users
    const userIds = users.map(u => u._id);
    const progressDocs = await Progress.find({ userId: { $in: userIds } }).lean();

    // Build leaderboard
    const now = new Date();
    let startDate = null;

    if (filter === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (filter === 'month') {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const leaderboard = users.map(user => {
      const progressDoc = progressDocs.find(p => p.userId.toString() === user._id.toString());
      let solved = 0;
      let streak = 0;

      if (progressDoc && progressDoc.problems) {
        const solvedProblems = progressDoc.problems.filter(p => {
          if (p.status !== 'solved') return false;
          if (startDate && p.solvedAt) {
            return new Date(p.solvedAt) >= startDate;
          }
          return !startDate;
        });
        solved = solvedProblems.length;

        // Calculate streak
        if (!startDate) {
          const dates = progressDoc.problems
            .filter(p => p.status === 'solved' && p.solvedAt)
            .map(p => new Date(p.solvedAt).toISOString().split('T')[0])
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort()
            .reverse();

          let currentStreak = 0;
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

          if (dates[0] === today || dates[0] === yesterday) {
            currentStreak = 1;
            for (let i = 1; i < dates.length; i++) {
              const d1 = new Date(dates[i - 1]);
              const d2 = new Date(dates[i]);
              const diff = (d1 - d2) / 86400000;
              if (diff === 1) {
                currentStreak++;
              } else {
                break;
              }
            }
          }
          streak = currentStreak;
        }
      }

      return {
        _id: user._id,
        name: user.name,
        username: user.username,
        solved,
        streak,
        joinedAt: user.createdAt
      };
    });

    // Sort by solved count
    leaderboard.sort((a, b) => b.solved - a.solved || b.streak - a.streak);

    // Add ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    const total = leaderboard.length;
    const paginatedData = leaderboard.slice(skip, skip + limit);

    res.json({
      leaderboard: paginatedData,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
