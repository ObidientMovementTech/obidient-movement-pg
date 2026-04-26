import { query } from '../config/db.js';

/**
 * Record an entry in the audit log.
 * Fire-and-forget — never throws so it won't break the calling request.
 */
export async function auditLog({ actorId, action, targetType, targetId, details, req }) {
  try {
    await query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        actorId || null,
        action,
        targetType || null,
        targetId ? String(targetId) : null,
        details ? JSON.stringify(details) : '{}',
        req?.ip || null,
        req?.get?.('User-Agent') || null,
      ]
    );
  } catch (err) {
    // Silent fail — audit logging must never break the main flow
    console.error('[AuditLog] Failed to write:', err.message);
  }
}
