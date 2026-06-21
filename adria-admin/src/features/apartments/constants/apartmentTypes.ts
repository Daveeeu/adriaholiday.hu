import type { Apartment } from '@/types/domain';

export type ApartmentType = Apartment['type'];

export type ApartmentTypeDefinition = {
  value: ApartmentType;
  label: string;
  formLabel: string;
  route: string;
  navLabelKey: string;
};

export type ApartmentAdminRouteDefinition = {
  route: string;
  labelKey: string;
};

export const APARTMENT_LIST_ROUTE = '/apartments';
export const APARTMENT_TYPE_VALUES = [
  'greek',
  'bulgarian',
  'montenegro',
  'croatian',
  'croatian_new',
] as const satisfies readonly ApartmentType[];

export const APARTMENT_TYPES = [
  {
    value: 'greek',
    label: 'Görög apartmanok',
    formLabel: 'Görög apartman',
    route: '/apartments/greek',
    navLabelKey: 'nav.apartments.greek',
  },
  {
    value: 'bulgarian',
    label: 'Bulgáriai apartmanok',
    formLabel: 'Bulgáriai apartman',
    route: '/apartments/bulgarian',
    navLabelKey: 'nav.apartments.bulgarian',
  },
  {
    value: 'montenegro',
    label: 'Montenegró apartmanok',
    formLabel: 'Montenegrói apartman',
    route: '/apartments/montenegro',
    navLabelKey: 'nav.apartments.montenegro',
  },
  {
    value: 'croatian',
    label: 'Horvát apartmanok',
    formLabel: 'Horvát apartman',
    route: '/apartments/croatian',
    navLabelKey: 'nav.apartments.croatian',
  },
  {
    value: 'croatian_new',
    label: 'Horvát apartmanok (új)',
    formLabel: 'Horvát apartman (új)',
    route: '/apartments/croatian-new',
    navLabelKey: 'nav.apartments.croatian_new',
  },
] as const satisfies readonly ApartmentTypeDefinition[];

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

export const APARTMENT_TYPE_DEFAULT_DIMENSIONS = {
  greek: { bedrooms: 1, bathrooms: 1, maxGuests: 2, sizeM2: 52 },
  bulgarian: { bedrooms: 2, bathrooms: 1, maxGuests: 4, sizeM2: 68 },
  montenegro: { bedrooms: 2, bathrooms: 2, maxGuests: 5, sizeM2: 78 },
  croatian: { bedrooms: 3, bathrooms: 2, maxGuests: 6, sizeM2: 98 },
  croatian_new: { bedrooms: 4, bathrooms: 3, maxGuests: 8, sizeM2: 132 },
} satisfies Record<ApartmentType, { bedrooms: number; bathrooms: number; maxGuests: number; sizeM2: number }>;

export function getApartmentTypeDefinition(type?: ApartmentType | string) {
  return APARTMENT_TYPES.find((item) => item.value === type);
}

export function getApartmentDimensions(type: ApartmentType) {
  return APARTMENT_TYPE_DEFAULT_DIMENSIONS[type];
}

export function getApartmentTypeByRoute(pathname: string) {
  return APARTMENT_TYPES.find((item) => pathname === item.route);
}

export function getApartmentTypeFromPath(pathname: string) {
  return getApartmentRouteContext(pathname)?.type ?? null;
}

export function getApartmentListRoute(type?: ApartmentType | '' | null) {
  if (!type) {
    return APARTMENT_LIST_ROUTE;
  }

  return getApartmentTypeDefinition(type)?.route ?? APARTMENT_LIST_ROUTE;
}

export function getApartmentCreateRoute(type?: ApartmentType | '' | null) {
  return `${getApartmentListRoute(type)}/new`;
}

export function getApartmentDetailRoute(
  apartmentId: string,
  type?: ApartmentType | '' | null,
) {
  return `${getApartmentListRoute(type)}/detail/${apartmentId}`;
}

export function getApartmentEditRoute(
  apartmentId: string,
  type?: ApartmentType | '' | null,
) {
  return `${getApartmentDetailRoute(apartmentId, type)}/edit`;
}

export function getApartmentRouteContext(pathname: string) {
  const cleaned = pathname.replace(/\/+$/, '') || '/';

  if (!cleaned.startsWith('/apartments')) {
    return null;
  }

  const segments = cleaned.split('/').filter(Boolean);
  const tail = segments.slice(1);
  const type = tail.length > 0 ? getApartmentTypeByRoute(`/apartments/${tail[0]}`) : undefined;
  const rest = type ? tail.slice(1) : tail;

  if (!type && rest.length === 0) {
    return { mode: 'list' as const, type: null, apartmentId: null };
  }

  if (!type && rest[0] === 'new' && rest.length === 1) {
    return { mode: 'create' as const, type: null, apartmentId: null };
  }

  if (!type && rest[0] === 'detail' && rest.length >= 2) {
    return {
      mode: rest[2] === 'edit' ? ('edit' as const) : ('detail' as const),
      type: null,
      apartmentId: rest[1],
    };
  }

  if (type && rest.length === 0) {
    return { mode: 'list' as const, type: type.value, apartmentId: null };
  }

  if (type && rest[0] === 'new' && rest.length === 1) {
    return { mode: 'create' as const, type: type.value, apartmentId: null };
  }

  if (type && rest[0] === 'detail' && rest.length >= 2) {
    return {
      mode: rest[2] === 'edit' ? ('edit' as const) : ('detail' as const),
      type: type.value,
      apartmentId: rest[1],
    };
  }

  return null;
}
