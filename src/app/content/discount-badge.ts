/**
 * Reads the percentage out of a price box discount badge such as "-15%".
 * The public price box shows the price reduced by it and the backend's
 * booking price calculator charges the same reduced price.
 */
export function parseDiscountPercent(discountBadge?: string | null): number | null {
  if (!discountBadge) {
    return null;
  }

  const match = discountBadge.match(/(-?\d+(?:[.,]\d+)?)\s*%/);
  if (!match) {
    return null;
  }

  const value = Math.abs(Number(match[1].replace(",", ".")));

  return Number.isFinite(value) && value > 0 && value < 100 ? value : null;
}
