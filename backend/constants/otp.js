const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_LOCK_MS = 15 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_RESENDS = 3;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

const getOtpExpiryDate = () => new Date(Date.now() + OTP_EXPIRY_MS);

const isOtpExpired = (otpExpiry) => !otpExpiry || otpExpiry < new Date();

module.exports = {
  OTP_EXPIRY_MS,
  OTP_LOCK_MS,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_RESENDS,
  OTP_RESEND_COOLDOWN_MS,
  getOtpExpiryDate,
  isOtpExpired,
};
