export type ApartmentAdminRouteDefinition = {
  route: string;
  labelKey: string;
};

export const APARTMENT_LIST_ROUTE = '/apartments';

/**
 * Slugs reserved by the static /apartments/* sub-routes below (and the
 * /apartments/:typeSlug/{new,detail} segments) — a dynamic type slug matching
 * one of these would never be reachable. Mirrored server-side by
 * ApartmentType::RESERVED_SLUGS.
 */
export const APARTMENT_RESERVED_TYPE_SLUGS = [
  'regions',
  'places',
  'types',
  'services',
  'actions',
  'custom-intervals',
  'new',
  'detail',
] as const;

export const APARTMENT_ADMIN_ROUTES = [
  { route: '/apartments/regions', labelKey: 'nav.apartments.regions' },
  { route: '/apartments/places', labelKey: 'nav.apartments.places' },
  { route: '/apartments/types', labelKey: 'nav.apartments.types' },
  { route: '/apartments/services', labelKey: 'nav.apartments.services' },
  { route: '/apartments/actions', labelKey: 'nav.apartments.actions' },
  {
    route: '/apartments/custom-intervals',
    labelKey: 'nav.apartments.customIntervals',
  },
] as const satisfies readonly ApartmentAdminRouteDefinition[];

export function getApartmentListRoute(type?: string | null) {
  if (!type) {
    return APARTMENT_LIST_ROUTE;
  }

  return `${APARTMENT_LIST_ROUTE}/${type}`;
}

export function getApartmentCreateRoute(type?: string | null) {
  return `${getApartmentListRoute(type)}/new`;
}

export function getApartmentDetailRoute(
  apartmentId: string,
  type?: string | null,
) {
  return `${getApartmentListRoute(type)}/detail/${apartmentId}`;
}

export function getApartmentEditRoute(
  apartmentId: string,
  type?: string | null,
) {
  return `${getApartmentDetailRoute(apartmentId, type)}/edit`;
}
