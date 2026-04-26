import crypto from 'crypto';
import { query } from '../config/db.js';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * Generate a refresh token, store its hash, and return the raw token.
 * @param {string} userId - UUID of the user
 * @returns {{ rawToken: string, familyId: string }}
 */
export async function createRefreshToken(userId) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const familyId = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, tokenHash, familyId, expiresAt]
  );

  return { rawToken, familyId };
}

/**
 * Rotate a refresh token: validate the old one, issue a new one, and
 * mark the old one as consumed. If the old token was already consumed,
 * revoke the entire family (reuse detection).
 *
 * @param {string} rawToken - The raw refresh token from the cookie
 * @returns {{ newRawToken: string, userId: string } | null}
 */
export async function rotateRefreshToken(rawToken) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Look up the token
  const result = await query(
    `SELECT id, user_id, family_id, expires_at, used_at, revoked
     FROM refresh_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );

  if (result.rows.length === 0) {
    return null; // Token not found
  }

  const existing = result.rows[0];

  // Reuse detection: if token was already consumed, someone stole it
  if (existing.used_at || existing.revoked) {
    // Revoke the ENTIRE family — attacker and legitimate user both lose access
    await query(
      `UPDATE refresh_tokens SET revoked = TRUE WHERE family_id = $1`,
      [existing.family_id]
    );
    return null;
  }

  // Check expiry
  if (new Date(existing.expires_at) < new Date()) {
    return null; // Expired
  }

  // Mark old token as consumed
  await query(
    `UPDATE refresh_tokens SET used_at = NOW() WHERE id = $1`,
    [existing.id]
  );

  // Issue new token in the same family
  const newRawToken = crypto.randomBytes(32).toString('hex');
  const newHash = crypto.createHash('sha256').update(newRawToken).digest('hex');
  const newExpiry = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [existing.user_id, newHash, existing.family_id, newExpiry]
  );

  return { newRawToken, userId: existing.user_id };
}

/**
 * Revoke all refresh tokens for a user (e.g., on password change or logout).
 */
export async function revokeAllUserTokens(userId) {
  await query(
    `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1 AND revoked = FALSE`,
    [userId]
  );
}

/**
 * Cookie options for the refresh token cookie.
 */
export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/auth', // only sent to auth endpoints
  };
}
