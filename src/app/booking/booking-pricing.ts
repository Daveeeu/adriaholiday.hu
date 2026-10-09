import type {
  PortfolioBookingInsurances,
  PortfolioOfferDateExtra,
} from "../content/portfolio-offer-detail-api";

export type BookingExtra = PortfolioOfferDateExtra;

export type BookingInsurances = PortfolioBookingInsurances;

export type BookingDeparturePlace = {
  id: number | string;
  name: string;
  fee: number;
};

export type BookingPriceLine = {
  key: string;
  label: string;
  amount: number;
};

export type BookingPriceEstimate = {
  lines: BookingPriceLine[];
  insuranceLines: BookingPriceLine[];
  tripTotal: number | null;
  total: number | null;
};

/** One passenger's own extras (with a choice where the extra offers one) and insurances. */
export type PassengerOptions = {
  extraIds: number[];
  extraChoices: Record<number, string>;
  travelInsurance: boolean;
  cancellationInsurance: boolean;
};

export const EMPTY_PASSENGER_OPTIONS: PassengerOptions = {
  extraIds: [],
  extraChoices: {},
  travelInsurance: false,
  cancellationInsurance: false,
};

type EstimateInput = {
  basePrice: number | null;
  discountPercent: number | null;
  departurePlace: BookingDeparturePlace | null;
  extras: BookingExtra[];
  /** Extras charged once per booking that the customer selected. */
  bookingExtraIds: number[];
  /** One entry per passenger. */
  passengerOptions: PassengerOptions[];
  insurances: BookingInsurances | null;
  startDate: string | null;
  endDate: string | null;
};

const hufFormatter = new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 0 });
const DAY_MS = 24 * 60 * 60 * 1000;

export function formatHuf(amount: number): string {
  return `${hufFormatter.format(amount)} Ft`;
}

export function isChargedAutomatically(extra: BookingExtra, passengers: number): boolean {
  return extra.chargeRule === "mandatory" || (extra.chargeRule === "solo_traveller" && passengers === 1);
}

/** Optional extras, and in a group the single room supplement, are the customer's to choose. */
export function isSelectable(extra: BookingExtra, passengers: number): boolean {
  return extra.chargeRule === "optional" || (extra.chargeRule === "solo_traveller" && passengers > 1);
}

/**
 * Chosen and charged passenger by passenger. A single room supplement always
 * belongs to one passenger, even when its price is entered per booking.
 */
export function isPerPassenger(extra: BookingExtra): boolean {
  return extra.priceUnit === "per_person" || extra.chargeRule === "solo_traveller";
}

/** Booking-level extras the booking pays for: automatic ones plus the selected ones. */
export function chargedBookingExtras(extras: BookingExtra[], bookingExtraIds: number[], passengers: number): BookingExtra[] {
  return extras.filter(
    (extra) =>
      !isPerPassenger(extra) &&
      (isChargedAutomatically(extra, passengers) ||
        (isSelectable(extra, passengers) && bookingExtraIds.includes(extra.id))),
  );
}

/** Per-passenger extras one passenger pays for: automatic ones plus the ones they selected. */
export function chargedPassengerExtras(extras: BookingExtra[], options: PassengerOptions, passengers: number): BookingExtra[] {
  return extras.filter(
    (extra) =>
      isPerPassenger(extra) &&
      (isChargedAutomatically(extra, passengers) ||
        (isSelectable(extra, passengers) && options.extraIds.includes(extra.id))),
  );
}

/** Per-passenger extras a passenger's card offers: the selectable ones and an automatic single room supplement. */
export function passengerCardExtras(extras: BookingExtra[], passengers: number): BookingExtra[] {
  return extras.filter(
    (extra) => isPerPassenger(extra) && (isSelectable(extra, passengers) || extra.chargeRule === "solo_traveller"),
  );
}

/** Extras of the trip step: the booking-level ones and the per-person ones everyone pays. */
export function tripStepExtras(extras: BookingExtra[]): BookingExtra[] {
  return extras.filter((extra) => !isPerPassenger(extra) || extra.chargeRule === "mandatory");
}

export function extraPriceLabel(extra: BookingExtra): string {
  return `${formatHuf(extra.price)}${isPerPassenger(extra) ? " / fő" : " / foglalás"}`;
}

function parseDate(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  return year && month && day ? Date.UTC(year, month - 1, day) : null;
}

export function travelDays(startDate: string | null, endDate: string | null): number | null {
  const start = parseDate(startDate);

  if (start === null) {
    return null;
  }

  const end = parseDate(endDate) ?? start;

  return Math.round((end - start) / DAY_MS) + 1;
}

export function isCancellationInsuranceAvailable(
  startDate: string | null,
  insurances: BookingInsurances | null,
): boolean {
  const start = parseDate(startDate);

  if (start === null || !insurances) {
    return false;
  }

  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.round((start - today) / DAY_MS) >= insurances.cancellationInsurance.minDaysBeforeDeparture;
}

/**
 * Live price preview for the booking form, following the same rules as the
 * backend's TourBookingPriceCalculator. The server recalculates the total on
 * submit (including any coupon) and stores that one, so this only drives
 * what the customer sees.
 */
export function estimateBookingPrice({
  basePrice,
  discountPercent,
  departurePlace,
  extras,
  bookingExtraIds,
  passengerOptions,
  insurances,
  startDate,
  endDate,
}: EstimateInput): BookingPriceEstimate {
  if (basePrice === null) {
    return { lines: [], insuranceLines: [], tripTotal: null, total: null };
  }

  const options = passengerOptions.length > 0 ? passengerOptions : [EMPTY_PASSENGER_OPTIONS];
  const travellers = options.length;
  const baseTotal = basePrice * travellers;
  const discount = discountPercent !== null ? Math.round((baseTotal * discountPercent) / 100) : 0;
  const departureFee = departurePlace?.fee ?? 0;
  const lines: BookingPriceLine[] = [
    { key: "base", label: `Részvételi díj (${travellers} fő)`, amount: baseTotal },
  ];

  if (discount > 0) {
    lines.push({ key: "discount", label: `Kedvezmény (-${discountPercent}%)`, amount: -discount });
  }

  if (departurePlace && departureFee > 0) {
    lines.push({ key: "departure", label: `Felszállás: ${departurePlace.name}`, amount: departureFee * travellers });
  }

  const bookingExtras = chargedBookingExtras(extras, bookingExtraIds, travellers);
  const passengerExtras = options.map((passenger) => chargedPassengerExtras(extras, passenger, travellers));

  extras.forEach((extra) => {
    if (bookingExtras.includes(extra)) {
      lines.push({ key: `extra-${extra.id}`, label: extra.name, amount: extra.price });
      return;
    }

    const count = passengerExtras.filter((charged) => charged.includes(extra)).length;

    if (count > 0) {
      lines.push({ key: `extra-${extra.id}`, label: `${extra.name} (${count} fő)`, amount: extra.price * count });
    }
  });

  const tripTotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const bookingExtrasTotal = bookingExtras.reduce((sum, extra) => sum + extra.price, 0);
  // Each passenger's part of the trip total, as the backend prices the cancellation insurance.
  const shares = passengerExtras.map(
    (charged) =>
      basePrice + departureFee + (bookingExtrasTotal - discount) / travellers + charged.reduce((sum, extra) => sum + extra.price, 0),
  );
  const insuranceLines: BookingPriceLine[] = [];
  const days = travelDays(startDate, endDate);
  const travelInsured = options.filter((passenger) => passenger.travelInsurance).length;
  const cancellationInsured = options.flatMap((passenger, index) => (passenger.cancellationInsurance ? [index] : []));

  if (insurances && travelInsured > 0 && days !== null) {
    insuranceLines.push({
      key: "travel-insurance",
      label: `${insurances.travelInsurance.name} (${travelInsured} fő)`,
      amount: Math.round(insurances.travelInsurance.dailyFee * travelInsured * days),
    });
  }

  if (insurances && cancellationInsured.length > 0 && isCancellationInsuranceAvailable(startDate, insurances)) {
    insuranceLines.push({
      key: "cancellation-insurance",
      label: `${insurances.cancellationInsurance.name} (${cancellationInsured.length} fő)`,
      amount: cancellationInsured.reduce(
        (sum, index) => sum + Math.round((shares[index] * insurances.cancellationInsurance.percent) / 100),
        0,
      ),
    });
  }

  return {
    lines,
    insuranceLines,
    tripTotal,
    total: tripTotal + insuranceLines.reduce((sum, line) => sum + line.amount, 0),
  };
}
