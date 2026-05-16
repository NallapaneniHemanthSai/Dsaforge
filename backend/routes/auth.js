const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { authLimiter, otpResendLimiter } = require('../middleware/rateLimit');
const authController = require('../controllers/authController');

router.post('/signup', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email address')
    .matches(/@(kluniversity\.in|klu\.ac\.in)$/).withMessage('Only KL University email addresses are allowed.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
], authController.signup);

router.post('/verify-otp', authLimiter, [
  body('email').trim().isEmail().withMessage('Invalid email'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], authController.verifyOtp);

router.post('/resend-otp', otpResendLimiter, [
  body('email').trim().isEmail().withMessage('Invalid email'),
], authController.resendOtp);

router.post('/login', authLimiter, [
  body('email').trim().isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
], authController.login);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.post('/forgot-password', authLimiter, [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email')
    .matches(/@(kluniversity\.in|klu\.ac\.in)$/).withMessage('Only KL University emails are allowed'),
], authController.forgotPassword);

router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
], authController.resetPassword);

router.get('/me', protect, authController.getMe);
router.get('/check-username', authController.checkUsername);

module.exports = router;
