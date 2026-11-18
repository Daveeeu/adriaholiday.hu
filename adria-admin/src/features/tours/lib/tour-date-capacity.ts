/**
 * The capacity a new date starts with: a full coach on round trips, a plane's
 * group allotment on flying ones. Mirrors the API's TourDateCapacity, which
 * gives the same default to dates saved without one.
 */
const COACH_CAPACITY = 45;
const PLANE_CAPACITY = 22;

export function defaultTourDateCapacity(travelModeId: string): number {
  return travelModeId === 'plane' ? PLANE_CAPACITY : COACH_CAPACITY;
}
