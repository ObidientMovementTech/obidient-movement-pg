import express from 'express';
// import https from 'https';
// import fs from 'fs';
// import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import adminBroadcastRoutes from './routes/adminBroadcast.route.js';
import adminRoutes from './routes/admin.route.js';
import notificationRoutes from './routes/notification.route.js';
import evaluationRoutes from './routes/evaluation.route.js';
import kycRoutes from './routes/kyc.route.js';
import votingBlocRoutes from './routes/votingBloc.route.js';
import { verifyEmailConnection } from './config/email.js';

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';


// Middlewares
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '50mb' })); // Increase payload size limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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

// Placeholder route
app.get('/', (req, res) => {
  res.send('Recent ZeptoMail Obidient Movement API running...');
});

// PostgreSQL connection and server startup
connectDB().then(async () => {
  // Verify Email connection
  await verifyEmailConnection();
  // Development - use HTTP
  app.listen(PORT, () => console.log(`🌐 HTTP Server running on port ${PORT}`));
});
