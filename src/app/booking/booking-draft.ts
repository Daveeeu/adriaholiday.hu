import { EMPTY_PASSENGER_OPTIONS, type PassengerOptions } from "./booking-pricing.ts";

/**
 * What a reload or a slip of the back button should not wipe out of the
 * booking form: the head count, the departure place and the supplements.
 * Names, birth dates, documents and contact details are never kept.
 */
export type BookingDraft = {
  /** The date the booking-level supplements were picked for; they only apply to it. */
  dateId: string | number;
  passengerCount: number;
  departurePlaceId: string;
  bookingExtraIds: number[];
  bookingExtraChoices: Record<number, string>;
  passengerOptions: PassengerOptions[];
};

const VERSION = 1;
const KEY_PREFIX = "adria:booking-draft:";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((id) => Number.isInteger(id));
}

function isChoiceMap(value: unknown): value is Record<number, string> {
  return isRecord(value) && Object.values(value).every((choice) => typeof choice === "string");
}

function parsePassengerOptions(value: unknown): PassengerOptions | null {
  if (!isRecord(value) || !isIdList(value.extraIds) || !isChoiceMap(value.extraChoices)) {
    return null;
  }

  return {
    extraIds: value.extraIds,
    extraChoices: value.extraChoices,
    travelInsurance: value.travelInsurance === true,
    cancellationInsurance: value.cancellationInsurance === true,
  };
}

/** The stored draft, or null when there is none or it is not one this version wrote. */
export function parseBookingDraft(raw: string | null, maxPassengers: number): BookingDraft | null {
  if (!raw) {
    return null;
  }

  let stored: unknown;

  try {
    stored = JSON.parse(raw);
  } catch {
    return null;
  }

  if (
    !isRecord(stored) ||
    stored.version !== VERSION ||
    (typeof stored.dateId !== "string" && typeof stored.dateId !== "number") ||
    !Number.isInteger(stored.passengerCount) ||
    typeof stored.departurePlaceId !== "string" ||
    !isIdList(stored.bookingExtraIds) ||
    !isChoiceMap(stored.bookingExtraChoices) ||
    !Array.isArray(stored.passengerOptions)
  ) {
    return null;
  }

  const passengerCount = Math.min(maxPassengers, Math.max(1, stored.passengerCount as number));
  const options = stored.passengerOptions.map(parsePassengerOptions);

  return {
    dateId: stored.dateId,
    passengerCount,
    departurePlaceId: stored.departurePlaceId,
    bookingExtraIds: stored.bookingExtraIds,
    bookingExtraChoices: stored.bookingExtraChoices,
    passengerOptions: Array.from({ length: passengerCount }, (_, index) => options[index] ?? EMPTY_PASSENGER_OPTIONS),
  };
}

export function serializeBookingDraft(draft: BookingDraft): string {
  return JSON.stringify({ version: VERSION, ...draft });
}

// The draft lives in the tab's session storage, which a private window or
// blocked site data can deny: the form then simply starts empty.

export function readBookingDraft(tourSlug: string, maxPassengers: number): BookingDraft | null {
  try {
    return parseBookingDraft(window.sessionStorage.getItem(KEY_PREFIX + tourSlug), maxPassengers);
  } catch {
    return null;
  }
}

export function saveBookingDraft(tourSlug: string, draft: BookingDraft): void {
  try {
    window.sessionStorage.setItem(KEY_PREFIX + tourSlug, serializeBookingDraft(draft));
  } catch {
    // Not kept; the form works the same without it.
  }
}

export function clearBookingDraft(tourSlug: string): void {
  try {
    window.sessionStorage.removeItem(KEY_PREFIX + tourSlug);
  } catch {
    // Nothing to clear.
  }
}
