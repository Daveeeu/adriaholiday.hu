export const TOURS_ROUTE = '/tours';

export const TOUR_MAIN_NAV_ITEMS = [
  { label: 'Ajánlatok', labelKey: 'nav.tours.offers', route: '/tours' },
  {
    label: 'Szervezés alatt partner ajánlatok',
    labelKey: 'nav.tours.partnerOffers',
    route: '/tours/partner-offers',
  },
  {
    label: 'Régiók és csoportok',
    labelKey: 'nav.tours.regionGroups',
    route: '/tours/region-groups',
  },
  {
    label: 'Szezonális ajánlat csoportok',
    labelKey: 'nav.tours.seasonalGroups',
    route: '/tours/seasonal-groups',
  },
  {
    label: 'Felszállási helyek',
    labelKey: 'nav.tours.departurePlaces',
    route: '/tours/departure-places',
  },
] as const;

export const TOUR_REGION_GROUP_TYPES = [
  { value: 'region', label: 'Régió' },
  { value: 'group', label: 'Csoport' },
] as const;

export const TOUR_SEASONAL_MENU_TYPES = [
  { value: 'intro', label: 'Bevezető utak' },
  { value: 'request', label: 'Ajánlatkérő utak' },
  { value: 'featured', label: 'Híres menüben' },
  { value: 'travel', label: 'Utazási ajánlatok' },
  { value: 'icon', label: 'Ikonalapúakat' },
] as const;

export const TOUR_REGION_OPTIONS = [
  { value: '1', label: 'Itália' },
  { value: '2', label: 'Franciaország' },
  { value: '3', label: 'Balkán' },
] as const;

export const TOUR_GROUP_OPTIONS = [
  { value: '10', label: 'Klasszikus körutak' },
  { value: '11', label: 'Szezonális utak' },
  { value: '12', label: 'Őszi különlegességek' },
] as const;

export const TOUR_SEASONAL_GROUP_OPTIONS = [
  { value: '20', label: 'Bevezető utak' },
  { value: '21', label: 'Ajánlatkérő utak' },
  { value: '22', label: 'Híres menüben' },
] as const;

export const TOUR_DEPARTURE_PLACE_OPTIONS = [
  { value: '1', label: 'Budapest' },
  { value: '2', label: 'Szeged' },
  { value: '3', label: 'Pécs' },
] as const;

export const TOUR_PROGRAM_TYPE_OPTIONS = [
  { value: 'classic-tour', label: 'Klasszikus körút' },
  { value: 'city-break', label: 'City break' },
  { value: 'road-trip', label: 'Road trip' },
] as const;

export const TOUR_TRAVEL_MODE_OPTIONS = [
  { value: 'bus', label: 'Busz' },
  { value: 'plane', label: 'Repülő' },
  { value: 'train', label: 'Vonat' },
] as const;

export const TOUR_DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Könnyű' },
  { value: 'medium', label: 'Közepes' },
  { value: 'hard', label: 'Nehéz' },
] as const;

export const TOUR_PARTNER_OFFER_STATUSES = [
  { value: 'new', label: 'Új' },
  { value: 'contacted', label: 'Felvett kapcsolat' },
  { value: 'offer_sent', label: 'Ajánlat elküldve' },
  { value: 'won', label: 'Megnyert' },
  { value: 'lost', label: 'Elvesztett' },
] as const;

export const TOUR_DATE_STATUSES = [
  { value: 'planned', label: 'Tervezett' },
  { value: 'available', label: 'Elérhető' },
  { value: 'sold_out', label: 'Betelt' },
] as const;

export const TOUR_BOOLEAN_LABELS = {
  true: 'Igen',
  false: 'Nem',
} as const;

export const TOUR_DEFAULT_SORT_BY = 'sortOrder';

export function slugifyTourText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
