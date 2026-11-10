/** Every third digit from the right, where a thousands separator goes. */
const THOUSANDS = /\B(?=(\d{3})+(?!\d))/g;

/**
 * A whole forint amount in the site's format, e.g. "68.900" (dot thousands
 * separator, no decimals); mirrors the backend's App\Support\HufPrice.
 */
export function formatAmount(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";

  return `${sign}${String(Math.abs(rounded)).replace(THOUSANDS, ".")}`;
}

/** A forint price in the site's format, e.g. "68.900 Ft". */
export function formatHuf(amount: number): string {
  return `${formatAmount(amount)} Ft`;
}
