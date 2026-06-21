import { Building2, Globe2, MapPinned, Ticket, type LucideIcon } from 'lucide-react';

export type ApartmentModuleTabKey =
  | 'apartments'
  | 'greek-apartments'
  | 'bulgarian-apartments'
  | 'montenegrin-apartments'
  | 'croatian-apartments'
  | 'croatian-apartments-new'
  | 'croatian-texts'
  | 'regions'
  | 'locations'
  | 'types'
  | 'services'
  | 'promotions'
  | 'custom-intervals';

export type ApartmentModuleTab = {
  key: ApartmentModuleTabKey;
  label: string;
  to?: string;
  disabled?: boolean;
  icon?: LucideIcon;
};

export const apartmentModuleTabs: ApartmentModuleTab[] = [
  { key: 'apartments', label: 'Apartmanok', to: '/apartments', icon: Building2 },
  { key: 'greek-apartments', label: 'Görög Apartmanok', disabled: true, icon: Globe2 },
  { key: 'bulgarian-apartments', label: 'Bulgáriai Apartmanok', disabled: true, icon: Globe2 },
  { key: 'montenegrin-apartments', label: 'Montenegró Apartmanok', disabled: true, icon: Globe2 },
  { key: 'croatian-apartments', label: 'Horvát Apartmanok', to: '/apartments', icon: MapPinned },
  { key: 'croatian-apartments-new', label: 'Horvát Apartmanok (új)', disabled: true, icon: MapPinned },
  { key: 'croatian-texts', label: 'Horvát szövegek', disabled: true, icon: Ticket },
  { key: 'regions', label: 'Régiók', to: '/regions', icon: Globe2 },
  { key: 'locations', label: 'Helyek', to: '/locations', icon: MapPinned },
  { key: 'types', label: 'Típusok', disabled: true, icon: Building2 },
  { key: 'services', label: 'Szolgáltatások', disabled: true, icon: Ticket },
  { key: 'promotions', label: 'Akciók', to: '/homepage-offers', icon: Ticket },
  { key: 'custom-intervals', label: 'Egyedi intervallumok', disabled: true, icon: Ticket },
];

export type ApartmentServiceGroup = {
  key: string;
  label: string;
  services: Array<{
    key: string;
    label: string;
  }>;
};

export const apartmentServiceGroups: ApartmentServiceGroup[] = [
  {
    key: 'comfort',
    label: 'Komfort és felszereltség',
    services: [
      { key: 'bathroom-shower', label: 'Fürdőszoba zuhanyzóval' },
      { key: 'bathroom-cabin', label: 'Fürdőszoba zuhanykabinnal' },
      { key: 'air-conditioning', label: 'Légkondicionáló' },
      { key: 'heating', label: 'Fűtés' },
      { key: 'elevator', label: 'Lift' },
      { key: 'safe', label: 'Széf' },
      { key: 'tv', label: 'Tv' },
      { key: 'satellite-tv', label: 'Satellit tv' },
      { key: 'wifi', label: 'Wifi' },
      { key: 'internet-access', label: 'Internet hozzáférés' },
      { key: 'fireplace', label: 'Kandalló' },
      { key: 'soundproof-door', label: 'Blindált ajtó' },
      { key: 'hairdryer', label: 'Hajszárító' },
    ],
  },
  {
    key: 'parking-and-access',
    label: 'Parkolás és hozzáférés',
    services: [
      { key: 'covered-parking', label: 'Fedett parkolóhely' },
      { key: 'outdoor-parking', label: 'Külső parkolóhely' },
      { key: 'garage', label: 'Garázs' },
      { key: 'disabled-access', label: 'Mozgássérültek részére alkalmas' },
      { key: 'lift-access', label: 'Liftes megközelítés' },
    ],
  },
  {
    key: 'outdoor-and-leisure',
    label: 'Kültér és szabadidő',
    services: [
      { key: 'pool', label: 'Szabadtéri medence' },
      { key: 'sea-view', label: 'Tengerre néző' },
      { key: 'garden', label: 'Kert' },
      { key: 'private-garden', label: 'Magán kert' },
      { key: 'sun-terrace', label: 'Napos terasz' },
      { key: 'bbq', label: 'Barbecue' },
      { key: 'playground', label: 'Gyermek játszótér' },
      { key: 'animation', label: 'Animációs program' },
      { key: 'kids-games', label: 'Játékok gyerekeknek' },
      { key: 'beach-service', label: 'Strandszervíz' },
    ],
  },
  {
    key: 'services',
    label: 'Szolgáltatások és extra',
    services: [
      { key: 'laundry', label: 'Mosoda' },
      { key: 'cleaning', label: 'Takarítás' },
      { key: 'linen-paid', label: 'Ágynemű szolgáltatás térítés ellenében' },
      { key: 'coffee-machine', label: 'Kávéfőzőgép' },
      { key: 'microwave', label: 'Mikrohullámú sütő' },
      { key: 'refrigerator', label: 'Hűtőszekrény' },
      { key: 'dryer', label: 'Szárítógép' },
      { key: 'pet-friendly-small', label: 'Kis méretű háziállat bevihető' },
      { key: 'pet-friendly', label: 'Háziállat bevihető' },
      { key: 'long-stay', label: 'Longstay' },
      { key: 'new', label: 'New!' },
      { key: 'under-renovation', label: 'Felújítás alatt' },
      { key: 'partly-renovated', label: 'Részben felújított' },
      { key: 'fully-renovated', label: 'Teljesen felújított' },
      { key: 'guest-kitchen', label: 'Közös konyha' },
      { key: 'private-kitchen', label: 'Saját konyha' },
      { key: 'open-restaurant', label: 'Étkező / étterem nyitva' },
      { key: 'wireless-internet-new', label: 'Internet Wireless' },
      { key: 'direct-sea-access', label: 'Tengerparti közvetlen elérés' },
    ],
  },
];

export const apartmentPricingMatrixConfig = {
  columns: 10,
  rows: 8,
};

export const apartmentTypeOptions = [
  { value: 'studio', label: 'Stúdió' },
  { value: 'one_bedroom', label: '1 hálószoba' },
  { value: 'two_bedroom', label: '2 hálószoba' },
  { value: 'villa', label: 'Villa' },
  { value: 'penthouse', label: 'Penthouse' },
] as const;
