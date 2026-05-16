const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// ─── GET USER STATS ───────────────────────────────────────────────────
router.get('/me', protect, async (req, res, next) => {
  try {
    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user._id, problems: [] });
    }

    const problems = progress.problems || [];
    const solved = problems.filter(p => p.status === 'solved');
    const attempted = problems.filter(p => p.status === 'attempted');

    // ─── STREAK CALCULATION ─────────────────────────────────────
    const solvedDates = solved
      .filter(p => p.solvedAt)
      .map(p => new Date(p.solvedAt).toISOString().split('T')[0])
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort()
      .reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (solvedDates.length > 0 && (solvedDates[0] === today || solvedDates[0] === yesterday)) {
      currentStreak = 1;
      for (let i = 1; i < solvedDates.length; i++) {
        const d1 = new Date(solvedDates[i - 1]);
        const d2 = new Date(solvedDates[i]);
        const diff = (d1 - d2) / 86400000;
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    if (solvedDates.length > 0) {
      const sortedAsc = [...solvedDates].sort();
      let tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < sortedAsc.length; i++) {
        const d1 = new Date(sortedAsc[i - 1]);
        const d2 = new Date(sortedAsc[i]);
        const diff = (d2 - d1) / 86400000;
        if (diff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }

    // ─── HEATMAP DATA (last 52 weeks) ───────────────────────────
    const heatmapData = {};
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      heatmapData[key] = 0;
    }

    solved.forEach(p => {
      if (p.solvedAt) {
        const key = new Date(p.solvedAt).toISOString().split('T')[0];
        if (heatmapData[key] !== undefined) {
          heatmapData[key]++;
        }
      }
    });

    // ─── TOPIC BREAKDOWN ────────────────────────────────────────
    // This will be calculated on the frontend using the problems data
    // Here we just return the raw progress

    // ─── RECENT ACTIVITY ────────────────────────────────────────
    const recentActivity = problems
      .filter(p => p.updatedAt)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(p => ({
        problemId: p.problemId,
        status: p.status,
        updatedAt: p.updatedAt,
        solvedAt: p.solvedAt
      }));

    // ─── WEEKLY PROGRESS ────────────────────────────────────────
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const solvedThisWeek = solved.filter(p =>
      p.solvedAt && new Date(p.solvedAt) >= weekStart
    ).length;

    res.json({
      totalSolved: solved.length,
      totalAttempted: attempted.length,
      totalProblems: problems.length,
      currentStreak,
      longestStreak,
      heatmapData,
      recentActivity,
      solvedThisWeek,
      weeklyGoal: req.user.weeklyGoal || 7
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
