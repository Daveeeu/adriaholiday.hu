/** The day Adria Holiday was founded; the site counts its years from it. */
export const COMPANY_FOUNDED_ON = { year: 2003, month: 8, day: 27 } as const;

/**
 * Placeholder for the company's age in years in editable texts
 * ("{evek}+ év tapasztalat"); the site shows the number in its place.
 */
export const COMPANY_YEARS_PLACEHOLDER = "{evek}";

const PLACEHOLDER_PATTERN = /\{evek\}/g;

/** Full years since the founding day (22 until 2026-08-26, 23 from 2026-08-27). */
export function companyYears(today: Date = new Date()): number {
  const { year, month, day } = COMPANY_FOUNDED_ON;
  const anniversaryPassed = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);

  return today.getFullYear() - year - (anniversaryPassed ? 0 : 1);
}

/**
 * A content value with the years placeholder filled in, also inside lists
 * and objects; a value that is only the placeholder (a stat counted up as a
 * number) becomes the number itself.
 */
export function withCompanyYears<T>(value: T, years: number = companyYears()): T {
  if (typeof value === "string") {
    return (value.trim() === COMPANY_YEARS_PLACEHOLDER ? years : value.replace(PLACEHOLDER_PATTERN, String(years))) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => withCompanyYears(item, years)) as T;
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withCompanyYears(item, years)])) as T;
  }

  return value;
}
