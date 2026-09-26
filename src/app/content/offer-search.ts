/**
 * Offer search criteria shared by the homepage hero search and the offer listing.
 * The URL query string is the single source of truth; parameter names match the
 * public offers API so criteria can be forwarded without renaming.
 */

export const OFFER_SEARCH_PATH = "/utazasok";

export type TripDuration = "short" | "medium" | "long";

export type OfferSearchCriteria = {
  search: string;
  departure: string;
  from: string;
  duration: TripDuration | "";
  maxPrice: string;
};

export type OfferSearchApiParams = {
  search?: string;
  departure?: string;
  from?: string;
  duration?: TripDuration;
  maxPrice?: number;
};

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

export const EMPTY_OFFER_SEARCH: OfferSearchCriteria = {
  search: "",
  departure: "",
  from: "",
  duration: "",
  maxPrice: "",
};

export const OFFER_SEARCH_KEYS = Object.keys(EMPTY_OFFER_SEARCH) as Array<keyof OfferSearchCriteria>;

export const TRIP_DURATION_OPTIONS: ReadonlyArray<SelectOption<TripDuration>> = [
  { value: "short", label: "1–4 nap" },
  { value: "medium", label: "5–8 nap" },
  { value: "long", label: "9+ nap" },
];

export const BUDGET_OPTIONS: ReadonlyArray<SelectOption<string>> = [
  { value: "100000", label: "100 000 Ft/fő-ig" },
  { value: "200000", label: "200 000 Ft/fő-ig" },
  { value: "300000", label: "300 000 Ft/fő-ig" },
  { value: "500000", label: "500 000 Ft/fő-ig" },
];

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TEXT_LENGTH = 100;

function normalizeText(value: string | null) {
  return (value ?? "").trim().slice(0, MAX_TEXT_LENGTH);
}

function normalizeDate(value: string | null) {
  const trimmed = (value ?? "").trim();

  if (!ISO_DATE_PATTERN.test(trimmed)) {
    return "";
  }

  // Round-tripping rejects impossible dates such as 2026-02-30, which Date would roll over.
  const parsed = new Date(`${trimmed}T00:00:00Z`);

  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === trimmed ? trimmed : "";
}

function normalizeDuration(value: string | null): TripDuration | "" {
  return TRIP_DURATION_OPTIONS.find((option) => option.value === value)?.value ?? "";
}

function normalizeMaxPrice(value: string | null) {
  const trimmed = (value ?? "").trim();

  return /^\d+$/.test(trimmed) && Number(trimmed) > 0 ? trimmed : "";
}

export function normalizeOfferSearch(criteria: OfferSearchCriteria): OfferSearchCriteria {
  return {
    search: normalizeText(criteria.search),
    departure: normalizeText(criteria.departure),
    from: normalizeDate(criteria.from),
    duration: normalizeDuration(criteria.duration),
    maxPrice: normalizeMaxPrice(criteria.maxPrice),
  };
}

export function parseOfferSearch(params: URLSearchParams): OfferSearchCriteria {
  return normalizeOfferSearch({
    search: params.get("search") ?? "",
    departure: params.get("departure") ?? "",
    from: params.get("from") ?? "",
    duration: normalizeDuration(params.get("duration")),
    maxPrice: params.get("maxPrice") ?? "",
  });
}

export function hasOfferSearchCriteria(criteria: OfferSearchCriteria) {
  return OFFER_SEARCH_KEYS.some((key) => criteria[key] !== "");
}

export function toOfferSearchApiParams(criteria: OfferSearchCriteria): OfferSearchApiParams {
  return {
    search: criteria.search || undefined,
    departure: criteria.departure || undefined,
    from: criteria.from || undefined,
    duration: criteria.duration || undefined,
    maxPrice: criteria.maxPrice ? Number(criteria.maxPrice) : undefined,
  };
}

export function buildOfferSearchUrl(criteria: OfferSearchCriteria) {
  const normalized = normalizeOfferSearch(criteria);
  const query = new URLSearchParams();

  OFFER_SEARCH_KEYS.forEach((key) => {
    if (normalized[key] !== "") {
      query.set(key, normalized[key]);
    }
  });

  const queryString = query.toString();

  return queryString ? `${OFFER_SEARCH_PATH}?${queryString}` : OFFER_SEARCH_PATH;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatPrice(value: string) {
  return `${new Intl.NumberFormat("hu-HU").format(Number(value))} Ft/fő-ig`;
}

/**
 * Human readable labels for the active criteria, in display order.
 */
export function describeOfferSearch(
  criteria: OfferSearchCriteria,
): Array<{ key: keyof OfferSearchCriteria; label: string }> {
  const labels: Record<keyof OfferSearchCriteria, (value: string) => string> = {
    search: (value) => `„${value}”`,
    departure: (value) => `Indulási hely: ${value}`,
    from: (value) => `Legkorábbi indulás: ${formatDate(value)}`,
    duration: (value) => TRIP_DURATION_OPTIONS.find((option) => option.value === value)?.label ?? value,
    maxPrice: formatPrice,
  };

  return OFFER_SEARCH_KEYS.filter((key) => criteria[key] !== "").map((key) => ({
    key,
    label: labels[key](criteria[key]),
  }));
}
