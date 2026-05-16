const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a cryptographically secure 6-digit OTP
 * @returns {string} 6-digit OTP string
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash an OTP for secure storage in DB
 * Uses bcrypt with low salt rounds (6) since OTPs are short-lived
 * @param {string} otp - Plain text OTP
 * @returns {Promise<string>} Hashed OTP
 */
const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(6);
  return bcrypt.hash(otp, salt);
};

/**
 * Compare a plain text OTP against a hashed OTP
 * @param {string} plainOTP - User-submitted OTP
 * @param {string} hashedOTP - Hashed OTP from DB
 * @returns {Promise<boolean>} Whether OTPs match
 */
const compareOTP = async (plainOTP, hashedOTP) => {
  return bcrypt.compare(plainOTP, hashedOTP);
};

module.exports = { generateOTP, hashOTP, compareOTP };
