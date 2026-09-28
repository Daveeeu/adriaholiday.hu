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

export type BookingInsuranceChoice = {
  travel: boolean;
  cancellation: boolean;
};

type EstimateInput = {
  basePrice: number | null;
  discountPercent: number | null;
  passengers: number;
  departurePlace: BookingDeparturePlace | null;
  extras: BookingExtra[];
  selectedExtraIds: number[];
  insurances: BookingInsurances | null;
  insuranceChoice: BookingInsuranceChoice;
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

export function isSelectable(extra: BookingExtra): boolean {
  return extra.chargeRule === "optional";
}

/** Extras the booking pays for: automatic ones plus the selected optional ones. */
export function chargedExtras(extras: BookingExtra[], selectedExtraIds: number[], passengers: number): BookingExtra[] {
  return extras.filter(
    (extra) =>
      isChargedAutomatically(extra, passengers) || (isSelectable(extra) && selectedExtraIds.includes(extra.id)),
  );
}

/** Extras shown on the form: solo traveller supplements only when one passenger travels. */
export function visibleExtras(extras: BookingExtra[], passengers: number): BookingExtra[] {
  return extras.filter((extra) => extra.chargeRule !== "solo_traveller" || passengers === 1);
}

export function extraPriceLabel(extra: BookingExtra): string {
  return `${formatHuf(extra.price)}${extra.priceUnit === "per_person" ? " / fő" : " / foglalás"}`;
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
  passengers,
  departurePlace,
  extras,
  selectedExtraIds,
  insurances,
  insuranceChoice,
  startDate,
  endDate,
}: EstimateInput): BookingPriceEstimate {
  if (basePrice === null) {
    return { lines: [], insuranceLines: [], tripTotal: null, total: null };
  }

  const travellers = Math.max(1, passengers);
  const baseTotal = basePrice * travellers;
  const lines: BookingPriceLine[] = [
    { key: "base", label: `Részvételi díj (${travellers} fő)`, amount: baseTotal },
  ];

  if (discountPercent !== null) {
    lines.push({
      key: "discount",
      label: `Kedvezmény (-${discountPercent}%)`,
      amount: -Math.round((baseTotal * discountPercent) / 100),
    });
  }

  if (departurePlace && departurePlace.fee > 0) {
    lines.push({
      key: "departure",
      label: `Felszállás: ${departurePlace.name}`,
      amount: departurePlace.fee * travellers,
    });
  }

  chargedExtras(extras, selectedExtraIds, travellers).forEach((extra) => {
    const quantity = extra.priceUnit === "per_person" ? travellers : 1;

    lines.push({ key: `extra-${extra.id}`, label: extra.name, amount: extra.price * quantity });
  });

  const tripTotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const insuranceLines: BookingPriceLine[] = [];
  const days = travelDays(startDate, endDate);

  if (insurances && insuranceChoice.travel && days !== null) {
    insuranceLines.push({
      key: "travel-insurance",
      label: insurances.travelInsurance.name,
      amount: Math.round(insurances.travelInsurance.dailyFee * travellers * days),
    });
  }

  if (insurances && insuranceChoice.cancellation && isCancellationInsuranceAvailable(startDate, insurances)) {
    insuranceLines.push({
      key: "cancellation-insurance",
      label: insurances.cancellationInsurance.name,
      amount: Math.round((tripTotal * insurances.cancellationInsurance.percent) / 100),
    });
  }

  return {
    lines,
    insuranceLines,
    tripTotal,
    total: tripTotal + insuranceLines.reduce((sum, line) => sum + line.amount, 0),
  };
}
