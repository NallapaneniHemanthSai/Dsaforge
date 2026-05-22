const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Load and validate environment before any other app modules
const { env, validateEnv } = require('./config/env');
const { verifyTransporter, getEmailStatus, closeTransporter } = require('./config/transporter');
const { errorHandler } = require('./middleware/errorHandler');
const seedDemoAccounts = require('./scripts/seed');

const envStatus = validateEnv();
if (!envStatus.ok) {
  console.error('❌ Server startup aborted — fix missing .env variables above');
  process.exit(1);
}

const app = express();

app.use(helmet());
const allowedOrigins = [
  'http://localhost:5175',
  'https://dsaforge-five.vercel.app'
];
if (env.frontendUrl && !allowedOrigins.includes(env.frontendUrl)) {
  allowedOrigins.push(env.frontendUrl);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/programs', require('./routes/programs'));

app.get('/', (req, res) => {
  res.send('DSAForge Backend Running 🚀');
});

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const email = getEmailStatus();

  res.json({
    status: dbState === 1 ? 'ok' : 'degraded',
    message: 'DSAForge API is running ⚡',
    database: dbStates[dbState] || 'unknown',
    email: {
      configured: email.configured,
      verified: email.verified,
      lastError: email.lastError,
    },
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

let httpServer = null;
let isStarting = false;
let isShuttingDown = false;

const handleListenError = (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${env.port} is already in use (EADDRINUSE).`);
    console.error(`   Stop the other process: lsof -ti:${env.port} | xargs kill -9`);
    console.error('   Or change PORT in .env and restart.');
    process.exit(1);
  }

  console.error('❌ Server failed to start:', error.message);
  process.exit(1);
};

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
    console.log('✅ HTTP server closed');
  }

  await closeTransporter();
  await mongoose.connection.close(false);
  console.log('✅ MongoDB connection closed');
  process.exit(0);
};

const startServer = async () => {
  if (isStarting || httpServer) {
    console.warn('⚠️  startServer() called more than once — ignoring duplicate call');
    return httpServer;
  }

  isStarting = true;

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
    });
    console.log('✅ MongoDB connected');

    // Seed demo accounts
    await seedDemoAccounts();

    // Start transporter verification in the background so it doesn't block server startup
    verifyTransporter().catch(err => console.error('Transporter verification background error:', err));

    await new Promise((resolve, reject) => {
      httpServer = app.listen(env.port, () => {
        console.log(`⚡ DSAForge server running on http://localhost:${env.port}`);
        console.log(`   Frontend CORS origins: ${allowedOrigins.join(', ')}`);
        console.log(`   Environment: ${env.nodeEnv}`);
        resolve();
      });

      httpServer.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      handleListenError(error);
    } else {
      console.error('❌ Server startup failed:', error.message);
      process.exit(1);
    }
  } finally {
    isStarting = false;
  }

  return httpServer;
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  shutdown('uncaughtException');
});

if (require.main === module) {
  startServer().catch((error) => {
    console.error('❌ Fatal startup error:', error.message);
    process.exit(1);
  });
}

module.exports = { app, startServer };
