/**
 * Anonymize email for display/sharing
 * Example: jason@example.com → jas***@example.com
 */
export function anonymizeEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';

  const visibleChars = Math.min(3, local.length);
  const masked = local.slice(0, visibleChars) + '***';

  return `${masked}@${domain}`;
}

/**
 * Create anonymized ID for share URLs
 * Uses first 3 chars + deterministic hash (not reversible)
 */
export function createAnonymizedId(email: string): string {
  const prefix = email.slice(0, 3);
  const hash = simpleHash(email).toString(36).slice(0, 6);
  return `${prefix}${hash}`;
}

/**
 * Simple hash function for email anonymization
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
