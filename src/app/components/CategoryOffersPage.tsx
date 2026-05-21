// CategoryOffersPage.tsx

import { motion, AnimatePresence, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Bus,
  Plane,
  Hotel,
  Star,
  Waves,
  Mountain,
  Building2,
  Wallet,
  Sun,
  X,
  SlidersHorizontal,
  Flame,
  Sparkles,
  TrendingUp,
  Clock,
  Utensils,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getCategoryBySlug } from "../data/categories";

interface CategoryOffersPageProps {
  categorySlug: string;
  offers: Offer[];
  onBack: () => void;
  onOfferSelect: (offer: Offer) => void;
}

type Transport = "bus" | "plane";

export interface Offer {
  slug?: string;
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
  badge?: "Legjobb ár" | "Népszerű" | "Last minute" | "Új ajánlat" | "Családbarát";
  duration?: string;
  seatsLeft?: number;
  guaranteed?: boolean;
  additionalDates?: boolean;
  shortDescription?: string;
}

const offers: Offer[] = [ { title: "Albánia, a Balkán Riviérája", country: "Albánia", departure: "2026.09.25. - 10.01.", transport: "bus", hotel: "Hotel***", meals: "Félpanzió", price: "269.600 Ft", priceNumber: 269600, temperature: "29°C", duration: "7 nap / 6 éj", badge: "Népszerű", guaranteed: true, seatsLeft: 7, additionalDates: false, shortDescription: "Albánia különleges tengerparti és balkáni hangulata egy kényelmes buszos körutazáson.", tags: ["tengerpart", "buszos", "meleg", "termeszet", "varosnezes"], image: "https://adriaholiday.hu/framework/img.php?p=files/sea-4768869_1920.jpg&op=;1200x750;", }, { title: "Montenegrói üdülés, Albánia kincseivel fűszerezve", country: "Albánia", departure: "2026.06.08. - 14.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "189.900 Ft", priceNumber: 189900, temperature: "30°C", duration: "7 nap / 6 éj", badge: "Családbarát", additionalDates: true, shortDescription: "Tengerparti pihenés montenegrói hangulattal és albán kirándulási lehetőségekkel.", tags: ["tengerpart", "buszos", "meleg"], image: "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1200x750;", }, { title: "Brugge - London - Párizs", country: "Anglia", departure: "2026.09.20. - 27.", transport: "bus", hotel: "4 éj holiday home, 3 éj hotel*/**", meals: "Önellátás", price: "273.600 Ft", priceNumber: 273600, temperature: "21°C", duration: "8 nap / 7 éj", badge: "Népszerű", shortDescription: "Három ikonikus európai város egy látványos, nagy ívű körutazásban.", tags: ["varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;1200x750;", }, { title: "London a királyok városa", country: "Anglia", departure: "2026.10.04. - 10.", transport: "bus", hotel: "4 éj holiday home, 2 éj Hotel*/**", meals: "Önellátás", price: "239.600 Ft", priceNumber: 239600, temperature: "20°C", duration: "7 nap / 6 éj", additionalDates: false, shortDescription: "Klasszikus londoni városnézés történelmi látnivalókkal és királyi hangulattal.", tags: ["varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;1200x750;", }, { title: "Vidéki csodák Angliában", country: "Anglia", departure: "2026.09.20. - 26.", transport: "bus", hotel: "4 éj holiday home, 2 éj hotel*/**", meals: "Önellátás", price: "244.800 Ft", priceNumber: 244800, temperature: "21°C", duration: "7 nap / 6 éj", badge: "Új ajánlat", shortDescription: "Anglia vidéki arcát bemutató körutazás hangulatos városokkal és történelmi helyszínekkel.", tags: ["varosnezes", "termeszet", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1200x750;", }, { title: "Hét nap alatt London körül", country: "Anglia", departure: "2026.05.31. - 06.06.", transport: "bus", hotel: "2 éj hotel*/**, 4 éj családoknál", meals: "Családoknál teljes ellátás", price: "296.600 Ft", priceNumber: 296600, temperature: "20°C", duration: "7 nap / 6 éj", additionalDates: true, shortDescription: "London és környéke egy tartalmas, élményekben gazdag buszos programban.", tags: ["varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;1200x750;", }, { title: "Wales - Britannia rejtett arca", country: "Anglia", departure: "2026.07.02. - 10.", transport: "bus", hotel: "4 éj holiday home, 2 éj Hotel**", meals: "Önellátás", price: "329.400 Ft", priceNumber: 329400, temperature: "19°C", duration: "9 nap / 8 éj", badge: "Új ajánlat", shortDescription: "Természeti látnivalók, történelmi városok és Britannia kevésbé ismert oldala.", tags: ["termeszet", "varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1200x750;", }, { title: "London - Brighton és a fehér sziklák", country: "Anglia", departure: "2026.06.28. - 07.04.", transport: "bus", hotel: "4 éj Holiday home, 2 éj Hotel**", meals: "Önellátás", price: "228.600 Ft", priceNumber: 228600, temperature: "21°C", duration: "7 nap / 6 éj", shortDescription: "London városnézése Brighton tengerparti hangulatával és látványos fehér sziklákkal.", tags: ["tengerpart", "varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;1200x750;", }, { title: "Tirol és a Bajor kastélyok", country: "Ausztria", departure: "2026.08.07. - 10.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "155.600 Ft", priceNumber: 155600, temperature: "23°C", duration: "4 nap / 3 éj", badge: "Népszerű", additionalDates: true, shortDescription: "Alpesi tájak, bajor kastélyok és mesés hegyi panorámák egy rövid körutazáson.", tags: ["termeszet", "varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/yellow-3521730_1920.jpg&op=;1200x750;", }, { title: "A hegyi doktor nyomában", country: "Ausztria", departure: "2026.05.28. - 31.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "196.800 Ft", priceNumber: 196800, temperature: "22°C", duration: "4 nap / 3 éj", shortDescription: "Hegyi falvak, alpesi tájak és ismerős filmes helyszínek Ausztriában.", tags: ["termeszet", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/yellow-3521730_1920.jpg&op=;1200x750;", }, { title: "A mesebeli Hallstatt és Salzburg", country: "Ausztria", departure: "2026.07.10. - 11.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "83.900 Ft", priceNumber: 83900, temperature: "22°C", duration: "2 nap / 1 éj", badge: "Legjobb ár", shortDescription: "Rövid, látványos kirándulás Hallstatt és Salzburg varázslatos világába.", tags: ["termeszet", "varosnezes", "olcso", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/yellow-3521730_1920.jpg&op=;1200x750;", }, { title: "Burgenland-i kastélytúra", country: "Ausztria", departure: "2026.07.10. - 12.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "124.900 Ft", priceNumber: 124900, temperature: "24°C", duration: "3 nap / 2 éj", shortDescription: "Kastélyok, történelmi hangulat és könnyed osztrák kirándulás.", tags: ["varosnezes", "termeszet", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/yellow-3521730_1920.jpg&op=;1200x750;", }, { title: "Alpesi hegyek, kristálytiszta tavak mentén", country: "Ausztria", departure: "2026.06.26. - 29.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "168.600 Ft", priceNumber: 168600, temperature: "23°C", duration: "4 nap / 3 éj", shortDescription: "Látványos alpesi út kristálytiszta tavakkal és hegyi panorámákkal.", tags: ["termeszet", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/yellow-3521730_1920.jpg&op=;1200x750;", }, { title: "Aranydukát Vendégház - Tállya", country: "Belföld", departure: "Érdeklődjön", transport: "bus", hotel: "Vendégház", meals: "Információ később", price: "Ár hamarosan", priceNumber: 0, temperature: "24°C", duration: "Egyedi ajánlat", badge: "Új ajánlat", shortDescription: "Belföldi pihenés vendégházas hangulattal, rugalmas egyeztetéssel.", tags: ["belfold", "buszos", "termeszet", "olcso"], image: "https://adriaholiday.hu/framework/img.php?p=files/shutterstock_2495541347.jpg&op=;1200x750;", }, { title: "Bosznia egzotikus világa", country: "Bosznia-Hercegovina", departure: "2026.06.25. - 28.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "118.600 Ft", priceNumber: 118600, temperature: "27°C", duration: "4 nap / 3 éj", badge: "Népszerű", guaranteed: true, additionalDates: true, shortDescription: "Mostar, balkáni hangulat és különleges kulturális élmények rövid körutazáson.", tags: ["varosnezes", "termeszet", "meleg", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1200x750;", }, { title: "Bosznia egzotikus világa mandarin szürettel", country: "Bosznia-Hercegovina", departure: "2026.10.22. - 25.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "118.600 Ft", priceNumber: 118600, temperature: "24°C", duration: "4 nap / 3 éj", shortDescription: "Boszniai körutazás mandarin szüreti élménnyel kiegészítve.", tags: ["varosnezes", "termeszet", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1200x750;", }, { title: "Bohémia rejtett csodái és Adrspach sziklavárosa", country: "Csehország", departure: "2026.05.29. - 31.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "111.800 Ft", priceNumber: 111800, temperature: "22°C", duration: "3 nap / 2 éj", badge: "Új ajánlat", shortDescription: "Bohém hangulatú városok és az Adrspach sziklaváros különleges természeti világa.", tags: ["termeszet", "varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/shutterstock_2495541347.jpg&op=;1200x750;", }, { title: "Wroclaw törpéitől Cseh-Svájc óriás sziklavárosáig", country: "Csehország", departure: "2026.09.25. - 27.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "99.800 Ft", priceNumber: 99800, temperature: "23°C", duration: "3 nap / 2 éj", badge: "Legjobb ár", shortDescription: "Városnézés és természet egy rövid, jó árú cseh-lengyel hangulatú úton.", tags: ["termeszet", "varosnezes", "olcso", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/shutterstock_2495541347.jpg&op=;1200x750;", }, { title: "Arany Prága ínyenceknek", country: "Csehország", departure: "2026.06.04. - 07.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "127.900 Ft", priceNumber: 127900, temperature: "24°C", duration: "4 nap / 3 éj", shortDescription: "Prága klasszikus látnivalói, gasztronómiai és városnéző élményekkel.", tags: ["varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/shutterstock_2495541347.jpg&op=;1200x750;", }, { title: "Cseh kastélyok", country: "Csehország", departure: "2026.09.03. - 06.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "129.400 Ft", priceNumber: 129400, temperature: "23°C", duration: "4 nap / 3 éj", shortDescription: "Kastélyok, történelmi városok és cseh hangulat egy tartalmas körutazáson.", tags: ["varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/shutterstock_2495541347.jpg&op=;1200x750;", }, { title: "Száztornyú Prága", country: "Csehország", departure: "2026.10.22. - 24.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "96.600 Ft", priceNumber: 96600, temperature: "18°C", duration: "3 nap / 2 éj", badge: "Legjobb ár", shortDescription: "Rövid prágai városlátogatás kedvező áron.", tags: ["varosnezes", "olcso", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/shutterstock_2495541347.jpg&op=;1200x750;", }, { title: "Máramarosi kalandok Székelyföld csodáival", country: "Erdély", departure: "2026.08.17. - 21.", transport: "bus", hotel: "Hotel***", meals: "Félpanzió", price: "179.600 Ft", priceNumber: 179600, temperature: "25°C", duration: "5 nap / 4 éj", shortDescription: "Erdélyi tájak, hagyományok és Székelyföld különleges hangulata.", tags: ["termeszet", "varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1200x750;", }, { title: "Tündéri Székelyföld", country: "Erdély", departure: "2026.06.10. - 14.", transport: "bus", hotel: "Hotel***", meals: "Félpanzió", price: "188.400 Ft", priceNumber: 188400, temperature: "24°C", duration: "5 nap / 4 éj", shortDescription: "Székelyföld természeti és kulturális kincsei kényelmes buszos utazással.", tags: ["termeszet", "varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1200x750;", }, { title: "Dél-Erdély és a Vajdaság", country: "Erdély", departure: "2026.09.18. - 20.", transport: "bus", hotel: "Hotel***", meals: "Félpanzió", price: "119.900 Ft", priceNumber: 119900, temperature: "24°C", duration: "3 nap / 2 éj", shortDescription: "Rövid körutazás Dél-Erdély és a Vajdaság hangulatos helyszíneire.", tags: ["varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1200x750;", }, { title: "Kincses Kolozsvártól Torockóig", country: "Erdély", departure: "2026.08.29. - 30.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "69.900 Ft", priceNumber: 69900, temperature: "25°C", duration: "2 nap / 1 éj", badge: "Legjobb ár", shortDescription: "Kolozsvár és Torockó rövid, tartalmas felfedezése.", tags: ["varosnezes", "olcso", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1200x750;", }, { title: "Dél-Erdély és a Vaskapu-szoros", country: "Erdély", departure: "2026.05.27. - 31.", transport: "bus", hotel: "Hotel***", meals: "Reggeli", price: "184.600 Ft", priceNumber: 184600, temperature: "25°C", duration: "5 nap / 4 éj", shortDescription: "Dél-Erdély történelmi városai és a Vaskapu-szoros természeti látványa.", tags: ["termeszet", "varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1200x750;", }, { title: "Párizs és a Loire-völgyi kastélyok", country: "Franciaország", departure: "2026.08.19. - 24.", transport: "bus", hotel: "Hotel**", meals: "Reggeli", price: "249.600 Ft", priceNumber: 249600, temperature: "26°C", duration: "6 nap / 5 éj", badge: "Népszerű", shortDescription: "Párizs romantikája és a Loire-völgyi kastélyok eleganciája egy útban.", tags: ["varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1200x750;", }, { title: "Elzász meséi", country: "Franciaország", departure: "2026.07.10. - 15.", transport: "bus", hotel: "Hotel**", meals: "Reggeli", price: "220.900 Ft", priceNumber: 220900, temperature: "25°C", duration: "6 nap / 5 éj", shortDescription: "Mesés francia kisvárosok, hangulatos utcák és elzászi élmények.", tags: ["varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1200x750;", }, { title: "Barangolás a Francia Riviérán", country: "Franciaország", departure: "2026.05.24. - 31.", transport: "bus", hotel: "Hotel**", meals: "Reggeli", price: "318.600 Ft", priceNumber: 318600, temperature: "28°C", duration: "8 nap / 7 éj", badge: "Népszerű", shortDescription: "Mediterrán városok, tengerparti hangulat és francia elegancia.", tags: ["tengerpart", "meleg", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1200x750;", }, { title: "Loire-völgyi kastélyok", country: "Franciaország", departure: "2026.10.23. - 28.", transport: "bus", hotel: "Hotel**/***", meals: "Reggeli", price: "279.600 Ft", priceNumber: 279600, temperature: "22°C", duration: "6 nap / 5 éj", shortDescription: "Kastélyok, francia történelem és romantikus Loire-völgyi tájak.", tags: ["varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1200x750;", }, { title: "Provence és a Francia Riviéra varázsa", country: "Franciaország", departure: "2026.09.27. - 10.04.", transport: "bus", hotel: "Hotel**/***", meals: "Félpanzió", price: "479.800 Ft", priceNumber: 479800, temperature: "27°C", duration: "8 nap / 7 éj", shortDescription: "Provence hangulata és a Riviéra mediterrán szépségei egy körutazáson.", tags: ["tengerpart", "meleg", "varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1200x750;", }, { title: "Görögország antik csodái körutazás", country: "Görögország", departure: "2026.09.25. - 10.01.", transport: "bus", hotel: "Hotel**/***", meals: "Reggeli", price: "289.600 Ft", priceNumber: 289600, temperature: "31°C", duration: "7 nap / 6 éj", shortDescription: "Antik görög emlékek, városnézés és mediterrán hangulat.", tags: ["varosnezes", "meleg", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/sea-4768869_1920.jpg&op=;1200x750;", }, { title: "Görögországi nyaralás Paralián", country: "Görögország", departure: "2026.07.04. - 11.", transport: "bus", hotel: "Hotel**", meals: "Reggeli", price: "254.400 Ft", priceNumber: 254400, temperature: "33°C", duration: "8 nap / 7 éj", badge: "Családbarát", shortDescription: "Tengerparti pihenés Görögországban, kényelmes buszos utazással.", tags: ["tengerpart", "meleg", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/sea-4768869_1920.jpg&op=;1200x750;", }, { title: "Kaukázusi időutazás", country: "Grúzia", departure: "2026.09.27. - 10.02.", transport: "plane", hotel: "Hotel***/*****", meals: "Félpanzió", price: "347.900 Ft", priceNumber: 347900, temperature: "31°C", duration: "6 nap / 5 éj", badge: "Új ajánlat", shortDescription: "Örményország és Grúzia: borok, hegyek, tengerpart és különleges kaukázusi élmények.", tags: ["repulos", "meleg", "termeszet", "tengerpart"], image: "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1200x750;", }, { title: "Grúzia - a Kaukázus kincse", country: "Grúzia", departure: "2026.08.18. - 26.", transport: "plane", hotel: "Hotel***/****", meals: "Félpanzió", price: "469.400 Ft", priceNumber: 469400, temperature: "30°C", duration: "9 nap / 8 éj", shortDescription: "Hegyek, kultúra, borvidékek és grúz vendégszeretet egy repülős körutazáson.", tags: ["repulos", "meleg", "termeszet"], image: "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1200x750;", }, { title: "Hollandia - szélmalmok, csatornák, virágok", country: "Hollandia", departure: "Érdeklődjön", transport: "bus", hotel: "Szállás információ később", meals: "Információ később", price: "Ár hamarosan", priceNumber: 0, temperature: "20°C", duration: "Többnapos út", badge: "Új ajánlat", shortDescription: "Holland városok, csatornák, szélmalmok és virágos élmények.", tags: ["varosnezes", "buszos"], image: "https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;1200x750;", }, ];

const filterOptions = [
  { label: "Tengerpart", key: "tengerpart", icon: <Waves className="w-4 h-4" /> },
  { label: "Városnézés", key: "varosnezes", icon: <Building2 className="w-4 h-4" /> },
  { label: "Természet", key: "termeszet", icon: <Mountain className="w-4 h-4" /> },
  { label: "Olcsó utak", key: "olcso", icon: <Wallet className="w-4 h-4" /> },
  { label: "Buszos utak", key: "buszos", icon: <Bus className="w-4 h-4" /> },
  { label: "Repülős utak", key: "repulos", icon: <Plane className="w-4 h-4" /> },
  { label: "Meleg úti célok", key: "meleg", icon: <Sun className="w-4 h-4" /> },
];

const sortOptions = ["Legnépszerűbb", "Legolcsóbb", "Legmelegebb"];

export default function CategoryOffersPage({
  categorySlug,
  offers,
  onBack,
  onOfferSelect,
}: CategoryOffersPageProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState("Legnépszerűbb");
  const [visibleCount, setVisibleCount] = useState(12);

  const featuredRef = useRef<HTMLDivElement | null>(null);

  const featuredInView = useInView(featuredRef, {
    once: true,
    amount: 0.45,
  });

  useEffect(() => {
    setVisibleCount(12);
  }, [activeFilters, activeSort]);

  const matchesFilter = (offer: Offer, filterKey: string) => {
    if (filterKey === "olcso") {
      return offer.tags.includes("olcso") || offer.priceNumber < 100000;
    }

    if (filterKey === "buszos") return offer.transport === "bus";
    if (filterKey === "repulos") return offer.transport === "plane";

    return offer.tags.includes(filterKey);
  };

  const getFilteredOffers = (filters: string[]) => {
    if (filters.length === 0) return offers;

    return offers.filter((offer) =>
      filters.every((filterKey) => matchesFilter(offer, filterKey))
    );
  };

  const sortOffers = (items: Offer[]) => {
    const sorted = [...items];

    if (activeSort === "Legolcsóbb") {
      return sorted.sort((a, b) => a.priceNumber - b.priceNumber);
    }

    if (activeSort === "Legmelegebb") {
      return sorted.sort((a, b) => {
        const tempA = Number(a.temperature?.replace(/\D/g, "") || 0);
        const tempB = Number(b.temperature?.replace(/\D/g, "") || 0);
        return tempB - tempA;
      });
    }

    return sorted.sort((a, b) => {
      const aScore =
        (a.badge === "Népszerű" ? 3 : 0) +
        (a.guaranteed ? 2 : 0) +
        (a.seatsLeft ? 1 : 0);

      const bScore =
        (b.badge === "Népszerű" ? 3 : 0) +
        (b.guaranteed ? 2 : 0) +
        (b.seatsLeft ? 1 : 0);

      return bScore - aScore;
    });
  };

  const filteredOffers = useMemo(() => {
    return sortOffers(getFilteredOffers(activeFilters));
  }, [activeFilters, activeSort]);

  const filtersWithCounts = useMemo(() => {
    return filterOptions.map((filter) => {
      const nextFilters = activeFilters.includes(filter.key)
        ? activeFilters
        : [...activeFilters, filter.key];

      const count = getFilteredOffers(nextFilters).length;

      return {
        ...filter,
        count,
        active: activeFilters.includes(filter.key),
        disabled: !activeFilters.includes(filter.key) && count === 0,
      };
    });
  }, [activeFilters]);

  const featuredOffer = filteredOffers[0];
  const recommendedOffers = filteredOffers.slice(1, 4);
  const otherOffers = filteredOffers.slice(4, visibleCount);
  const hasMore = visibleCount < filteredOffers.length;

  const toggleFilter = (filterKey: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((item) => item !== filterKey)
        : [...prev, filterKey]
    );
  };

  const getBadgeClass = (badge?: Offer["badge"]) => {
    switch (badge) {
      case "Legjobb ár":
        return "bg-emerald-500";
      case "Népszerű":
        return "bg-gradient-to-r from-[#00c389] to-[#16b8ff]";
      case "Last minute":
        return "bg-orange-500";
      case "Új ajánlat":
        return "bg-blue-500";
      case "Családbarát":
        return "bg-purple-500";
      default:
        return "bg-white/15";
    }
  };

  const categoryData = useMemo(() => {
    return (
      getCategoryBySlug(categorySlug) ?? {
        title: "Utazások",
        subtitle: "Aktuális ajánlatok és inspiráció a következő élményhez.",
        heroImage:
          "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1600x900;",
        stats: [
          { value: `${offers.length}+`, label: "Ajánlat" },
          { value: "10+", label: "Ország" },
          { value: "15 év", label: "Tapasztalat" },
        ],
      }
    );
  }, [categorySlug, offers.length]);

  return (
    <div className="min-h-screen bg-[#f5f9fc]">
      <section className="relative h-[520px] overflow-hidden">
        <img
          src={categoryData.heroImage}
          alt={categoryData.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/88 via-[#07111f]/48 to-[#07111f]/20" />

        <div className="relative z-10 max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20 h-full flex items-end pb-16">
          <div className="max-w-3xl">
            <motion.button
              onClick={onBack}
              className="mb-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              whileHover={{ x: -3 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Vissza a főoldalra</span>
            </motion.button>

            <h1
              className="text-white mb-5"
              style={{
                fontSize: "clamp(2.8rem, 5vw, 5rem)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }}
            >
              {categoryData.title}
            </h1>

            <p className="text-white/85 text-xl leading-relaxed max-w-2xl">
              {categoryData.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              {categoryData.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10"
                >
                  <div className="text-white text-2xl font-bold">{stat.value}</div>
                  <div className="text-white/70 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-14">
        <div className="max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
          <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00c389]/8 text-[#00a878] text-xs font-bold mb-3">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  ÉLMÉNY ALAPÚ SZŰRÉS
                </div>

                <h3 className="text-2xl font-bold text-[#0f172a] mb-1">
                  Milyen utazást keresel?
                </h3>

                <p className="text-gray-500">
                  Több szűrőt is kombinálhatsz. Ami nem adna találatot,
                  automatikusan letiltásra kerül.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {activeFilters.length > 0 && (
                  <button
                    onClick={() => setActiveFilters([])}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f4f7fb] text-sm font-semibold text-[#00a878] hover:bg-white border border-gray-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Szűrők törlése
                  </button>
                )}

                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setActiveSort(sort)}
                      className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                        activeSort === sort
                          ? "bg-[#0f172a] text-white"
                          : "bg-[#f4f7fb] text-gray-600 hover:bg-white border border-gray-100"
                      }`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {filtersWithCounts.map((filter) => (
                <button
                  key={filter.key}
                  disabled={filter.disabled}
                  onClick={() => {
                    if (!filter.disabled) toggleFilter(filter.key);
                  }}
                  className={`group inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                    filter.active
                      ? "bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white shadow-[0_12px_30px_rgba(0,195,137,0.24)]"
                      : filter.disabled
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed opacity-60"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-[#00c389]/40 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)]"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      filter.active
                        ? "bg-white/20"
                        : filter.disabled
                        ? "bg-gray-50"
                        : "bg-[#f4f7fb] text-[#00c389]"
                    }`}
                  >
                    {filter.icon}
                  </span>

                  <span>{filter.label}</span>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      filter.active
                        ? "bg-white/20 text-white"
                        : "bg-[#f4f7fb] text-gray-400"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {featuredOffer && (
        <section className="pt-14">
          <div className="max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
            <motion.div
              ref={featuredRef}
              className="relative rounded-[34px] overflow-hidden min-h-[430px] shadow-[0_22px_70px_rgba(15,23,42,0.11)]"
              whileHover={{ y: -3 }}
            >
              <img
                src={featuredOffer.image}
                alt={featuredOffer.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#07111f]/88 via-[#07111f]/58 to-[#07111f]/18" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.9fr_0.75fr] gap-8 p-8 md:p-10">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/12 backdrop-blur-md text-white text-xs font-semibold border border-white/10 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-[#00c389]" />
                    Neked ajánljuk
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
                      {featuredOffer.country}
                    </div>

                    {featuredOffer.temperature && (
                      <div className="px-3.5 py-1.5 rounded-full bg-[#00c389] text-white text-xs font-semibold">
                        ☀️ {featuredOffer.temperature}
                      </div>
                    )}

                    {featuredOffer.badge && (
                      <div
                        className={`px-3.5 py-1.5 rounded-full text-white text-xs font-semibold ${getBadgeClass(
                          featuredOffer.badge
                        )}`}
                      >
                        {featuredOffer.badge}
                      </div>
                    )}
                  </div>

                  <h2
                    className="text-white mb-4"
                    style={{
                      fontSize: "clamp(2rem, 3.2vw, 3.1rem)",
                      fontWeight: 760,
                      lineHeight: 1.04,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {featuredOffer.title}
                  </h2>

                  <p className="text-white/78 text-base leading-relaxed mb-7 max-w-lg">
                    {featuredOffer.shortDescription ||
                      "A kiválasztott szűrők alapján ezt az ajánlatot emeltük ki neked."}
                  </p>

                  <div className="flex flex-wrap items-center gap-5">
                    <DiscountPrice
                      priceNumber={featuredOffer.priceNumber}
                      start={featuredInView}
                    />

                    <motion.button
                      onClick={() => onOfferSelect(featuredOffer)}
                      className="group px-6 py-4 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white shadow-[0_18px_34px_rgba(0,195,137,0.24)]"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        Részletek
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </motion.button>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2 text-xs">
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/10 text-white/82 backdrop-blur-md">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      18 foglalás az elmúlt 72 órában
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/10 text-white/82 backdrop-blur-md">
                      <Star className="w-3.5 h-3.5 text-[#00c389]" />
                      4.9/5 utasértékelés
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex items-stretch">
                  <div className="w-full rounded-[28px] bg-white/12 backdrop-blur-xl border border-white/15 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="text-white/55 text-xs mb-1">Gyors áttekintés</div>
                        <div className="text-white text-xl font-bold">Mi vár rád?</div>
                      </div>

                      <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-[#00c389]">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <FeatureBox icon={<Calendar />} title="Indulás" value={featuredOffer.departure} compact />
                      <FeatureBox icon={<Clock />} title="Időtartam" value={featuredOffer.duration || "Többnapos út"} compact />
                      <FeatureBox icon={<Utensils />} title="Ellátás" value={featuredOffer.meals || "Információ később"} compact />
                      <FeatureBox icon={<Hotel />} title="Szállás" value={featuredOffer.hotel} compact />
                    </div>

                    <div className="rounded-2xl bg-[#07111f]/35 border border-white/10 p-4 mb-4">
                      <div className="text-white/55 text-xs mb-3">Miért érdemes?</div>

                      <div className="space-y-2">
                        {[
                          "Magyar idegenvezető",
                          "Kényelmes buszos utazás",
                          "Gondosan szervezett program",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 text-white/82 text-sm"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#00c389]/15 text-[#00c389] flex items-center justify-center text-xs">
                              ✓
                            </span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                      <div className="text-white/55 text-xs mb-1">Ajánlott élmény</div>
                      <div className="text-white font-bold">Tengerpart + városnézés</div>
                      <div className="text-white/55 text-xs mt-1">
                        Ideális választás első körutazóknak.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {recommendedOffers.length > 0 && (
        <section className="pt-16">
          <div className="max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
            <SectionHeader
              eyebrow="AJÁNLOTT UTAK"
              title="Ezek passzolnak hozzád legjobban"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedOffers.map((offer, index) => (
                <RecommendedCard
                  key={`recommended-${offer.title}`}
                  offer={offer}
                  index={index}
                  getBadgeClass={getBadgeClass}
                  onOfferSelect={onOfferSelect}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20">
        <div className="max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
          <SectionHeader
            eyebrow="TALÁLATOK"
            title="További ajánlatok"
            subtitle={`${filteredOffers.length} elérhető utazás a kiválasztott szűrők alapján.`}
          />

          <AnimatePresence mode="popLayout">
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {otherOffers.slice(0, 6).map((offer, index) => (
                  <OfferCard
                    key={`${offer.country}-${offer.title}`}
                    offer={offer}
                    index={index}
                    getBadgeClass={getBadgeClass}
                    onOfferSelect={onOfferSelect}
                  />
                ))}
              </div>

              {otherOffers.length > 6 && <FullWidthHelpCTA />}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {otherOffers.slice(6).map((offer, index) => (
                  <OfferCard
                    key={`${offer.country}-${offer.title}-bottom`}
                    offer={offer}
                    index={index + 6}
                    getBadgeClass={getBadgeClass}
                    onOfferSelect={onOfferSelect}
                  />
                ))}
              </div>
            </>
          </AnimatePresence>

          {hasMore && (
            <div className="text-center mt-14">
              <button
                onClick={() => setVisibleCount((prev) => prev + 9)}
                className="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-[#0f172a] font-semibold shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:border-[#00c389]/40 transition-all"
              >
                További ajánlatok betöltése
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DiscountPrice({
  priceNumber,
  start,
}: {
  priceNumber: number;
  start: boolean;
}) {
  if (!priceNumber || priceNumber <= 0) {
    return (
      <div>
        <div className="text-white/60 text-sm mb-2">Induló ár</div>
        <div className="text-white text-4xl font-bold">Ár hamarosan</div>
      </div>
    );
  }

  const originalPrice = Math.round(priceNumber / 0.9);

  return (
    <div className="min-w-[260px]">
      <div className="text-white/60 text-sm mb-2">Akciós ár</div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="relative inline-block">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={start ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ transformOrigin: "left center" }}
            className="absolute left-0 right-0 top-1/2 h-[3px] rounded-full bg-red-500 z-10"
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={start ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.35 }}
            className="text-white/45 text-2xl font-bold"
          >
            {originalPrice.toLocaleString("hu-HU")} Ft
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={
            start
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.9, y: 12 }
          }
          transition={{
            duration: 0.45,
            delay: 0.55,
            type: "spring",
            stiffness: 220,
          }}
          className="flex items-center gap-3"
        >
          <div className="text-white text-5xl font-bold">
            {priceNumber.toLocaleString("hu-HU")} Ft
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -12 }}
            animate={
              start
                ? { opacity: 1, scale: 1, rotate: 0, y: [0, -3, 0] }
                : { opacity: 0, scale: 0, rotate: -12 }
            }
            transition={{
              opacity: { duration: 0.25, delay: 0.85 },
              scale: {
                duration: 0.45,
                delay: 0.85,
                type: "spring",
                stiffness: 260,
              },
              rotate: { duration: 0.45, delay: 0.85 },
              y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white text-sm font-bold shadow-[0_10px_30px_rgba(0,195,137,0.35)]"
          >
            -10%
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={start ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ delay: 1.05, duration: 0.35 }}
        className="text-[#00c389] text-sm font-semibold mt-2"
      >
        Most kedvezményes előfoglalási áron
      </motion.div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
      <div>
        <div className="inline-flex items-center gap-2 text-[#00a878] text-sm font-bold mb-2">
          <TrendingUp className="w-4 h-4" />
          {eyebrow}
        </div>

        <h3 className="text-3xl font-bold text-[#0f172a] mb-2">{title}</h3>
        {subtitle && <p className="text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function FeatureBox({
  icon,
  title,
  value,
  compact = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 ${
        compact ? "p-3.5" : "p-5"
      }`}
    >
      <div className={`${compact ? "w-4 h-4 mb-2" : "w-5 h-5 mb-3"} text-[#00c389]`}>
        {icon}
      </div>
      <div className="text-white/70 text-xs mb-1">{title}</div>
      <div className={`text-white font-semibold ${compact ? "text-sm" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function RecommendedCard({
  offer,
  index,
  getBadgeClass,
  onOfferSelect,
}: {
  offer: Offer;
  index: number;
  getBadgeClass: (badge?: Offer["badge"]) => string;
  onOfferSelect: (offer: Offer) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onOfferSelect(offer)}
      className="relative rounded-[28px] overflow-hidden h-[270px] shadow-[0_14px_40px_rgba(15,23,42,0.08)] group text-left"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -5 }}
    >
      <img
        src={offer.image}
        alt={offer.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/85 via-[#07111f]/30 to-transparent" />

      <div className="absolute top-4 left-4 flex gap-2">
        <span className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold">
          {offer.country}
        </span>

        {offer.badge && (
          <span
            className={`px-3 py-1.5 rounded-full text-white text-xs font-semibold ${getBadgeClass(
              offer.badge
            )}`}
          >
            {offer.badge}
          </span>
        )}
      </div>

      <div className="absolute bottom-5 left-5 right-5">
        <h4 className="text-white text-xl font-bold leading-tight mb-3">
          {offer.title}
        </h4>

        <div className="flex items-center justify-between">
          <div className="text-white/85 text-sm">
            {offer.duration || offer.departure}
          </div>

          <div className="text-white font-bold">{offer.price}</div>
        </div>
      </div>
    </motion.button>
  );
}

function OfferCard({
  offer,
  index,
  getBadgeClass,
  onOfferSelect,
}: {
  offer: Offer;
  index: number;
  getBadgeClass: (badge?: Offer["badge"]) => string;
  onOfferSelect: (offer: Offer) => void;
}) {
  return (
    <motion.div
      layout
      className="group bg-white rounded-[30px] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_60px_rgba(0,195,137,0.12)] transition-all"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.035 }}
      whileHover={{ y: -6 }}
    >
      <button
        type="button"
        onClick={() => onOfferSelect(offer)}
        className="relative h-[240px] overflow-hidden block w-full text-left"
      >
        <motion.img
          src={offer.image}
          alt={offer.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.7 }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/15">
            {offer.country}
          </span>

          {offer.badge && (
            <span
              className={`px-3 py-1.5 rounded-full text-white text-xs font-semibold ${getBadgeClass(
                offer.badge
              )}`}
            >
              {offer.badge}
            </span>
          )}
        </div>

        {offer.temperature && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/90 text-[#0f172a] text-xs font-bold">
            ☀️ {offer.temperature}
          </div>
        )}

        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="text-white text-2xl font-bold leading-tight max-w-xl">
            {offer.title}
          </h3>

          {offer.shortDescription && (
            <p className="text-white/75 text-sm mt-2 line-clamp-2">
              {offer.shortDescription}
            </p>
          )}
        </div>
      </button>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 mb-5">
          <InfoPill icon={<Calendar className="w-4 h-4" />} label={offer.departure} />
          <InfoPill icon={<Clock className="w-4 h-4" />} label={offer.duration || "Többnapos út"} />
          <InfoPill
            icon={offer.transport === "bus" ? <Bus className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
            label={offer.transport === "bus" ? "Buszos út" : "Repülős út"}
          />
          <InfoPill icon={<Utensils className="w-4 h-4" />} label={offer.meals || "Ellátás info"} />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {offer.guaranteed && (
            <MiniBadge icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Garantált indulás" />
          )}

          {offer.additionalDates && (
            <MiniBadge icon={<Calendar className="w-3.5 h-3.5" />} label="Több időpont" />
          )}

          {offer.seatsLeft && (
            <MiniBadge icon={<Users className="w-3.5 h-3.5" />} label={`Már csak ${offer.seatsLeft} hely`} />
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Induló ár</div>

            <div className="text-3xl font-bold bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              {offer.price}
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => onOfferSelect(offer)}
            className="group/btn px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white shadow-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              Részletek
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function FullWidthHelpCTA() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-[40px] mt-10 mb-10"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#0b1830] to-[#10283f]" />
      <div className="absolute -top-20 -right-20 w-[320px] h-[320px] bg-[#00c389]/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-[280px] h-[280px] bg-[#16b8ff]/15 blur-3xl rounded-full" />

      <div className="relative z-10 px-8 md:px-12 py-10 md:py-12 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-[#00c389]" />
            SZEMÉLYRE SZABOTT AJÁNLÁS
          </div>

          <h3
            className="text-white mb-5"
            style={{
              fontSize: "clamp(2rem,4vw,3.5rem)",
              fontWeight: 750,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            Nem tudod melyik utat válaszd?
          </h3>

          <p className="text-white/72 text-lg leading-relaxed max-w-2xl">
            Segítünk megtalálni a hozzád illő utazást ár, időtartam, élmény és úti cél alapján.
            Pár kattintás és már mutatjuk is a legjobb ajánlatokat.
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            {[
              "Tengerpart vagy városnézés",
              "Buszos vagy repülős utak",
              "Legjobb árak",
              "Garantált indulások",
            ].map((item) => (
              <div
                key={item}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/85 text-sm backdrop-blur-md"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 min-w-[320px]">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white/10 border border-white/10 backdrop-blur-xl p-5">
              <div className="text-4xl font-bold text-white mb-2">40+</div>
              <div className="text-white/65 text-sm">Elérhető körutazás</div>
            </div>

            <div className="rounded-3xl bg-white/10 border border-white/10 backdrop-blur-xl p-5">
              <div className="text-4xl font-bold text-white mb-2">10+</div>
              <div className="text-white/65 text-sm">Európai ország</div>
            </div>
          </div>

          <motion.button
            type="button"
            className="group relative overflow-hidden px-7 py-5 rounded-[24px] bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white shadow-[0_20px_50px_rgba(0,195,137,0.28)]"
            whileHover={{
              scale: 1.03,
              boxShadow: "0 25px 60px rgba(0,195,137,0.35)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <span className="relative flex items-center justify-center gap-3 text-lg font-semibold">
              Segíts választani
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function InfoPill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#f5f9fc] px-3 py-2 text-gray-700 min-w-0">
      <span className="text-[#00c389] shrink-0">{icon}</span>
      <span className="text-xs font-semibold truncate">{label}</span>
    </div>
  );
}

function MiniBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00c389]/8 text-[#00a878] text-xs font-bold">
      {icon}
      {label}
    </span>
  );
}
