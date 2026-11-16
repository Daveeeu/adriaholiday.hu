/** Free seats are shown only from this many down, when they can still prompt a booking. */
export const SCARCE_SEATS_LIMIT = 15;

/** "Már csak 12 hely", or null when the seats are unknown, sold out or still plenty. */
export function seatsLeftLabel(seats: number | null | undefined): string | null {
  return seats !== null && seats !== undefined && seats > 0 && seats <= SCARCE_SEATS_LIMIT
    ? `Már csak ${seats} hely`
    : null;
}
