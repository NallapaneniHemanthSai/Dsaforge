const { env, isEmailConfigured } = require('../config/env');
const { getTransporter } = require('../config/transporter');

// ─── Base HTML styles & components ────────────────────────────────────
const baseStyles = `
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;

const headerHTML = `
  <div style="background: linear-gradient(135deg, #6C63FF 0%, #5A54D6 100%); padding: 32px; text-align: center;">
    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
      ⚡ DSAForge
    </h1>
    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
      Forge your DSA skills. One problem at a time.
    </p>
  </div>
`;

const footerHTML = `
  <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">
      This is an automated email from DSAForge. Please do not reply.
    </p>
    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
      Created with ♥ by nallapanenihemanthsai
    </p>
    <p style="margin: 8px 0 0; color: #cbd5e1; font-size: 11px;">
      © ${new Date().getFullYear()} DSAForge. All rights reserved.
    </p>
  </div>
`;

// ─── OTP Verification Email Template ──────────────────────────────────
const otpEmailTemplate = (name, otp) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9; ${baseStyles.replace('max-width: 600px; margin: 0 auto;', '')}">
  <div style="${baseStyles}">
    ${headerHTML}
    <div style="padding: 40px 32px;">
      <h2 style="margin: 0 0 8px; color: #1a1a2e; font-size: 22px; font-weight: 600;">
        Verify Your Email
      </h2>
      <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6;">
        Hey ${name}! 👋 Use the OTP below to verify your email address and activate your DSAForge account.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #f0efff 0%, #e8e6ff 100%); border: 2px solid #6C63FF; border-radius: 12px; padding: 20px 32px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #6C63FF; font-family: 'Courier New', monospace;">
            ${otp}
          </span>
        </div>
      </div>

      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
          ⏰ This OTP expires in 10 minutes
        </p>
      </div>

      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0 0;">
        <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
          🔒 Do not share this OTP with anyone
        </p>
      </div>

      <p style="margin: 32px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
        If you didn't create a DSAForge account, you can safely ignore this email.
      </p>
    </div>
    ${footerHTML}
  </div>
</body>
</html>
`;

// ─── Password Reset Email Template ────────────────────────────────────
const resetEmailTemplate = (name, resetUrl) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9;">
  <div style="${baseStyles}">
    ${headerHTML}
    <div style="padding: 40px 32px;">
      <h2 style="margin: 0 0 8px; color: #1a1a2e; font-size: 22px; font-weight: 600;">
        Reset Your Password
      </h2>
      <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6;">
        Hey ${name}, we received a request to reset your password. Click the button below to create a new password.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6C63FF 0%, #5A54D6 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 10px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(108,99,255,0.35);">
          Reset Password
        </a>
      </div>

      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
          ⏰ This link expires in 1 hour
        </p>
      </div>

      <p style="margin: 24px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
        If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
      </p>

      <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px; word-break: break-all;">
          Button not working? Copy this link: ${resetUrl}
        </p>
      </div>
    </div>
    ${footerHTML}
  </div>
</body>
</html>
`;

// ─── Welcome Email Template ───────────────────────────────────────────
const welcomeEmailTemplate = (name, username) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9;">
  <div style="${baseStyles}">
    ${headerHTML}
    <div style="padding: 40px 32px;">
      <h2 style="margin: 0 0 8px; color: #1a1a2e; font-size: 22px; font-weight: 600;">
        Welcome to DSAForge! 🎉
      </h2>
      <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6;">
        Hey ${name} (@${username}), your account has been verified successfully. You're all set to start forging your DSA skills!
      </p>
      
      <h3 style="margin: 32px 0 16px; color: #1a1a2e; font-size: 18px; font-weight: 600;">
        🚀 Quick Start Guide
      </h3>

      <div style="margin-bottom: 16px;">
        <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
          <div style="min-width: 32px; height: 32px; background: linear-gradient(135deg, #6C63FF, #5A54D6); border-radius: 50%; color: white; text-align: center; line-height: 32px; font-weight: 700; font-size: 14px; margin-right: 16px;">1</div>
          <div>
            <p style="margin: 0; color: #1a1a2e; font-size: 15px; font-weight: 600;">Browse 150+ DSA Problems</p>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Explore curated sheets from Striver, NeetCode, Blind 75, and more.</p>
          </div>
        </div>
        <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
          <div style="min-width: 32px; height: 32px; background: linear-gradient(135deg, #6C63FF, #5A54D6); border-radius: 50%; color: white; text-align: center; line-height: 32px; font-weight: 700; font-size: 14px; margin-right: 16px;">2</div>
          <div>
            <p style="margin: 0; color: #1a1a2e; font-size: 15px; font-weight: 600;">Write & Run Java Code</p>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Use our built-in Monaco editor with real Judge0 code execution.</p>
          </div>
        </div>
        <div style="display: flex; align-items: flex-start;">
          <div style="min-width: 32px; height: 32px; background: linear-gradient(135deg, #6C63FF, #5A54D6); border-radius: 50%; color: white; text-align: center; line-height: 32px; font-weight: 700; font-size: 14px; margin-right: 16px;">3</div>
          <div>
            <p style="margin: 0; color: #1a1a2e; font-size: 15px; font-weight: 600;">Track Progress & Streaks</p>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Visual dashboards, heatmaps, and daily streaks keep you motivated.</p>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${env.frontendUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6C63FF 0%, #5A54D6 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(108,99,255,0.35);">
          Go to Dashboard →
        </a>
      </div>
    </div>
    ${footerHTML}
  </div>
</body>
</html>
`;

// ─── Core email sender with error handling ────────────────────────────
const sendEmail = async (mailOptions) => {
  if (!isEmailConfigured()) {
    const err = new Error('Email service not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
    err.code = 'EMAIL_NOT_CONFIGURED';
    err.statusCode = 503;
    throw err;
  }

  const transporter = getTransporter();
  if (!transporter) {
    const err = new Error('Email transporter unavailable');
    err.code = 'EMAIL_NOT_CONFIGURED';
    err.statusCode = 503;
    throw err;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${mailOptions.to} | subject="${mailOptions.subject}" | messageId=${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email send failed to ${mailOptions.to}:`, error.message);
    if (error.response) {
      console.error('   SMTP response:', error.response);
    }
    const err = new Error('Failed to send email. Please try again later.');
    err.code = 'EMAIL_SEND_FAILED';
    err.statusCode = 503;
    err.originalError = error;
    throw err;
  }
};

// ─── Public email functions ───────────────────────────────────────────

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} name - User's display name
 * @param {string} otp - Plain text OTP (hashed version stored in DB, plain sent to user)
 */
const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"DSAForge ⚡" <${env.gmailUser}>`,
    to: email,
    subject: 'DSAForge — Email Verification OTP',
    html: otpEmailTemplate(name, otp),
  };
  return sendEmail(mailOptions);
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} name - User's display name
 * @param {string} resetToken - Plain text reset token
 */
const sendResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${env.frontendUrl}/reset-password/${resetToken}`;
  const mailOptions = {
    from: `"DSAForge ⚡" <${env.gmailUser}>`,
    to: email,
    subject: 'DSAForge — Reset Your Password',
    html: resetEmailTemplate(name, resetUrl),
  };
  return sendEmail(mailOptions);
};

/**
 * Send welcome email after verification
 * @param {string} email - Recipient email
 * @param {string} name - User's display name
 * @param {string} username - User's username
 */
const sendWelcomeEmail = async (email, name, username) => {
  const mailOptions = {
    from: `"DSAForge ⚡" <${env.gmailUser}>`,
    to: email,
    subject: `Welcome to DSAForge, ${name}! ⚡`,
    html: welcomeEmailTemplate(name, username),
  };
  return sendEmail(mailOptions);
};

module.exports = { sendOTPEmail, sendResetEmail, sendWelcomeEmail };
