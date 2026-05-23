const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Notes = require('../models/Notes');
const { generateOTP, hashOTP, compareOTP } = require('../utils/generateOTP');
const { generateAccessToken, generateRefreshToken, generateResetToken } = require('../utils/generateToken');
const { sendOTPEmail, sendResetEmail, sendWelcomeEmail } = require('../services/emailService');
const { env } = require('../config/env');
const {
  OTP_LOCK_MS,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_RESENDS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_EXPIRY_MS,
  getOtpExpiryDate,
  isOtpExpired,
} = require('../constants/otp');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  return null;
};

const canReturnDevOtp = () => !env.isProduction;

const otpEmailFailureResponse = (res, email, otp, fallbackMessage) => {
  if (canReturnDevOtp()) {
    return res.status(200).json({
      message: `${fallbackMessage} SMTP delivery failed, so a development OTP is shown on the verification screen.`,
      email: email.toLowerCase(),
      devOtp: otp,
      emailDeliveryFailed: true,
    });
  }

  return res.status(503).json({
    message: fallbackMessage,
    email: email.toLowerCase(),
  });
};

exports.signup = async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const { name, username, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        // If user exists but not verified, allow re-signup
        if (!existingUser.isVerified) {
          const otp = generateOTP();
          const hashedOtp = await hashOTP(otp);

          existingUser.name = name;
          existingUser.username = username.toLowerCase();
          existingUser.password = password;
          existingUser.otp = hashedOtp;
          existingUser.otpExpiry = getOtpExpiryDate();
          existingUser.otpAttempts = 0;
          existingUser.otpResendCount = 0;
          existingUser.otpLockedUntil = null;
          await existingUser.save();

          // Send OTP email — handle SMTP failure gracefully
          try {
            await sendOTPEmail(email, name, otp);
          } catch (emailErr) {
            console.error('📧 OTP email failed during re-signup:', emailErr.message);
            return otpEmailFailureResponse(
              res,
              email,
              otp,
              'Account updated but failed to send OTP email. Please try resending OTP.'
            );
          }

          return res.status(200).json({
            message: 'OTP sent to your email',
            email: email.toLowerCase()
          });
        }
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }
      return res.status(400).json({ message: 'Username already taken.' });
    }

    // Create new user with hashed OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      otp: hashedOtp,
      otpExpiry: getOtpExpiryDate(),
      otpAttempts: 0,
      otpResendCount: 0
    });

    // Create progress and notes documents
    await Progress.create({ userId: user._id, problems: [] });
    await Notes.create({ userId: user._id, content: '' });

    // Send OTP email
    try {
      await sendOTPEmail(email, name, otp);
    } catch (emailErr) {
      console.error('📧 OTP email failed during signup:', emailErr.message);
      return otpEmailFailureResponse(
        res,
        email,
        otp,
        'Account created but failed to send OTP email. Please try resending OTP.'
      );
    }

    res.status(201).json({
      message: 'Account created! OTP sent to your email.',
      email: email.toLowerCase()
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check if locked due to too many failed attempts
    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const remainingMs = user.otpLockedUntil - new Date();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(429).json({
        message: `Too many failed attempts. Try again in ${remainingMin} minutes.`,
        lockedUntil: user.otpLockedUntil
      });
    }

    // Check OTP expiry
    if (!user.otp || isOtpExpired(user.otpExpiry)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Compare submitted OTP against hashed OTP in DB
    const isOtpValid = await compareOTP(otp, user.otp);
    if (!isOtpValid) {
      user.otpAttempts += 1;

      if (user.otpAttempts >= 5) {
        user.otpLockedUntil = new Date(Date.now() + OTP_LOCK_MS);
        user.otpAttempts = 0;
        await user.save();
        return res.status(429).json({
          message: 'Too many failed attempts. Account locked for 15 minutes.',
          lockedUntil: user.otpLockedUntil
        });
      }

      await user.save();
      return res.status(400).json({
        message: `Incorrect OTP. ${5 - user.otpAttempts} attempts remaining.`,
        attemptsRemaining: 5 - user.otpAttempts
      });
    }

    // OTP correct — verify user
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpResendCount = 0;
    user.otpLockedUntil = null;

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    // Send welcome email (non-blocking — don't fail verification if this fails)
    try {
      await sendWelcomeEmail(user.email, user.name, user.username);
    } catch (emailErr) {
      console.error('📧 Welcome email failed:', emailErr.message);
    }

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Email verified successfully!',
      accessToken,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check per-user resend limit (max 3 resends per signup cycle)
    if (user.otpResendCount >= OTP_MAX_RESENDS) {
      return res.status(429).json({ message: 'Maximum resend limit reached. Please try signing up again later.' });
    }

    // Check if account is locked due to failed verification attempts
    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const remainingMs = user.otpLockedUntil - new Date();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(429).json({
        message: `Account locked. Try again in ${remainingMin} minutes.`
      });
    }

    // Prevent rapid-fire resends: require 60s between resends
    if (user.otpExpiry) {
      const otpCreatedAt = new Date(user.otpExpiry.getTime() - OTP_EXPIRY_MS);
      const secondsSinceLastOtp = (Date.now() - otpCreatedAt.getTime()) / 1000;
      if (secondsSinceLastOtp < OTP_RESEND_COOLDOWN_MS / 1000) {
        const waitSeconds = Math.ceil(60 - secondsSinceLastOtp);
        return res.status(429).json({
          message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`
        });
      }
    }

    // Generate new OTP, hash it, and update user
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    user.otp = hashedOtp;
    user.otpExpiry = getOtpExpiryDate();
    user.otpAttempts = 0;
    user.otpResendCount += 1;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(user.email, user.name, otp);
    } catch (emailErr) {
      console.error('📧 OTP resend email failed:', emailErr.message);
      if (canReturnDevOtp()) {
        return res.json({
          message: 'SMTP delivery failed, so a development OTP is shown on the verification screen.',
          resendsRemaining: OTP_MAX_RESENDS - user.otpResendCount,
          devOtp: otp,
          emailDeliveryFailed: true,
        });
      }
      return res.status(503).json({
        message: 'Failed to send OTP email. Please try again later.'
      });
    }

    res.json({
      message: 'New OTP sent to your email',
      resendsRemaining: OTP_MAX_RESENDS - user.otpResendCount
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isDeleted) {
      return res.status(401).json({ message: 'This account has been deleted' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If user hasn't verified email, resend OTP automatically
    if (!user.isVerified) {
      // Only auto-resend if there's no valid OTP already or it has expired
      const needsNewOtp = !user.otp || isOtpExpired(user.otpExpiry);

      if (needsNewOtp) {
        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        user.otp = hashedOtp;
        user.otpExpiry = getOtpExpiryDate();
        user.otpAttempts = 0;
        // Don't reset otpResendCount here — this is an auto-resend from login
        await user.save();

        let devOtp = null;
        try {
          await sendOTPEmail(user.email, user.name, otp);
        } catch (emailErr) {
          console.error('📧 Login auto-resend OTP email failed:', emailErr.message);
          if (canReturnDevOtp()) {
            devOtp = otp;
          }
        }

        if (devOtp) {
          return res.status(403).json({
            message: 'Please verify your email first. SMTP delivery failed, so a development OTP is shown on the verification screen.',
            needsVerification: true,
            email: user.email,
            devOtp,
            emailDeliveryFailed: true,
          });
        }
      }

      return res.status(403).json({
        message: 'Please verify your email first. A new OTP has been sent.',
        needsVerification: true,
        email: user.email
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id, rememberMe);
    user.refreshToken = refreshToken;
    await user.save();

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'none' : 'lax',
      maxAge
    });

    res.json({
      message: 'Login successful',
      accessToken,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Rotate refresh token
    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      } catch (err) {
        // Token invalid, just clear cookie
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'none' : 'lax'
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    const resetToken = generateResetToken();
    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendResetEmail(user.email, user.name, resetToken);
    } catch (emailErr) {
      console.error('📧 Reset email failed:', emailErr.message);
      // Still return generic message to prevent enumeration
    }

    res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.refreshToken = null;
    await user.save();

    res.json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user.toJSON() });
};

exports.checkUsername = async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username || username.length < 3) {
      return res.json({ available: false });
    }

    const exists = await User.findOne({ username: username.toLowerCase() });
    res.json({ available: !exists });
  } catch (error) {
    next(error);
  }
};
