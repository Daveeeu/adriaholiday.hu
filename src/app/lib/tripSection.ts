/** Marks a section of the trip page for its section navigation; the value is the section's tab label. */
export const TRIP_SECTION_ATTRIBUTE = "data-trip-section";

export function tripSection(label: string) {
  return { [TRIP_SECTION_ATTRIBUTE]: label };
}
