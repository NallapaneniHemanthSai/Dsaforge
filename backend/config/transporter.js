const nodemailer = require('nodemailer');
const { env, isEmailConfigured } = require('./env');

let transporter = null;
let lastVerification = {
  ok: false,
  checkedAt: null,
  error: null,
};

const getTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: env.gmailUser,
        pass: env.gmailAppPassword,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    transporter.on('error', (error) => {
      console.error('❌ SMTP transporter error:', error.message);
      lastVerification.ok = false;
      lastVerification.error = error.message;
    });
  }

  return transporter;
};

const verifyTransporter = async () => {
  const transport = getTransporter();

  if (!transport) {
    lastVerification = {
      ok: false,
      checkedAt: new Date(),
      error: 'GMAIL_USER or GMAIL_APP_PASSWORD not set',
    };
    console.warn('⚠️  SMTP verification skipped — email credentials missing');
    return lastVerification;
  }

  try {
    await transport.verify();
    lastVerification = {
      ok: true,
      checkedAt: new Date(),
      error: null,
    };
    console.log('✅ SMTP transporter verified — Gmail ready to send');
    return lastVerification;
  } catch (error) {
    lastVerification = {
      ok: false,
      checkedAt: new Date(),
      error: error.message,
    };
    console.error('❌ SMTP verification failed:', error.message);
    console.error('   Verify 2-Step Verification + App Password for GMAIL_USER');
    return lastVerification;
  }
};

const getEmailStatus = () => ({
  configured: isEmailConfigured(),
  verified: lastVerification.ok,
  lastCheckedAt: lastVerification.checkedAt,
  lastError: lastVerification.error,
});

const closeTransporter = async () => {
  if (transporter) {
    transporter.close();
    transporter = null;
    console.log('📧 SMTP transporter closed');
  }
};

module.exports = {
  getTransporter,
  verifyTransporter,
  getEmailStatus,
  closeTransporter,
};
