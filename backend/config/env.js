const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Failed to load .env:', result.error.message);
  } else {
    console.log(`✅ Environment loaded from ${envPath}`);
  }
} else {
  console.warn(`⚠️  No .env file found at ${envPath} — using process environment only`);
  dotenv.config();
}

const trim = (value) => (typeof value === 'string' ? value.trim() : '');

const getEnv = (key, fallback = '') => trim(process.env[key] || fallback);

const isNonEmpty = (value) => Boolean(value && value.length > 0);

const REQUIRED_SERVER_VARS = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const EMAIL_VARS = ['GMAIL_USER', 'GMAIL_APP_PASSWORD'];

const validateEnv = () => {
  const missingServer = REQUIRED_SERVER_VARS.filter((key) => !isNonEmpty(getEnv(key)));
  const missingEmail = EMAIL_VARS.filter((key) => !isNonEmpty(getEnv(key)));

  if (missingServer.length > 0) {
    console.error('❌ Missing required server environment variables:', missingServer.join(', '));
    console.error('   The API cannot start without these values in .env');
  } else {
    console.log('✅ Core server environment variables present');
  }

  const emailConfigured = missingEmail.length === 0;

  if (!emailConfigured) {
    console.error('❌ EMAIL CONFIG MISSING: Set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
    console.error(`   Missing: ${missingEmail.join(', ')}`);
    console.error('   OTP and password-reset emails will fail until Gmail App Password is configured.');
    console.error('   See .env.example for setup steps.');
  } else {
    console.log(`✅ Email config present (GMAIL_USER=${getEnv('GMAIL_USER')})`);
  }

  return {
    ok: missingServer.length === 0,
    emailConfigured,
    missingServer,
    missingEmail,
  };
};

const env = {
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: Number(getEnv('PORT', '5000')) || 5000,
  mongoUri: getEnv('MONGO_URI'),
  jwtAccessSecret: getEnv('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: getEnv('JWT_REFRESH_SECRET'),
  frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:5175'),
  gmailUser: getEnv('GMAIL_USER'),
  gmailAppPassword: getEnv('GMAIL_APP_PASSWORD'),
  isProduction: getEnv('NODE_ENV', 'development') === 'production',
};

module.exports = {
  envPath,
  getEnv,
  validateEnv,
  env,
  isEmailConfigured: () => isNonEmpty(env.gmailUser) && isNonEmpty(env.gmailAppPassword),
};
