import { COMPANY_YEARS_PLACEHOLDER, companyYears } from "./companyYears";
import { GOOGLE_RATING, GOOGLE_RATING_PLACEHOLDER, formatRating } from "./googleRating";

/** Figures written as placeholders in editable texts, so the copy never needs updating. */
export type PlaceholderFigures = { years: number; rating: number };

const currentFigures = (): PlaceholderFigures => ({ years: companyYears(), rating: GOOGLE_RATING });

/**
 * A content value with the placeholders ("{evek}", "{ertekeles}") filled in,
 * also inside lists and objects; a value that is only a placeholder (a stat
 * counted up as a number) becomes the number itself.
 */
export function withContentPlaceholders<T>(value: T, figures: PlaceholderFigures = currentFigures()): T {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed === COMPANY_YEARS_PLACEHOLDER) {
      return figures.years as T;
    }

    if (trimmed === GOOGLE_RATING_PLACEHOLDER) {
      return figures.rating as T;
    }

    return value
      .replaceAll(COMPANY_YEARS_PLACEHOLDER, String(figures.years))
      .replaceAll(GOOGLE_RATING_PLACEHOLDER, formatRating(figures.rating)) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => withContentPlaceholders(item, figures)) as T;
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, withContentPlaceholders(item, figures)]),
    ) as T;
  }

  return value;
}
