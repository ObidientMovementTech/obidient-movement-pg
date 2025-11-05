import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';
import { logger } from '../middlewares/security.middleware.js';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/onboarding/google/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  logger.warn('Google OAuth credentials not configured. OAuth features will be disabled.');
}

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      passReqToCallback: true, // Pass req to callback to access session data
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const { id: googleId, emails, displayName, photos } = profile;
        const email = emails?.[0]?.value;
        const photoUrl = photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email provided by Google'), null);
        }

        logger.info('Google OAuth callback received', {
          googleId,
          email,
          displayName,
        });

        // Return profile data to be handled in the route
        // We'll handle database operations in the controller
        return done(null, {
          googleId,
          email,
          displayName,
          photoUrl,
          accessToken,
          refreshToken,
        });
      } catch (error) {
        logger.error('Google OAuth strategy error', {
          error: error.message,
          stack: error.stack,
        });
        return done(error, null);
      }
    }
  )
);

// Serialize user (store user ID in session)
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user (retrieve user from session)
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
