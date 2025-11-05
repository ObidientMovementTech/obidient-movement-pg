/**
 * Monitor Key Service - Auto-Assignment
 * Automatically generates and assigns monitoring keys during onboarding
 */

import { query, getClient } from '../config/db.js';
import crypto from 'crypto';
import { logger } from '../middlewares/security.middleware.js';
import { deriveMonitoringScopeFromUser, MonitoringScopeError } from '../utils/monitoringScope.js';

/**
 * Generate a unique 6-character alphanumeric key
 * Avoids confusing characters: 0, O, 1, I, l
 */
const generateMonitorKey = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

/**
 * Check if key is unique across all users
 */
const isKeyUnique = async (client, key) => {
  const result = await client.query(
    'SELECT id FROM users WHERE monitor_unique_key = $1 LIMIT 1',
    [key]
  );
  return result.rows.length === 0;
};

/**
 * Generate a unique monitor key with retry logic
 */
const generateUniqueKey = async (client, maxAttempts = 10) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = generateMonitorKey();
    if (await isKeyUnique(client, key)) {
      return key;
    }
  }
  throw new Error('Failed to generate unique monitor key after multiple attempts');
};

/**
 * Verify user has complete voting location data for their designation
 */
const verifyUserScopeCompleteness = (user) => {
  const { designation, votingState, votingLGA, votingWard, votingPU } = user;

  // All monitors need state
  if (!votingState || votingState.trim() === '') {
    return {
      complete: false,
      missing: ['votingState'],
      message: 'Voting state is required'
    };
  }

  // LGA, Ward, and PU agents need LGA
  if (['LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent'].includes(designation)) {
    if (!votingLGA || votingLGA.trim() === '') {
      return {
        complete: false,
        missing: ['votingLGA'],
        message: 'Voting LGA is required for your designation'
      };
    }
  }

  // Ward and PU agents need ward
  if (['Ward Coordinator', 'Polling Unit Agent'].includes(designation)) {
    if (!votingWard || votingWard.trim() === '') {
      return {
        complete: false,
        missing: ['votingWard'],
        message: 'Voting ward is required for your designation'
      };
    }
  }

  // PU agents need polling unit
  if (designation === 'Polling Unit Agent') {
    if (!votingPU || votingPU.trim() === '') {
      return {
        complete: false,
        missing: ['votingPU'],
        message: 'Voting polling unit is required for Polling Unit Agents'
      };
    }
  }

  return { complete: true, missing: [] };
};

/**
 * Assign monitoring key automatically during onboarding
 * Called after user completes onboarding with voting location
 * 
 * @param {string} userId - User UUID
 * @param {string} [assignedBy] - Admin user ID who triggered assignment (optional)
 * @returns {Promise<Object>} - Assignment result with key and scope
 */
export const assignAutoKey = async (userId, assignedBy = null) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Fetch user details
    const userResult = await client.query(
      `SELECT 
         id,
         name,
         email,
         designation,
         "votingState",
         "votingLGA",
         "votingWard",
         "votingPU",
         monitor_unique_key,
         key_status,
         monitoring_location
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found for key assignment');
    }

    const user = userResult.rows[0];

    // Check if user already has an active key
    if (user.monitor_unique_key && user.key_status === 'active') {
      logger.info('User already has active monitoring key', {
        userId,
        key: user.monitor_unique_key
      });

      await client.query('COMMIT');

      return {
        success: true,
        message: 'User already has an active monitoring key',
        key: user.monitor_unique_key,
        scope: user.monitoring_location,
        alreadyAssigned: true
      };
    }

    // Verify user has complete scope data
    const scopeCheck = verifyUserScopeCompleteness(user);
    if (!scopeCheck.complete) {
      await client.query('ROLLBACK');

      logger.warn('Cannot assign key - incomplete user data', {
        userId,
        missing: scopeCheck.missing
      });

      return {
        success: false,
        error: 'INCOMPLETE_DATA',
        message: scopeCheck.message,
        missing: scopeCheck.missing
      };
    }

    // Derive monitoring scope from user profile
    let scope;
    try {
      scope = deriveMonitoringScopeFromUser(user);
    } catch (error) {
      await client.query('ROLLBACK');

      if (error instanceof MonitoringScopeError) {
        logger.error('Scope derivation failed during key assignment', {
          userId,
          error: error.message
        });

        return {
          success: false,
          error: 'SCOPE_ERROR',
          message: error.message
        };
      }

      throw error;
    }

    // Generate unique key
    const monitorKey = await generateUniqueKey(client);

    // Assign key to user
    await client.query(
      `UPDATE users 
       SET 
         monitor_unique_key = $1,
         key_status = 'active',
         key_assigned_by = $2,
         key_assigned_date = NOW(),
         monitoring_location = $3,
         "updatedAt" = NOW()
       WHERE id = $4`,
      [monitorKey, assignedBy, JSON.stringify(scope), userId]
    );

    await client.query('COMMIT');

    logger.info('Monitoring key auto-assigned successfully', {
      userId,
      key: monitorKey,
      designation: user.designation,
      scope: scope.level
    });

    // TODO: Send notification/email to user with their key
    // await sendKeyAssignmentNotification(user, monitorKey);

    return {
      success: true,
      message: 'Monitoring key assigned successfully',
      key: monitorKey,
      scope,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        designation: user.designation
      }
    };

  } catch (error) {
    await client.query('ROLLBACK');

    logger.error('Error assigning monitor key', {
      userId,
      error: error.message,
      stack: error.stack
    });

    throw error;
  } finally {
    client.release();
  }
};

/**
 * Bulk assign keys to users who completed onboarding but don't have keys
 * Use for backfill after deploying auto-assignment
 * 
 * @param {number} limit - Maximum number of users to process in one batch
 * @returns {Promise<Object>} - Batch assignment results
 */
export const backfillMonitorKeys = async (limit = 100) => {
  const client = await getClient();

  try {
    // Find users eligible for key assignment
    const usersResult = await client.query(
      `SELECT id, name, email, designation,
              "votingState", "votingLGA", "votingWard", "votingPU"
       FROM users
       WHERE designation IN ('Polling Unit Agent', 'Ward Coordinator', 'LGA Coordinator', 'State Coordinator')
         AND (monitor_unique_key IS NULL OR key_status != 'active')
         AND "votingState" IS NOT NULL
         AND "votingState" != ''
       ORDER BY "createdAt" ASC
       LIMIT $1`,
      [limit]
    );

    const results = {
      total: usersResult.rows.length,
      assigned: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    logger.info('Starting bulk key assignment', { total: results.total });

    for (const user of usersResult.rows) {
      try {
        const result = await assignAutoKey(user.id, null);

        if (result.success) {
          if (result.alreadyAssigned) {
            results.skipped++;
          } else {
            results.assigned++;
          }
        } else {
          results.skipped++;
          logger.warn('Skipped user during backfill', {
            userId: user.id,
            reason: result.message
          });
        }

      } catch (error) {
        results.failed++;
        results.errors.push({
          userId: user.id,
          name: user.name,
          error: error.message
        });

        logger.error('Failed to assign key during backfill', {
          userId: user.id,
          error: error.message
        });
      }
    }

    logger.info('Bulk key assignment complete', results);

    return results;

  } finally {
    client.release();
  }
};

export const monitorKeyService = {
  assignAutoKey,
  backfillMonitorKeys,
  generateUniqueKey,
  verifyUserScopeCompleteness
};

export default monitorKeyService;
