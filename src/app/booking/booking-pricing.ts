import type { PortfolioOfferDateExtra } from "../content/portfolio-offer-detail-api";

export type BookingExtra = PortfolioOfferDateExtra;

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
  total: number | null;
};

type EstimateInput = {
  basePrice: number | null;
  passengers: number;
  departurePlace: BookingDeparturePlace | null;
  extras: BookingExtra[];
  selectedExtraIds: number[];
};

const hufFormatter = new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 0 });

export function formatHuf(amount: number): string {
  return `${hufFormatter.format(amount)} Ft`;
}

/** Mandatory extras are always charged; optional ones only when selected. */
export function chargedExtras(extras: BookingExtra[], selectedExtraIds: number[]): BookingExtra[] {
  return extras.filter((extra) => extra.mandatory || selectedExtraIds.includes(extra.id));
}

export function extraPriceLabel(extra: BookingExtra): string {
  return `${formatHuf(extra.price)}${extra.priceUnit === "per_person" ? " / fő" : " / foglalás"}`;
}

/**
 * Live price preview for the booking form, following the same rules as the
 * backend's TourBookingPriceCalculator. The server recalculates the total on
 * submit and stores that one, so this only drives what the customer sees.
 */
export function estimateBookingPrice({
  basePrice,
  passengers,
  departurePlace,
  extras,
  selectedExtraIds,
}: EstimateInput): BookingPriceEstimate {
  if (basePrice === null) {
    return { lines: [], total: null };
  }

  const travellers = Math.max(1, passengers);
  const lines: BookingPriceLine[] = [
    { key: "base", label: `Részvételi díj (${travellers} fő)`, amount: basePrice * travellers },
  ];

  if (departurePlace && departurePlace.fee > 0) {
    lines.push({
      key: "departure",
      label: `Felszállás: ${departurePlace.name}`,
      amount: departurePlace.fee * travellers,
    });
  }

  chargedExtras(extras, selectedExtraIds).forEach((extra) => {
    const quantity = extra.priceUnit === "per_person" ? travellers : 1;

    lines.push({ key: `extra-${extra.id}`, label: extra.name, amount: extra.price * quantity });
  });

  return { lines, total: lines.reduce((sum, line) => sum + line.amount, 0) };
}
