import { pool } from '../config/db.js';
import { logger } from '../middlewares/security.middleware.js';
import { normalizePhoneNumber, isValidNigerianPhone, getLocalPhone } from '../utils/phoneUtils.js';
import {
  generateOnboardingToken,
  verifyOnboardingToken as verifyToken,
  generateOnboardingUrl,
  generateShortCode,
  generateShortOnboardingUrl,
  VALID_DESIGNATIONS,
} from '../utils/onboardingTokenUtils.js';
import { v4 as uuidv4 } from 'uuid';
import { isValidSupportGroup } from '../config/supportGroups.js';
import { uploadBufferToS3 } from '../utils/s3Upload.js';
import jwt from 'jsonwebtoken';
import { assignAutoKey } from '../services/monitorKeyAutoAssignService.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const buildPhoneDetails = (rawPhone) => {
  if (!rawPhone) {
    return { normalized: null, local: null, variants: [] };
  }

  const cleaned = String(rawPhone).trim();
  const normalized = normalizePhoneNumber(cleaned);
  const local = getLocalPhone(cleaned) || null;
  const digitsOnly = cleaned.replace(/\D/g, '');

  const variants = new Set();

  if (normalized) {
    variants.add(normalized);
    variants.add(normalized.replace('+', ''));
  }

  if (local) {
    variants.add(local);
  }

  if (digitsOnly) {
    variants.add(digitsOnly);

    if (digitsOnly.length === 13 && digitsOnly.startsWith('234')) {
      variants.add(`+${digitsOnly}`);
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
      variants.add(`234${digitsOnly.substring(1)}`);
      variants.add(`+234${digitsOnly.substring(1)}`);
    } else if (digitsOnly.length === 10) {
      variants.add(`0${digitsOnly}`);
      variants.add(`234${digitsOnly}`);
      variants.add(`+234${digitsOnly}`);
    }
  }

  return {
    normalized,
    local,
    variants: Array.from(variants).filter(Boolean),
  };
};

// ==================== ADMIN CONTROLLERS ====================

/**
 * Create onboarding token (Admin only)
 * POST /auth/onboarding/tokens/create
 */
export const createOnboardingToken = async (req, res) => {
  const client = await pool.connect();
  try {
    const { designation, expiresIn = '90d', maxUses = null, notes = '' } = req.body;
    const createdBy = req.user.userId;

    // Validate designation
    if (!VALID_DESIGNATIONS.includes(designation)) {
      return res.status(400).json({
        success: false,
        message: `Invalid designation. Must be one of: ${VALID_DESIGNATIONS.join(', ')}`,
      });
    }

    const expiryMap = {
      '7d': 7, '30d': 30, '90d': 90, '180d': 180, '365d': 365,
    };
    const days = expiryMap[expiresIn] || 90;

    // Generate stable UUID so token payload can reference row id
    const tokenId = uuidv4();

    // Generate unique token payload using shared utility to keep secrets aligned
    const token = generateOnboardingToken({
      designation,
      tokenId,
      expiresIn: days,
    });

    // Generate short code for easy sharing
    let shortCode = generateShortCode();

    // Ensure uniqueness (very unlikely to collide, but check anyway)
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const existing = await client.query(
        'SELECT id FROM onboarding_tokens WHERE short_code = $1',
        [shortCode]
      );
      if (existing.rows.length === 0) {
        isUnique = true;
      } else {
        shortCode = generateShortCode();
        attempts++;
      }
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // Insert into database with short_code
    const result = await client.query(
      `INSERT INTO onboarding_tokens 
        (id, token, short_code, designation, created_by, expires_at, max_uses, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, token, short_code, designation, created_at, expires_at, max_uses, current_uses, is_active`,
      [tokenId, token, shortCode, designation, createdBy, expiresAt, maxUses, notes]
    );

    const tokenRecord = result.rows[0];
    const url = generateOnboardingUrl(token);
    const shortUrl = generateShortOnboardingUrl(shortCode);

    logger.info('Onboarding token created', {
      tokenId: tokenRecord.id,
      designation,
      createdBy,
      expiresAt,
      shortCode,
    });

    res.status(201).json({
      success: true,
      message: 'Onboarding token created successfully',
      data: {
        ...tokenRecord,
        url,
        shortUrl,
      },
    });
  } catch (error) {
    logger.error('Error creating onboarding token', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create onboarding token',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * Get onboarding token information without starting the flow
 * GET /auth/onboarding/token-info
 */
export const getOnboardingTokenInfo = (req, res) => {
  try {
    if (!req.onboardingToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid onboarding token',
      });
    }

    const { designation, token } = req.onboardingToken;

    res.json({
      success: true,
      data: {
        designation,
        token,
      },
    });
  } catch (error) {
    logger.error('Error fetching onboarding token info', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch onboarding token info',
      error: error.message,
    });
  }
};

/**
 * Get onboarding statistics
 * GET /auth/onboarding/stats
 */
export const getOnboardingStats = async (req, res) => {
  const client = await pool.connect();
  try {
    const { state, lga, ward, supportGroup, startDate, endDate } = req.query;

    const params = [];
    let paramIndex = 1;

    const normalizedStateExpr = `NULLIF(TRIM("votingState"), '')`;
    const normalizedLgaExpr = `NULLIF(TRIM("votingLGA"), '')`;
    const normalizedWardExpr = `NULLIF(TRIM("votingWard"), '')`;
    const normalizedPuExpr = `NULLIF(TRIM("votingPU"), '')`;
    const normalizedSupportGroupExpr = `NULLIF(TRIM(support_group), '')`;

    let query = `
      SELECT 
        COUNT(*)::int as total_onboarded,
        COUNT(CASE WHEN designation = 'Polling Unit Agent' THEN 1 END)::int as pu_agents,
        COUNT(CASE WHEN designation = 'Ward Coordinator' THEN 1 END)::int as ward_coordinators,
        COUNT(CASE WHEN designation = 'LGA Coordinator' THEN 1 END)::int as lga_coordinators,
        COUNT(CASE WHEN designation = 'State Coordinator' THEN 1 END)::int as state_coordinators,
        COUNT(DISTINCT ${normalizedSupportGroupExpr})::int as unique_support_groups,
        COUNT(CASE WHEN oauth_provider = 'google' THEN 1 END)::int as google_oauth_users,
        COUNT(CASE WHEN last_login_at IS NOT NULL THEN 1 END)::int as active_users,
        COUNT(CASE WHEN designation = 'Polling Unit Agent'
          AND ${normalizedStateExpr} IS NOT NULL
          AND ${normalizedLgaExpr} IS NOT NULL
          AND ${normalizedWardExpr} IS NOT NULL
          AND ${normalizedPuExpr} IS NOT NULL
        THEN 1 END)::int as completed_pu_agents,
        COUNT(CASE WHEN designation = 'Polling Unit Agent'
          AND (
            ${normalizedStateExpr} IS NULL OR
            ${normalizedLgaExpr} IS NULL OR
            ${normalizedWardExpr} IS NULL OR
            ${normalizedPuExpr} IS NULL
          )
        THEN 1 END)::int as pending_pu_agents
      FROM users 
      WHERE designation IN ('Polling Unit Agent', 'Ward Coordinator', 'LGA Coordinator', 'State Coordinator')
    `;

    if (state) {
      query += ` AND UPPER(TRIM("votingState")) = UPPER(TRIM($${paramIndex}))`;
      params.push(state);
      paramIndex++;
    }

    if (lga) {
      query += ` AND UPPER(TRIM("votingLGA")) = UPPER(TRIM($${paramIndex}))`;
      params.push(lga);
      paramIndex++;
    }

    if (ward) {
      query += ` AND UPPER(TRIM("votingWard")) = UPPER(TRIM($${paramIndex}))`;
      params.push(ward);
      paramIndex++;
    }

    if (supportGroup) {
      query += ` AND LOWER(TRIM(support_group)) = LOWER(TRIM($${paramIndex}))`;
      params.push(supportGroup);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND "createdAt" >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND "createdAt" <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    const statsResult = await client.query(query, params);

    const coverageConditions = [
      `designation = 'Polling Unit Agent'`,
      `${normalizedPuExpr} IS NOT NULL`
    ];
    const coverageParams = [];
    let coverageIndex = 1;

    if (state) {
      coverageConditions.push(`UPPER(TRIM("votingState")) = UPPER(TRIM($${coverageIndex}))`);
      coverageParams.push(state);
      coverageIndex++;
    }

    if (lga) {
      coverageConditions.push(`UPPER(TRIM("votingLGA")) = UPPER(TRIM($${coverageIndex}))`);
      coverageParams.push(lga);
      coverageIndex++;
    }

    if (ward) {
      coverageConditions.push(`UPPER(TRIM("votingWard")) = UPPER(TRIM($${coverageIndex}))`);
      coverageParams.push(ward);
      coverageIndex++;
    }

    if (supportGroup) {
      coverageConditions.push(`LOWER(TRIM(support_group)) = LOWER(TRIM($${coverageIndex}))`);
      coverageParams.push(supportGroup);
      coverageIndex++;
    }

    const coverageQuery = `
      SELECT 
        UPPER(TRIM("votingState")) as "votingState",
        UPPER(TRIM("votingLGA")) as "votingLGA",
        UPPER(TRIM("votingWard")) as "votingWard",
        UPPER(TRIM("votingPU")) as "votingPU",
        COUNT(*)::int as agent_count,
        COUNT(DISTINCT LOWER(TRIM(support_group)))::int as support_group_count,
        array_remove(array_agg(DISTINCT ${normalizedSupportGroupExpr}), NULL) as support_groups
      FROM users
      WHERE ${coverageConditions.join('\n        AND ')}
      GROUP BY 1, 2, 3, 4
      ORDER BY agent_count DESC, "votingState", "votingLGA", "votingWard", "votingPU"
      LIMIT 500
    `;

    const coverageResult = await client.query(
      coverageQuery,
      coverageParams
    );

    // Get active tokens
    const tokensQuery = `
      SELECT 
        id,
        token,
        short_code,
        designation,
        created_at,
        expires_at,
        max_uses,
        current_uses,
        is_active,
        notes
      FROM onboarding_tokens
      WHERE is_active = true 
        AND (expires_at > NOW() OR expires_at IS NULL)
        AND (max_uses IS NULL OR current_uses < max_uses)
      ORDER BY created_at DESC
    `;

    const tokensResult = await client.query(tokensQuery);
    const activeTokens = tokensResult.rows.map(({ token, ...tokenRow }) => ({
      ...tokenRow,
      url: generateOnboardingUrl(token),
      short_url: tokenRow.short_code ? generateShortOnboardingUrl(tokenRow.short_code) : null,
    }));

    res.json({
      success: true,
      data: {
        overview: statsResult.rows[0],
        coverage: coverageResult.rows,
        activeTokens,
      },
    });
  } catch (error) {
    logger.error('Error fetching onboarding stats', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch onboarding statistics',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ==================== PUBLIC ONBOARDING CONTROLLERS ====================

/**
 * Middleware to validate onboarding token
 */
export const validateOnboardingToken = async (req, res, next) => {
  try {
    const token = req.body?.token || req.query?.token || req.headers['x-onboarding-token'];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding token is required',
      });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      logger.warn('Token verification failed', { token: token.substring(0, 20) + '...' });
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired onboarding token',
      });
    }

    logger.info('Token decoded successfully', { designation: decoded.designation });

    // Check token in database
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, designation, expires_at, max_uses, current_uses, is_active 
         FROM onboarding_tokens 
         WHERE token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Onboarding token not found',
        });
      }

      const tokenRecord = result.rows[0];

      // If payload carries a tokenId ensure it matches DB row for extra safety
      if (decoded.tokenId && decoded.tokenId !== tokenRecord.id) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired onboarding token',
        });
      }

      // Validate token status
      if (!tokenRecord.is_active) {
        return res.status(403).json({
          success: false,
          message: 'This onboarding link has been deactivated',
        });
      }

      if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
        return res.status(403).json({
          success: false,
          message: 'This onboarding link has expired',
        });
      }

      if (tokenRecord.max_uses && tokenRecord.current_uses >= tokenRecord.max_uses) {
        return res.status(403).json({
          success: false,
          message: 'This onboarding link has reached its maximum usage limit',
        });
      }

      // Attach token data to request
      req.onboardingToken = {
        id: tokenRecord.id,
        designation: tokenRecord.designation,
        token,
        payload: decoded,
      };

      next();
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Error validating onboarding token', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to validate onboarding token',
      error: error.message,
    });
  }
};

/**
 * Step 1: Initiate onboarding with phone
 * POST /auth/onboarding/initiate
 */
export const initiateOnboarding = async (req, res) => {
  try {
    const { phone } = req.body;
    const { designation } = req.onboardingToken;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const { normalized: normalizedPhone, local: localPhone } = buildPhoneDetails(phone);

    if (!normalizedPhone || !isValidNigerianPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Nigerian phone number',
      });
    }

    res.json({
      success: true,
      message: 'Phone number validated successfully',
      data: {
        phone: localPhone || normalizedPhone,
        designation,
        nextStep: 'verify-phone',
      },
    });
  } catch (error) {
    logger.error('Error initiating onboarding', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to initiate onboarding',
      error: error.message,
    });
  }
};

/**
 * Step 2: Verify phone (check reconciliation)
 * POST /auth/onboarding/verify-phone
 */
export const verifyPhone = async (req, res) => {
  const client = await pool.connect();
  try {
    const { phone } = req.body;
    const { normalized: normalizedPhone, local: localPhone, variants: phoneVariants } = buildPhoneDetails(phone);

    if (!normalizedPhone || !localPhone || phoneVariants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Nigerian phone number',
      });
    }

    // Check if phone exists in users table only
    const userResult = await client.query(
      `SELECT 
         id,
         email,
         "emailVerified",
         google_id,
         oauth_provider,
         name,
         designation,
         "votingState",
         "votingLGA",
         "votingWard",
         "votingPU",
         support_group,
         "profileImage",
         "bankAccountNumber",
         "bankName",
         "bankAccountName"
       FROM users 
       WHERE phone = ANY($1::text[])`,
      [phoneVariants]
    );

    const existingUser = userResult.rows[0];

    // Reconciliation scenarios
    if (existingUser) {
      const hasEmail = Boolean(existingUser.email);
      const emailLower = existingUser.email ? existingUser.email.toLowerCase() : null;
      const isTemporaryEmail = Boolean(emailLower && emailLower.endsWith('@obidients.com'));
      const hasVerifiedEmail = Boolean(existingUser.emailVerified);
      const hasGoogleConnection = Boolean(existingUser.google_id && existingUser.oauth_provider === 'google');
      const skipGoogle = Boolean((hasVerifiedEmail && hasEmail && !isTemporaryEmail) || hasGoogleConnection);

      // User exists - handle temporary accounts separately
      if (isTemporaryEmail) {
        const existingUserPayload = {
          id: existingUser.id,
          name: existingUser.name,
          designation: existingUser.designation,
          votingState: existingUser.votingState,
          votingLGA: existingUser.votingLGA,
          votingWard: existingUser.votingWard,
          votingPU: existingUser.votingPU,
          supportGroup: existingUser.support_group,
          email: existingUser.email,
          emailVerified: existingUser.emailVerified,
          hasGoogleConnection,
          bankAccountNumber: existingUser.bankAccountNumber,
          bankName: existingUser.bankName,
          bankAccountName: existingUser.bankAccountName,
        };

        return res.json({
          success: true,
          reconciliation: 'update_required',
          message: 'Account found. Please sign in with Google to complete your profile.',
          existingUser: existingUserPayload,
          voterData: null,
          skipGoogle: false,
          data: {
            existingUser: existingUserPayload,
            voterData: null,
            skipGoogle: false,
          },
        });
      }

      if (!skipGoogle) {
        return res.status(409).json({
          success: false,
          reconciliation: 'account_exists',
          message: 'An account with this phone number already exists but is not verified. Please contact support.',
          existingUser: {
            email: existingUser.email,
            designation: existingUser.designation,
            emailVerified: existingUser.emailVerified,
          },
          voterData: null,
          data: {
            email: existingUser.email,
            designation: existingUser.designation,
            emailVerified: existingUser.emailVerified,
          },
        });
      }

      const existingUserPayload = {
        id: existingUser.id,
        name: existingUser.name,
        designation: existingUser.designation,
        votingState: existingUser.votingState,
        votingLGA: existingUser.votingLGA,
        votingWard: existingUser.votingWard,
        votingPU: existingUser.votingPU,
        supportGroup: existingUser.support_group,
        email: existingUser.email,
        emailVerified: existingUser.emailVerified,
        hasGoogleConnection,
        profileImage: existingUser.profileImage,
        bankAccountNumber: existingUser.bankAccountNumber,
        bankName: existingUser.bankName,
        bankAccountName: existingUser.bankAccountName,
      };

      return res.json({
        success: true,
        reconciliation: 'existing_user',
        message: 'Account found. We will reuse your verified email.',
        existingUser: existingUserPayload,
        voterData: null,
        skipGoogle: true,
        data: {
          existingUser: existingUserPayload,
          voterData: null,
          skipGoogle: true,
        },
      });
    }

    // No existing user - check if voter data available
    res.json({
      success: true,
      reconciliation: 'new_user',
      message: 'No existing account found. Please complete your registration.',
      existingUser: null,
      voterData: null,
      skipGoogle: false,
      data: {
        existingUser: null,
        voterData: null,
        skipGoogle: false,
      },
    });
  } catch (error) {
    logger.error('Error verifying phone', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to verify phone number',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * Step 4: Complete onboarding (submit all data)
 * POST /auth/onboarding/complete
 */
export const completeOnboarding = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      phone,
      googleData, // { googleId, email, displayName, photoUrl }
      name,
      votingState,
      votingLGA,
      votingWard,
      votingPU,
      supportGroup,
      profileImage,
      accountNumber,
      bankName,
      accountName,
      pollingUnitCode = null,
      bypassGoogle = false,
      password, // NEW: Password for manual registration
    } = req.body;

    const { designation, id: tokenId } = req.onboardingToken;

    const { normalized: normalizedPhone, local: localPhone, variants: phoneVariants } = buildPhoneDetails(phone);

    if (!normalizedPhone || !localPhone || phoneVariants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Nigerian phone number',
      });
    }

    const phoneForStorage = localPhone;

    const normalizeLocationValue = (value) =>
      typeof value === 'string' && value.trim()
        ? value
          .trim()
          .replace(/\s+/g, ' ')
          .toUpperCase()
        : null;

    const normalizedState = normalizeLocationValue(votingState);
    const normalizedLGA = normalizeLocationValue(votingLGA);
    const normalizedWard = normalizeLocationValue(votingWard);
    const normalizedPU = normalizeLocationValue(votingPU);
    const normalizedSupportGroup = typeof supportGroup === 'string'
      ? supportGroup.trim().replace(/\s+/g, ' ')
      : supportGroup;
    const normalizedPollingUnitCode = typeof pollingUnitCode === 'string' && pollingUnitCode.trim()
      ? pollingUnitCode.trim()
      : null;

    // Validation
    if (!phoneForStorage || !name || !normalizedState || !normalizedLGA) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if user exists (reconciliation)
    const existingUserResult = await client.query(
      `SELECT 
         id,
         email,
         "emailVerified",
         google_id,
         oauth_provider,
         "profileImage",
         phone,
         "bankAccountNumber",
         "bankName",
         "bankAccountName"
       FROM users WHERE phone = ANY($1::text[]) LIMIT 1`,
      [phoneVariants]
    );

    const existingUser = existingUserResult.rows[0] || null;
    const isNewUser = !existingUser;

    // NEW: Validate authentication method for new users
    if (isNewUser) {
      if (bypassGoogle && !password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required for manual registration. Please provide a password.',
        });
      }

      if (!bypassGoogle && !googleData) {
        return res.status(400).json({
          success: false,
          message: 'Either Google authentication or password is required for new registration.',
        });
      }

      // Validate password strength for manual registration
      if (bypassGoogle && password) {
        if (password.length < 8) {
          return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long',
          });
        }

        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (!hasLowercase || !hasUppercase || !hasNumber) {
          return res.status(400).json({
            success: false,
            message: 'Password must contain lowercase, uppercase, and numeric characters',
          });
        }
      }
    }

    // Validate support group
    if (!isValidSupportGroup(normalizedSupportGroup)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid support group',
      });
    }

    // For Polling Unit Agent, votingWard and votingPU are required
    if (designation === 'Polling Unit Agent') {
      if (!normalizedWard || !normalizedPU) {
        return res.status(400).json({
          success: false,
          message: 'Ward and Polling Unit are required for Polling Unit Agents',
        });
      }

      // Check if agent already exists for this support group at this PU
      const existingAgentCheck = await client.query(
        `SELECT id FROM users 
         WHERE designation = 'Polling Unit Agent'
           AND UPPER(TRIM("votingState")) = $1 
           AND UPPER(TRIM("votingLGA")) = $2 
           AND UPPER(TRIM("votingWard")) = $3 
        AND UPPER(TRIM("votingPU")) = $4 
        AND LOWER(TRIM(support_group)) = LOWER($5)`,
        [normalizedState, normalizedLGA, normalizedWard, normalizedPU, normalizedSupportGroup]
      );

      if (existingAgentCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: `A Polling Unit Agent from ${normalizedSupportGroup || supportGroup} already exists for this polling unit`,
        });
      }
    }

    let userId;
    let isUpdate = false;

    // NEW: Handle existing user bypass Google validation
    if (existingUser && bypassGoogle) {
      const emailLower = existingUser.email ? existingUser.email.toLowerCase() : null;
      const isTemporaryEmail = Boolean(emailLower && emailLower.endsWith('@obidients.com'));
      const hasGoogleConnection = Boolean(existingUser.google_id && existingUser.oauth_provider === 'google');
      const hasVerifiedEmail = Boolean(existingUser.email && existingUser.emailVerified && !isTemporaryEmail);

      if (!hasVerifiedEmail && !hasGoogleConnection) {
        return res.status(400).json({
          success: false,
          message: 'Existing account is not verified. Please complete Google sign-in.',
        });
      }
    }

    // Determine authentication details
    const resolvedGoogleId = googleData?.googleId || existingUser?.google_id || null;
    const resolvedEmail = googleData?.email || existingUser?.email ||
      (bypassGoogle && isNewUser ? `${localPhone}@obidients.com` : null);
    const resolvedPhoto = profileImage || googleData?.photoUrl || existingUser?.profileImage || null;
    const resolvedOauthProvider = googleData
      ? 'google'
      : (existingUser?.oauth_provider ?? (bypassGoogle ? 'local' : null));
    const resolvedEmailVerified = !bypassGoogle;
    const oauthProviderForUpdate = resolvedOauthProvider
      || existingUserResult.rows[0]?.oauth_provider
      || (googleData ? 'google' : bypassGoogle ? 'local' : null);

    if (!resolvedEmail) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required to complete onboarding',
      });
    }

    // NEW: Hash password if provided for new users
    let hashedPassword = null;
    if (isNewUser && bypassGoogle && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else if (isNewUser && !bypassGoogle) {
      const generatedPassword = crypto.randomBytes(32).toString('hex');
      hashedPassword = await bcrypt.hash(generatedPassword, 10);
    }

    if (existingUserResult.rows.length > 0) {
      // Update existing user
      userId = existingUserResult.rows[0].id;
      isUpdate = true;

      await client.query(
        `UPDATE users SET
          phone = $1,
          google_id = $2,
          oauth_provider = $3,
          email = $4,
          name = $5,
          "votingState" = $6,
          "votingLGA" = $7,
          "votingWard" = $8,
          "votingPU" = $9,
          support_group = $10,
          designation = $11,
          "profileImage" = COALESCE($12, "profileImage"),
          "bankAccountNumber" = COALESCE($13, "bankAccountNumber"),
          "bankName" = COALESCE($14, "bankName"),
          "bankAccountName" = COALESCE($15, "bankAccountName"),
          polling_unit_code = $16,
          last_login_at = NOW(),
          "updatedAt" = NOW()
         WHERE id = $17`,
        [
          phoneForStorage,
          resolvedGoogleId,
          oauthProviderForUpdate || 'google',
          resolvedEmail,
          name,
          normalizedState,
          normalizedLGA,
          normalizedWard,
          normalizedPU,
          normalizedSupportGroup,
          designation,
          resolvedPhoto,
          accountNumber,
          bankName,
          accountName,
          normalizedPollingUnitCode,
          userId,
        ]
      );

      if (hashedPassword) {
        await client.query(
          `UPDATE users SET "passwordHash" = $1 WHERE id = $2`,
          [hashedPassword, userId]
        );
      }

      logger.info('User updated during onboarding', { userId, phone: phoneForStorage, normalizedPhone });
    } else {
      // Create new user
      const insertResult = await client.query(
        `INSERT INTO users (
          google_id, oauth_provider, email, name, phone,
          "votingState", "votingLGA", "votingWard", "votingPU",
          support_group, designation, "profileImage",
          "bankAccountNumber", "bankName", "bankAccountName", 
          polling_unit_code, "passwordHash", "emailVerified", last_login_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
        RETURNING id`,
        [
          resolvedGoogleId,
          resolvedOauthProvider || (bypassGoogle ? 'local' : 'google'),
          resolvedEmail,
          name,
          phoneForStorage,
          normalizedState,
          normalizedLGA,
          normalizedWard,
          normalizedPU,
          normalizedSupportGroup,
          designation,
          resolvedPhoto,
          accountNumber,
          bankName,
          accountName,
          normalizedPollingUnitCode,
          hashedPassword,
          resolvedEmailVerified,
        ]
      );

      userId = insertResult.rows[0].id;
      logger.info('New user created during onboarding', {
        userId,
        phone: phoneForStorage,
        normalizedPhone,
        authMethod: bypassGoogle ? 'password' : 'google'
      });
    }

    // Create call center assignment
    const adminResult = await client.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      ['favemeka146@gmail.com']
    );

    if (designation === 'Polling Unit Agent' && adminResult.rows.length > 0) {
      const adminId = adminResult.rows[0].id;

      const existingActiveAssignment = await client.query(
        `SELECT id FROM call_center_assignments
         WHERE user_id = $1 AND is_active = true
         LIMIT 1`,
        [userId]
      );

      if (existingActiveAssignment.rowCount > 0) {
        await client.query(
          `UPDATE call_center_assignments
             SET state = $2,
                 lga = $3,
                 ward = $4,
                 polling_unit = $5,
                 polling_unit_code = $6,
                 assigned_by = $7,
                 assigned_at = NOW()
           WHERE id = $1`,
          [
            existingActiveAssignment.rows[0].id,
            normalizedState,
            normalizedLGA,
            normalizedWard,
            normalizedPU,
            normalizedPollingUnitCode,
            adminId,
          ]
        );
      } else {
        const existingAnyAssignment = await client.query(
          `SELECT id FROM call_center_assignments
           WHERE user_id = $1
           ORDER BY id ASC
           LIMIT 1`,
          [userId]
        );

        if (existingAnyAssignment.rowCount > 0) {
          await client.query(
            `UPDATE call_center_assignments
               SET is_active = true,
                   state = $2,
                   lga = $3,
                   ward = $4,
                   polling_unit = $5,
                   polling_unit_code = $6,
                   assigned_by = $7,
                   assigned_at = NOW()
             WHERE id = $1`,
            [
              existingAnyAssignment.rows[0].id,
              normalizedState,
              normalizedLGA,
              normalizedWard,
              normalizedPU,
              normalizedPollingUnitCode,
              adminId,
            ]
          );
        } else {
          try {
            await client.query(
              `INSERT INTO call_center_assignments (
                 user_id, state, lga, ward, polling_unit, polling_unit_code,
                 assigned_by, is_active
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
              [
                userId,
                normalizedState,
                normalizedLGA,
                normalizedWard,
                normalizedPU,
                normalizedPollingUnitCode,
                adminId,
              ]
            );
          } catch (assignmentError) {
            if (
              assignmentError?.code === '23505' &&
              assignmentError?.constraint === 'idx_unique_active_user'
            ) {
              await client.query(
                `UPDATE call_center_assignments
                   SET state = $2,
                       lga = $3,
                       ward = $4,
                       polling_unit = $5,
                       polling_unit_code = $6,
                       assigned_by = $7,
                       assigned_at = NOW(),
                       is_active = true
                 WHERE user_id = $1`,
                [
                  userId,
                  normalizedState,
                  normalizedLGA,
                  normalizedWard,
                  normalizedPU,
                  normalizedPollingUnitCode,
                  adminId,
                ]
              );
              logger.warn('Recovered duplicate call center assignment during onboarding', {
                userId,
                normalizedState,
                normalizedLGA,
                normalizedWard,
                normalizedPU,
              });
            } else {
              throw assignmentError;
            }
          }
        }
      }
    }

    // Increment token usage
    await client.query(
      `UPDATE onboarding_tokens 
       SET current_uses = current_uses + 1 
       WHERE id = $1`,
      [tokenId]
    );

    await client.query('COMMIT');

    // Generate JWT for the new/updated user
    const token = jwt.sign(
      { userId, email: resolvedEmail, designation },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Attempt automatic monitor key assignment (non-blocking)
    let monitorKey = null;
    try {
      const keyResult = await assignAutoKey(userId, null);
      if (keyResult.success) {
        monitorKey = keyResult.key;
        logger.info('Monitor key auto-assigned during onboarding', {
          userId,
          key: monitorKey
        });
      }
    } catch (keyError) {
      // Log but don't fail onboarding if key assignment fails
      logger.error('Failed to auto-assign monitor key during onboarding', {
        userId,
        error: keyError.message
      });
    }

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate ? 'Profile updated successfully' : 'Registration completed successfully',
      data: {
        userId,
        token,
        monitorKey,
        user: {
          name,
          email: resolvedEmail,
          phone: phoneForStorage,
          designation,
          votingState: normalizedState,
          votingLGA: normalizedLGA,
          votingWard: normalizedWard,
          votingPU: normalizedPU,
          supportGroup: normalizedSupportGroup,
          pollingUnitCode: normalizedPollingUnitCode,
        },
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error completing onboarding', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * Upload onboarding profile image using shared S3 utility
 * POST /auth/onboarding/upload-profile-image
 */
export const uploadOnboardingProfileImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No file provided. Please upload a valid image.',
      });
    }

    const folder = `onboarding/${req.onboardingToken?.id || 'profiles'}`;
    const imageUrl = await uploadBufferToS3(req.file.buffer, req.file.originalname || 'profile.jpg', {
      folder,
      contentType: req.file.mimetype,
    });

    logger.info('Onboarding profile image uploaded', {
      tokenId: req.onboardingToken?.id,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    return res.status(201).json({
      success: true,
      message: 'Profile image uploaded successfully',
      url: imageUrl,
      data: {
        url: imageUrl,
      },
    });
  } catch (error) {
    logger.error('Error uploading onboarding profile image', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message,
    });
  }
};

/**
 * Resolve short code to full token
 * GET /auth/onboarding/resolve/:shortCode
 */
export const resolveShortCode = async (req, res) => {
  const client = await pool.connect();
  try {
    const { shortCode } = req.params;
    const normalizedCode = shortCode.trim().toUpperCase();

    // Validate short code format (6 uppercase alphanumeric)
    if (!/^[A-Z0-9]{6}$/.test(normalizedCode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid short code format',
      });
    }

    // Look up short code in database
    const result = await client.query(
      `SELECT token, designation, expires_at, max_uses, current_uses, is_active 
       FROM onboarding_tokens 
       WHERE short_code = $1`,
      [normalizedCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Short code not found',
      });
    }

    const tokenRecord = result.rows[0];

    // Check if token is active
    if (!tokenRecord.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This onboarding link has been deactivated',
      });
    }

    // Check if token has expired
    if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'This onboarding link has expired',
      });
    }

    // Check if max uses reached
    if (tokenRecord.max_uses && tokenRecord.current_uses >= tokenRecord.max_uses) {
      return res.status(403).json({
        success: false,
        message: 'This onboarding link has reached its maximum usage limit',
      });
    }

    // Return the full token
    res.json({
      success: true,
      data: {
        token: tokenRecord.token,
        designation: tokenRecord.designation,
      },
    });
  } catch (error) {
    logger.error('Error resolving short code', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to resolve short code',
      error: error.message,
    });
  } finally {
    client.release();
  }
};
