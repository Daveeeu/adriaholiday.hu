/** Lower-case and accent-free, so "Zágráb" and "zagrabban" compare. */
function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** The stops of a route written as "Firenze - Siena - Bologna" (or with commas). */
export function routeStops(route?: string | null): string[] {
  return (route ?? "")
    .split(/\s*[-–,]\s*/)
    .map((stop) => stop.trim())
    .filter((stop) => stop !== "");
}

/**
 * Whether the text already names every stop, also with a Hungarian suffix
 * ("Toszkánában" names "Toszkána"), so the route needn't be repeated under it.
 */
export function routeNamedIn(stops: string[], text: string): boolean {
  const folded = fold(text);

  return stops.length > 0 && stops.every((stop) => folded.includes(fold(stop).slice(0, Math.max(3, stop.length - 1))));
}
