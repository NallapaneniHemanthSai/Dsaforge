const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Notes = require('../models/Notes');
const { protect } = require('../middleware/auth');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  return null;
};

// ─── GET PROFILE ──────────────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -otp -resetToken -refreshToken');
  res.json({ user: user.toJSON() });
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────
router.patch('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('username').optional().trim()
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio').optional().isLength({ max: 150 }).withMessage('Bio cannot exceed 150 characters')
], async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const { name, username, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (username && username.toLowerCase() !== user.username) {
      const exists = await User.findOne({ username: username.toLowerCase() });
      if (exists) {
        return res.status(400).json({ message: 'Username already taken.' });
      }
      user.username = username.toLowerCase();
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    res.json({ message: 'Profile updated', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────
router.patch('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error('Passwords do not match');
    return true;
  })
], async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(req.body.currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    user.refreshToken = null; // Invalidate sessions
    await user.save();

    res.json({ message: 'Password changed successfully. Please login again.' });
  } catch (error) {
    next(error);
  }
});

// ─── UPDATE SETTINGS ──────────────────────────────────────────────────
router.patch('/settings', protect, async (req, res, next) => {
  try {
    const { theme, emailNotifications, judgeApiKey, weeklyGoal } = req.body;
    const user = await User.findById(req.user._id);

    if (theme && ['light', 'dark', 'system'].includes(theme)) user.theme = theme;
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (judgeApiKey !== undefined) user.judgeApiKey = judgeApiKey;
    if (weeklyGoal !== undefined) user.weeklyGoal = Math.max(1, Math.min(50, weeklyGoal));

    await user.save();
    res.json({ message: 'Settings saved', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE ACCOUNT ───────────────────────────────────────────────────
router.delete('/account', protect, [
  body('confirmation').equals('DELETE').withMessage('Please type DELETE to confirm')
], async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const user = await User.findById(req.user._id);
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.refreshToken = null;
    await user.save();

    res.clearCookie('refreshToken');
    res.json({ message: 'Account scheduled for deletion. Data will be wiped in 30 days.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
