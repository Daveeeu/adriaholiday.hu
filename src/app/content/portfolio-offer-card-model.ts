import type { PortfolioOfferCard } from "./portfolio-offers-api";

export type UnifiedOfferCardModel = {
  id: number | string;
  seoName: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  primaryBadge: string | null;
  secondaryBadge: string | null;
  departureLabel: string | null;
  durationLabel: string | null;
  displayedPrice: string | null;
  departureCountText: string | null;
  transportLabel: string | null;
  transportShortLabel: string | null;
  mealsLabel: string | null;
  accommodationLabel: string | null;
  link: string;
};

function safeText(value?: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed !== "" ? trimmed : null;
}

function formatCalendarDate(value?: string | null): string | null {
  const trimmed = safeText(value);

  if (!trimmed) {
    return null;
  }

  const [year, month, day] = trimmed.split("-");

  if (!year || !month || !day) {
    return trimmed;
  }

  return `${year}.${month}.${day}.`;
}

function formatDepartureLabel(offer: PortfolioOfferCard): string | null {
  const explicit = safeText(offer.departureDateLabel);

  if (explicit) {
    return explicit;
  }

  const start = formatCalendarDate(offer.departureDate);
  return start;
}

function resolveImageUrl(offer: PortfolioOfferCard): string | null {
  return (
    safeText(offer.image?.sizes?.large) ??
    safeText(offer.image?.url) ??
    safeText(offer.image?.thumbnailUrl)
  );
}

function departureCountText(count?: number | null): string | null {
  if (typeof count !== "number" || count <= 1) {
    return null;
  }

  return "Több időpont";
}

function transportLabel(value?: string | null): string | null {
  const transport = safeText(value);

  if (!transport) {
    return null;
  }

  if (transport === "bus") {
    return "Buszos út";
  }

  if (transport === "plane") {
    return "Repülős út";
  }

  return transport;
}

function transportShortLabel(value?: string | null): string | null {
  const transport = safeText(value);

  if (!transport) {
    return null;
  }

  if (transport === "bus") {
    return "Busz";
  }

  if (transport === "plane") {
    return "Repülő";
  }

  return transport;
}

export function toUnifiedOfferCardModel(
  offer: PortfolioOfferCard,
): UnifiedOfferCardModel {
  return {
    id: offer.id,
    seoName: offer.seoName,
    name: offer.name,
    description:
      safeText(offer.shortDescription) ?? safeText(offer.listDescription),
    imageUrl: resolveImageUrl(offer),
    imageAlt: safeText(offer.image?.name) ?? safeText(offer.name),
    primaryBadge: safeText(offer.country),
    secondaryBadge: safeText(offer.programTypeLabel),
    departureLabel: formatDepartureLabel(offer),
    durationLabel: safeText(offer.duration),
    displayedPrice: safeText(offer.displayedPrice),
    departureCountText: departureCountText(offer.departureDateCount),
    transportLabel: transportLabel(offer.transport),
    transportShortLabel: transportShortLabel(offer.transport),
    mealsLabel: safeText(offer.meals),
    accommodationLabel: safeText(offer.accommodation),
    link: offer.link,
  };
}
