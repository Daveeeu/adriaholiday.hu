import { slugify } from "../lib/slug";

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

const rawOffers: Omit<Offer, "id" | "slug">[] = [
  {
    title: "Albánia, a Balkán Riviérája",
    country: "Albánia",
    departure: "2026.09.25. - 10.01.",
    transport: "bus",
    hotel: "Hotel***",
    meals: "Félpanzió",
    price: "269.600 Ft",
    priceNumber: 269600,
    temperature: "29°C",
    duration: "7 nap / 6 éj",
    badge: "Népszerű",
    guaranteed: true,
    seatsLeft: 7,
    additionalDates: false,
    shortDescription:
      "Albánia különleges tengerparti és balkáni hangulata egy kényelmes buszos körutazáson.",
    tags: ["tengerpart", "buszos", "meleg", "termeszet", "varosnezes"],
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/sea-4768869_1920.jpg&op=;1200x750;",
  },
  {
    title: "Montenegrói üdülés, Albánia kincseivel fűszerezve",
    country: "Albánia",
    departure: "2026.06.08. - 14.",
    transport: "bus",
    hotel: "Hotel***",
    meals: "Reggeli",
    price: "189.900 Ft",
    priceNumber: 189900,
    temperature: "30°C",
    duration: "7 nap / 6 éj",
    badge: "Családbarát",
    additionalDates: true,
    shortDescription:
      "Tengerparti pihenés montenegrói hangulattal és albán kirándulási lehetőségekkel.",
    tags: ["tengerpart", "buszos", "meleg"],
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1200x750;",
  },
  {
    title: "Brugge - London - Párizs",
    country: "Anglia",
    departure: "2026.09.20. - 27.",
    transport: "bus",
    hotel: "4 éj holiday home, 3 éj hotel*/**",
    meals: "Önellátás",
    price: "273.600 Ft",
    priceNumber: 273600,
    temperature: "21°C",
    duration: "8 nap / 7 éj",
    badge: "Népszerű",
    shortDescription:
      "Három ikonikus európai város egy látványos, nagy ívű körutazásban.",
    tags: ["varosnezes", "buszos"],
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;1200x750;",
  },
  {
    title: "London a királyok városa",
    country: "Anglia",
    departure: "2026.10.04. - 10.",
    transport: "bus",
    hotel: "4 éj holiday home, 2 éj Hotel*/**",
    meals: "Önellátás",
    price: "239.600 Ft",
    priceNumber: 239600,
    temperature: "20°C",
    duration: "7 nap / 6 éj",
    additionalDates: false,
    shortDescription:
      "Klasszikus londoni városnézés történelmi látnivalókkal és királyi hangulattal.",
    tags: ["varosnezes", "buszos"],
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;1200x750;",
  },
  {
    title: "Vidéki csodák Angliában",
    country: "Anglia",
    departure: "2026.09.20. - 26.",
    transport: "bus",
    hotel: "4 éj holiday home, 2 éj hotel*/**",
    meals: "Önellátás",
    price: "244.800 Ft",
    priceNumber: 244800,
    temperature: "21°C",
    duration: "7 nap / 6 éj",
    badge: "Új ajánlat",
    shortDescription:
      "Anglia vidéki arcát bemutató körutazás hangulatos városokkal és történelmi helyszínekkel.",
    tags: ["varosnezes", "termeszet", "buszos"],
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1200x750;",
  },
  {
    title: "Hét nap alatt London körül",
    country: "Anglia",
    departure: "2026.05.31. - 06.06.",
    transport: "bus",
    hotel: "2 éj hotel*/**, 4 éj családoknál",
    meals: "Családoknál teljes ellátás",
    price: "296.600 Ft",
    priceNumber: 296600,
    temperature: "20°C",
    duration: "7 nap / 6 éj",
    additionalDates: true,
    shortDescription:
      "London és környéke egy tartalmas, élményekben gazdag buszos programban.",
    tags: ["varosnezes", "buszos"],
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;1200x750;",
  },
];

export const offers: Offer[] = rawOffers.map((offer, index) => {
  const base = slugify(offer.title);
  const slug = `${base}-${index + 1}`;
  return {
    ...offer,
    id: `offer-${index + 1}`,
    slug,
  };
});

export function getOfferBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return offers.find((o) => o.slug === slug);
}

