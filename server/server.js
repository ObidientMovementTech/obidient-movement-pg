import express from 'express';
// import https from 'https';
// import fs from 'fs';
// import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
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
import { verifyEmailConnection } from './config/email.js';
import {
  helmetConfig,
  generalRateLimit,
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
app.use(generalRateLimit);
app.use(detectSuspiciousActivity);
app.use(sanitizeInput);
app.use(hpp());

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Basic middlewares
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' })); // Reduced from 50mb for security
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/admin-broadcasts', adminBroadcastRoutes);
app.use('/admin', adminRoutes);
app.use('/notifications', notificationRoutes);
app.use('/evaluation', evaluationRoutes)
app.use('/kyc', kycRoutes);
app.use('/voting-blocs', votingBlocRoutes);
app.use('/api', imageProxyRoutes); // Image proxy route
app.use('/state-dashboard', stateDashboardRoutes); // State Dashboard routes
app.use('/monitor-key', monitorKeyRoutes); // Monitor Key routes
app.use('/elections', electionRoutes); // Election Management routes

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
