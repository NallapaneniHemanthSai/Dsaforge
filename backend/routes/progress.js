const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// ─── GET ALL PROGRESS ─────────────────────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user._id, problems: [] });
    }
    res.json({ progress: progress.problems });
  } catch (error) {
    next(error);
  }
});

// ─── UPDATE PROBLEM STATUS ────────────────────────────────────────────
router.patch('/:problemId/status', protect, async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const { status } = req.body;

    if (!['unsolved', 'attempted', 'solved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user._id, problems: [] });
    }

    const problemIndex = progress.problems.findIndex(p => p.problemId === problemId);
    const now = new Date();

    if (problemIndex >= 0) {
      progress.problems[problemIndex].status = status;
      progress.problems[problemIndex].updatedAt = now;
      if (status === 'solved' && !progress.problems[problemIndex].solvedAt) {
        progress.problems[problemIndex].solvedAt = now;
      }
    } else {
      progress.problems.push({
        problemId,
        status,
        code: '',
        note: '',
        bookmarked: false,
        solvedAt: status === 'solved' ? now : null,
        updatedAt: now
      });
    }

    await progress.save();
    res.json({ message: 'Status updated', problem: progress.problems.find(p => p.problemId === problemId) });
  } catch (error) {
    next(error);
  }
});

// ─── SAVE CODE ────────────────────────────────────────────────────────
router.patch('/:problemId/code', protect, async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const { code } = req.body;

    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user._id, problems: [] });
    }

    const problemIndex = progress.problems.findIndex(p => p.problemId === problemId);

    if (problemIndex >= 0) {
      progress.problems[problemIndex].code = code;
      progress.problems[problemIndex].updatedAt = new Date();
    } else {
      progress.problems.push({
        problemId,
        status: 'attempted',
        code,
        note: '',
        bookmarked: false,
        solvedAt: null,
        updatedAt: new Date()
      });
    }

    await progress.save();
    res.json({ message: 'Code saved' });
  } catch (error) {
    next(error);
  }
});

// ─── SAVE NOTE ────────────────────────────────────────────────────────
router.patch('/:problemId/note', protect, async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const { note } = req.body;

    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user._id, problems: [] });
    }

    const problemIndex = progress.problems.findIndex(p => p.problemId === problemId);

    if (problemIndex >= 0) {
      progress.problems[problemIndex].note = note;
      progress.problems[problemIndex].updatedAt = new Date();
    } else {
      progress.problems.push({
        problemId,
        status: 'unsolved',
        code: '',
        note,
        bookmarked: false,
        solvedAt: null,
        updatedAt: new Date()
      });
    }

    await progress.save();
    res.json({ message: 'Note saved' });
  } catch (error) {
    next(error);
  }
});

// ─── TOGGLE BOOKMARK ─────────────────────────────────────────────────
router.patch('/:problemId/bookmark', protect, async (req, res, next) => {
  try {
    const { problemId } = req.params;

    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user._id, problems: [] });
    }

    const problemIndex = progress.problems.findIndex(p => p.problemId === problemId);

    if (problemIndex >= 0) {
      progress.problems[problemIndex].bookmarked = !progress.problems[problemIndex].bookmarked;
      progress.problems[problemIndex].updatedAt = new Date();
    } else {
      progress.problems.push({
        problemId,
        status: 'unsolved',
        code: '',
        note: '',
        bookmarked: true,
        solvedAt: null,
        updatedAt: new Date()
      });
    }

    await progress.save();
    const problem = progress.problems.find(p => p.problemId === problemId);
    res.json({ message: 'Bookmark toggled', bookmarked: problem.bookmarked });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
