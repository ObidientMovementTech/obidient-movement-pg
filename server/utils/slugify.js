import { query } from '../config/db.js';

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // strip accents
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function buildSlugBase(name, designation, { assignedState, assignedCountry, assignedDirectorate } = {}) {
  const namePart = toSlug(name);
  let contextPart = '';

  if (designation === 'Directorate Head' && assignedDirectorate) {
    contextPart = toSlug(assignedDirectorate.replace(/_/g, ' '));
  } else if (designation === 'Diaspora Coordinator' && assignedCountry) {
    contextPart = toSlug(assignedCountry);
  } else if (assignedState) {
    contextPart = toSlug(assignedState);
  }

  return contextPart ? `${namePart}-${contextPart}` : namePart;
}

/**
 * Generate a unique profileSlug for a user being assigned a leadership role.
 * If the base slug is taken, appends a counter: ben-favour-technology-2
 */
export async function generateUniqueSlug(name, designation, context, excludeId = null) {
  const base = buildSlugBase(name, designation, context);
  let candidate = base;
  let counter = 2;

  while (true) {
    const params = excludeId ? [candidate, excludeId] : [candidate];
    const sql = excludeId
      ? `SELECT id FROM users WHERE "profileSlug" = $1 AND id != $2`
      : `SELECT id FROM users WHERE "profileSlug" = $1`;

    const result = await query(sql, params);
    if (result.rows.length === 0) return candidate;
    candidate = `${base}-${counter++}`;
  }
}
