export const LOCALE = 'de-AT';

/**
 * Convert an ISO date string to a locale formatted
 * string using the configured LOCALE constant.
 */
export function formatDateLocal(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString(LOCALE);
}

/**
 * Convert a time string into a locale formatted string.
 * The input may either be a bare "HH:MM" value or an ISO timestamp.
 */
export function formatTimeLocal(timeStr) {
  if (!timeStr) return '';
  let date;
  if (/^\d{4}-\d{2}-\d{2}T/.test(timeStr)) {
    // Full ISO timestamp. Treat lack of explicit timezone as UTC so
    // toLocaleTimeString() converts to the local zone correctly.
    const iso = /(Z|[+-]\d{2}:\d{2})$/.test(timeStr) ? timeStr : `${timeStr}Z`;
    date = new Date(iso);
  } else {
    const [h, m] = timeStr.split(':');
    date = new Date();
    date.setHours(parseInt(h, 10));
    date.setMinutes(parseInt(m, 10));
    date.setSeconds(0);
    date.setMilliseconds(0);
  }
  return date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

