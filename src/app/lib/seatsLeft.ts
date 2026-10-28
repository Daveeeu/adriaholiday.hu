/** Free seats are shown only from this many down, when they can still prompt a booking. */
export const SCARCE_SEATS_LIMIT = 15;

type SeatSource = {
  priceBox?: { availableSeats?: number | null } | null;
  seatsLeft?: number | null;
};

/** A date's free seats: the price box's figure set in the admin, else the date's own count. */
export function seatsOf({ priceBox, seatsLeft }: SeatSource): number | null {
  return priceBox?.availableSeats ?? seatsLeft ?? null;
}

/** "Már csak 12 hely", or null when the seats are unknown, sold out or still plenty. */
export function seatsLeftLabel(seats: number | null | undefined): string | null {
  return seats !== null && seats !== undefined && seats > 0 && seats <= SCARCE_SEATS_LIMIT
    ? `Már csak ${seats} hely`
    : null;
}
