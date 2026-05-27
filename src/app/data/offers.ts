import scraped from "./offers.scraped.json";

type Transport = "bus" | "plane";

export interface Offer {
  id: string;
  slug: string;
  title: string;
  country: string;
  departure: string;
  transport: Transport;
  hotel: string;
  meals?: string;
  price: string;
  priceNumber: number;
  temperature?: string;
  tags: string[];
  image: string;
  badge?:
    | "Legjobb ár"
    | "Népszerű"
    | "Last minute"
    | "Új ajánlat"
    | "Családbarát";
  duration?: string;
  seatsLeft?: number;
  guaranteed?: boolean;
  additionalDates?: boolean;
  shortDescription?: string;
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getSlugFromDetailUrl(detailUrl: string) {
  try {
    const url = new URL(detailUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("korutazasok");
    const slug = idx >= 0 ? parts[idx + 1] : parts[parts.length - 1];
    return slug || detailUrl;
  } catch {
    return detailUrl;
  }
}

function inferTransport(value: string | null | undefined): Transport {
  const v = (value || "").toLowerCase();
  if (v.includes("rep") || v.includes("plane")) return "plane";
  return "bus";
}

function inferTags(offer: { transport: Transport; description?: string | null; title: string }) {
  const tags = new Set<string>();
  tags.add(offer.transport === "plane" ? "repulos" : "buszos");

  const hay = `${offer.title} ${offer.description || ""}`.toLowerCase();
  if (hay.includes("tenger")) tags.add("tengerpart");
  if (hay.includes("város") || hay.includes("varos") || hay.includes("prág") || hay.includes("prag")) {
    tags.add("varosnezes");
  }
  if (hay.includes("hegy") || hay.includes("alp") || hay.includes("természet") || hay.includes("termeszet")) {
    tags.add("termeszet");
  }

  return [...tags];
}

function titleCaseHun(slug: string) {
  const map: Record<string, string> = {
    albania: "Albánia",
    ausztria: "Ausztria",
    "bosznia-hercegovina": "Bosznia-Hercegovina",
    csehorszag: "Csehország",
    erdely: "Erdély",
    franciaorszag: "Franciaország",
    gruzia: "Grúzia",
    hollandia: "Hollandia",
    horvatorszag: "Horvátország",
  };

  if (map[slug]) return map[slug];
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export const offers: Offer[] = (scraped as any).results.map((row: any, index: number) => {
  const slug = getSlugFromDetailUrl(row.detailUrl);
  const transport = inferTransport(row.transport);
  const description = row.detail?.description ?? null;
  const sourceCountrySlug = String(row.sourceUrl || "")
    .split("/")
    .filter(Boolean)
    .pop();
  const country = sourceCountrySlug ? titleCaseHun(sourceCountrySlug) : "Utazás";

  return {
    id: row.detailUrl || `offer-${index + 1}`,
    slug,
    title: clean(row.title),
    country,
    departure: row.dateText || "Érdeklődjön",
    transport,
    hotel: row.hotel || "Szállás információ később",
    meals: row.meals || "Információ később",
    price: row.priceText || "Ár hamarosan",
    priceNumber: row.priceNumber || 0,
    tags: inferTags({ transport, description, title: row.title }),
    image: row.detail?.heroImage || row.image,
    shortDescription: description,
    additionalDates: row.dateText?.toLowerCase().includes("további") || false,
  };
});

export function getOfferBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return offers.find((o) => o.slug === slug);
}
