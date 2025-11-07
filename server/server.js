import express from 'express';
// import https from 'https';
// import fs from 'fs';
// import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectDB from './config/db.js';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
import passport from './config/passport.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import adminBroadcastRoutes from './routes/adminBroadcast.route.js';
import adminRoutes from './routes/admin.route.js';
import notificationRoutes from './routes/notification.route.js';
import evaluationRoutes from './routes/evaluation.route.js';
import kycRoutes from './routes/kyc.route.js';
import votingBlocRoutes from './routes/votingBloc.route.js';
import imageProxyRoutes from './routes/imageProxy.route.js';
import stateDashboardRoutes from './routes/stateDashboard.routes.js';
import monitorKeyRoutes from './routes/monitorKey.route.js';
import electionRoutes from './routes/election.routes.js';
import electionResultsRoutes from './routes/electionResults.routes.js';
import partyRoutes from './routes/party.route.js';
import electionPartyRoutes from './routes/electionParty.route.js';
import monitoringRoutes from './routes/monitoring.route.js';
import situationRoomRoutes from './routes/situationRoom.route.js';
import mobileRoutes from './routes/mobile.route.js';
import mobiliseDashboardRoutes from './routes/mobiliseDashboard.routes.js';
import callCenterRoutes from './routes/callCenter.routes.js';
import inecVotersRoutes from './routes/inecVoters.routes.js';
import communicationsRoutes from './routes/communications.routes.js';
import locationRoutes from './routes/location.routes.js';
import onboardingRoutes from './routes/onboarding.routes.js';
import liveResultsRoutes from './routes/liveResults.route.js';
import resultsDashboardRoutes from './routes/resultsDashboard.route.js';
import { verifyEmailConnection } from './config/email.js';
import {
  helmetConfig,
  // generalRateLimit,
  sanitizeInput,
  requestLogger,
  detectSuspiciousActivity,
  logger
} from './middlewares/security.middleware.js';

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security middlewares (applied first)
app.use(helmetConfig);
app.use(compression());
app.use(requestLogger);
// app.use(generalRateLimit);
app.use(detectSuspiciousActivity);
app.use(sanitizeInput);
app.use(hpp());

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Basic middlewares
app.use(cors({
  origin: [
    CLIENT_URL,
    'http://192.168.0.111:8081', // Metro bundler for mobile development
    'http://localhost:8081',      // Metro bundler localhost
    'http://10.0.2.2:8081'        // Metro bundler for emulator
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Onboarding-Token']
}));
app.use(express.json({ limit: '10mb' })); // Reduced from 50mb for security
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Session middleware (for OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/admin-broadcasts', adminBroadcastRoutes);
app.use('/admin', adminRoutes);
app.use('/notifications', notificationRoutes);
app.use('/evaluation', evaluationRoutes);
app.use('/kyc', kycRoutes);
app.use('/voting-blocs', votingBlocRoutes);
app.use('/api', imageProxyRoutes); // Image proxy route
app.use('/state-dashboard', stateDashboardRoutes); // State Dashboard routes
app.use('/mobilise-dashboard', mobiliseDashboardRoutes); // Mobilise Dashboard routes
app.use('/monitor-key', monitorKeyRoutes); // Monitor Key routes
app.use('/elections', electionPartyRoutes); // Election-Party linking (MUST come BEFORE electionRoutes)
app.use('/elections', electionRoutes); // Election Management routes
app.use('/election-results', electionResultsRoutes); // Election Results (Live) routes
app.use('/api/parties', partyRoutes); // Political Parties management
app.use('/monitoring', monitoringRoutes); // Vote Protection monitoring routes
app.use('/mobile', mobileRoutes); // Mobile App API routes
app.use('/call-center', callCenterRoutes); // Call Center routes
app.use('/api/inec-voters', inecVotersRoutes); // INEC Voters API - Scalable data access
app.use('/api/communications', communicationsRoutes); // Bulk communications (SMS & Voice)
app.use('/api/locations', locationRoutes); // Location data (States & LGAs)
app.use('/api/live-results', liveResultsRoutes); // Live election results with caching
app.use('/api/results-dashboard', resultsDashboardRoutes); // Results Dashboard - Hierarchical results view
app.use('/api/situation-room', situationRoomRoutes); // Admin Situation Room - Comprehensive monitoring
app.use('/auth/onboarding', onboardingRoutes); // Onboarding system with Google OAuth

// Placeholder route
app.get('/', (req, res) => {
  res.send('Recent ZeptoMail Obidient Movement API running...');
});

// PostgreSQL connection and server startup
connectDB().then(async () => {
  // Verify Email connection
  await verifyEmailConnection();

  // Log server startup
  logger.info('Server starting up', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    clientUrl: CLIENT_URL,
    timestamp: new Date().toISOString()
  });

  // Development - use HTTP
  app.listen(PORT, () => {
    console.log(`🌐 HTTP Server running on port ${PORT}`);
    logger.info(`Server successfully started on port ${PORT}`);
  });
}).catch((error) => {
  logger.error('Server startup failed', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  console.error('Failed to start server:', error);
  process.exit(1);
});
