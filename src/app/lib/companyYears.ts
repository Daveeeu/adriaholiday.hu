/** The day Adria Holiday was founded; the site counts its years from it. */
export const COMPANY_FOUNDED_ON = { year: 2003, month: 8, day: 27 } as const;

/**
 * Placeholder for the company's age in years in editable texts
 * ("{evek}+ év tapasztalat"); the site shows the number in its place.
 */
export const COMPANY_YEARS_PLACEHOLDER = "{evek}";

/** Full years since the founding day (22 until 2026-08-26, 23 from 2026-08-27). */
export function companyYears(today: Date = new Date()): number {
  const { year, month, day } = COMPANY_FOUNDED_ON;
  const anniversaryPassed = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);

  return today.getFullYear() - year - (anniversaryPassed ? 0 : 1);
}
