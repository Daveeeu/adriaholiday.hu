/** The agency's Google review rating out of 5, as shown on its Google profile. */
export const GOOGLE_RATING = 4.1;

/**
 * Placeholder for the Google rating in editable texts ("{ertekeles}/5");
 * the site shows the rating in its place.
 */
export const GOOGLE_RATING_PLACEHOLDER = "{ertekeles}";

/** The rating with a Hungarian decimal comma ("4,1"). */
export function formatRating(rating: number = GOOGLE_RATING): string {
  return rating.toLocaleString("hu-HU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
