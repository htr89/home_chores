export const LOCALE = 'de-AT';

/**
 * Convert an ISO date string (YYYY-MM-DD) to a locale formatted
 * string using the configured LOCALE constant.
 */
export function formatDateLocal(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString(LOCALE);
}

