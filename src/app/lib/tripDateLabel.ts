/** "2026-07-12" as "2026.07.12."; other text is returned unchanged. */
export function formatCalendarDate(value: string): string {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${year}.${month}.${day}.`;
}

/**
 * A date's span as the site shows it: "2027.04.04. - 04.10.", or the single
 * day "2027.04.04." for a one-day trip. Null without a start date.
 */
export function tripDateLabel(startDate?: string | null, endDate?: string | null): string | null {
  if (!startDate) {
    return null;
  }

  const start = formatCalendarDate(startDate);

  if (!endDate || endDate === startDate) {
    return start;
  }

  return `${start} - ${formatCalendarDate(endDate).slice(5)}`;
}
