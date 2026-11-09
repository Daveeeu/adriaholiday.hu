const DATE_FORMAT = new Intl.DateTimeFormat('hu-HU', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('hu-HU', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function format(formatter: Intl.DateTimeFormat, value?: string | null) {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? value : formatter.format(parsed);
}

/** The one date format of the admin, e.g. 2026. 11. 08. */
export function formatDate(value?: string | null) {
  return format(DATE_FORMAT, value);
}

/** The one date and time format of the admin, e.g. 2026. 11. 08. 15:17 */
export function formatDateTime(value?: string | null) {
  return format(DATE_TIME_FORMAT, value);
}
