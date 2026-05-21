export type CategoryBadge = "Népszerű" | "Új" | "Legkedveltebb";

export interface Category {
  id: string;
  title: string;
  image: string;
  tripsCount: number;
  slug: string;
  badge?: CategoryBadge;
  subtitle: string;
  heroImage: string;
  stats: Array<{ value: string; label: string }>;
}

export const categories: Category[] = [
  {
    id: "1",
    title: "Körutazások",
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;800x450;",
    tripsCount: 91,
    slug: "korutazasok",
    badge: "Népszerű",
    subtitle:
      "Válogatott buszos és repülős körutazások Európa legszebb tájaira.",
    heroImage:
      "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1600x900;",
    stats: [
      { value: "40+", label: "Ajánlat" },
      { value: "10+", label: "Ország" },
      { value: "15 év", label: "Tapasztalat" },
    ],
  },
  {
    id: "2",
    title: "Repülős körutazások",
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;800x450;",
    tripsCount: 12,
    slug: "repulos-korutazasok",
    subtitle: "Gyors, kényelmes repülős körutazások különleges úti célokra.",
    heroImage:
      "https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;1600x900;",
    stats: [
      { value: "10+", label: "Ajánlat" },
      { value: "6+", label: "Ország" },
      { value: "15 év", label: "Tapasztalat" },
    ],
  },
  {
    id: "3",
    title: "Tengerparti ajánlatok autóbusszal",
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/sea-4768869_1920.jpg&op=;800x450;",
    tripsCount: 11,
    slug: "tengerpart-busz",
    badge: "Legkedveltebb",
    subtitle: "Buszos tengerparti üdülések remek ár-érték aránnyal.",
    heroImage:
      "https://adriaholiday.hu/framework/img.php?p=files/sea-4768869_1920.jpg&op=;1600x900;",
    stats: [
      { value: "20+", label: "Ajánlat" },
      { value: "8+", label: "Ország" },
      { value: "15 év", label: "Tapasztalat" },
    ],
  },
  {
    id: "4",
    title: "Tengerparti szállások Olaszországban",
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/yellow-3521730_1920.jpg&op=;800x450;",
    tripsCount: 202,
    slug: "olaszorszag",
    subtitle: "Olasz tengerparti szállások széles választéka és jó ajánlatok.",
    heroImage:
      "https://adriaholiday.hu/framework/img.php?p=files/yellow-3521730_1920.jpg&op=;1600x900;",
    stats: [
      { value: "200+", label: "Szállás" },
      { value: "20+", label: "Üdülőhely" },
      { value: "15 év", label: "Tapasztalat" },
    ],
  },
  {
    id: "5",
    title: "Különlegességek",
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/shutterstock_2495541347.jpg&op=;800x450;",
    tripsCount: 15,
    slug: "kulonlegessegek",
    badge: "Új",
    subtitle: "Különleges tematikus utak, ritkább úti célokkal és élményekkel.",
    heroImage:
      "https://adriaholiday.hu/framework/img.php?p=files/shutterstock_2495541347.jpg&op=;1600x900;",
    stats: [
      { value: "15+", label: "Ajánlat" },
      { value: "10+", label: "Téma" },
      { value: "15 év", label: "Tapasztalat" },
    ],
  },
  {
    id: "6",
    title: "Egzotikus üdülések",
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;800x450;",
    tripsCount: 9,
    slug: "egzotikus",
    subtitle: "Egzotikus úti célok, felejthetetlen pihenésekkel és programokkal.",
    heroImage:
      "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1600x900;",
    stats: [
      { value: "9+", label: "Ajánlat" },
      { value: "6+", label: "Régió" },
      { value: "15 év", label: "Tapasztalat" },
    ],
  },
];

export function getCategoryBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return categories.find((c) => c.slug === slug);
}

