/**
 * Normalize an email address for consistent storage and lookup.
 *
 * Email local-parts are technically case-sensitive per the RFC, but in practice
 * every mainstream provider treats them case-insensitively. Storing and querying
 * with a canonical form (trimmed + lowercased) prevents duplicate accounts and
 * "user not found" failures when someone signs up as `John.Doe@Gmail.com` but
 * later logs in as `john.doe@gmail.com`.
 *
 * We intentionally do NOT strip dots or "+tags" (Gmail-style) because that would
 * change the address for non-Gmail providers and surprise users.
 *
 * @param {*} email
 * @returns {*} normalized email when given a string, otherwise the input unchanged
 */
export const normalizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  return email.trim().toLowerCase();
};

export default normalizeEmail;
