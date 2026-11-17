import { z } from 'zod';

import { createClientId } from '@/lib/client-id';
import {
  galleryItemFormSchema,
  toGalleryItemFormValue,
} from '@/components/media/gallery-items';
import type { MediaAsset } from '@/services/media-service';

import type {
  TOUR_DATE_STATUSES,
  TOUR_PARTNER_OFFER_STATUSES,
  TOUR_REGION_GROUP_TYPES,
  TOUR_SEASONAL_MENU_TYPES,
} from './tours.constants';
import { slugifyTourText } from './tours.constants';

export type TourDateStatus = (typeof TOUR_DATE_STATUSES)[number]['value'];
export type TourPartnerOfferStatus =
  (typeof TOUR_PARTNER_OFFER_STATUSES)[number]['value'];
export type TourRegionGroupType =
  (typeof TOUR_REGION_GROUP_TYPES)[number]['value'];
export type TourSeasonalMenuType =
  (typeof TOUR_SEASONAL_MENU_TYPES)[number]['value'];

export type TourExtraPriceUnit = 'per_person' | 'per_booking';

/** HUF is charged with the booking; any other currency is paid on site. */
export type TourExtraCurrency = 'HUF' | 'EUR';

/**
 * optional: charged when the customer selects it; mandatory: always charged;
 * solo_traveller: charged automatically when exactly one passenger travels.
 */
export type TourExtraChargeRule = 'optional' | 'mandatory' | 'solo_traveller';

/** A priced supplement ("felár") offered on a tour date. */
export type TourDateExtra = {
  id: number;
  name: string;
  price: number;
  currency: TourExtraCurrency;
  priceUnit: TourExtraPriceUnit;
  chargeRule: TourExtraChargeRule;
  choices: string[];
  sortOrder: number;
};

export type TourDate = {
  id: string;
  startDate: string;
  endDate: string;
  price: string;
  displayedPrice?: string | null;
  priceBox?: TourPriceBox | null;
  status: TourDateStatus;
  /** The most passengers the date takes; null: no limit. */
  capacity?: number | null;
  /** Passengers of the date's bookings not cancelled or expired. */
  seatsHeld?: number;
  /** Capacity less the seats held; null when the date has no limit. */
  freeSeats?: number | null;
  departurePlaceIds?: number[];
  /** The date's own stay; empty: the tour's. */
  accommodation?: string | null;
  accommodationInfo?: string | null;
  catering?: string | null;
  cateringInfo?: string | null;
  /** Listed in the partner XML feeds. */
  xmlEnabled?: boolean;
  /** The date's accommodation and room in the Cesys feed. */
  partnerXml?: {
    cesysAccommodation?: string | null;
    cesysRoom?: string | null;
  } | null;
  extras?: TourDateExtra[];
};

/** A tour's settings for the partner XML feeds (Travelgate, Travelmax, Cesys and the general one). */
export type TourPartnerXml = {
  country_id: number | null;
  country_name: string | null;
  accommodation_name: string | null;
  city: string | null;
  insurance_value: number | null;
  accommodation_description_travelmax: string | null;
  travel_types: {
    general: number | null;
    travelgate: number | null;
    cesys: number | null;
    travelmax: number[];
  };
};

/** A place on the tour's route map, in travel order; accommodations are drawn in red. */
export type TourRouteStop = {
  name: string;
  latitude: number;
  longitude: number;
  accommodation: boolean;
};

export type TourRouteStopFormValue = TourRouteStop & {
  clientId: string;
};

/** A place the place search found, to add as a route stop. */
export type RouteStopPlace = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
};

export type TourPriceItemType = 'included' | 'excluded';

export type TourPriceItem = {
  id: string;
  type: TourPriceItemType;
  text: string;
  sortOrder: number;
  active: boolean;
};

export type TourPriceItemFormValue = {
  clientId: string;
  type: TourPriceItemType;
  text: string;
  sortOrder: number;
  active: boolean;
};

export type TourPriceBox = {
  price: number | null;
  /** Written by the site from the price, e.g. "276.900 Ft / fő". */
  displayedPrice: string | null;
  currency: string | null;
  priceSuffix: string | null;
  discountBadge: string | null;
  discountText: string | null;
  /** Dates only: the pre-promotion price, shown struck through. */
  originalPrice?: number | null;
  /** Dates only: a short note shown with the price ("Előfoglalási akció"). */
  label?: string | null;
};

export type TourPriceBoxFormValue = {
  price: string;
  currency: string;
  priceSuffix: string;
  discountBadge: string;
  discountText: string;
};

export type TourProgramDayBadge = {
  id: string;
  text: string;
};

export type TourProgramDay = {
  id: string | number;
  sortOrder: number;
  dayNumber: number;
  title: string;
  description: string;
  image: string;
  icon: string;
  experienceType: string;
  badges: string[];
  active: boolean;
};

export type TourProgramDayBadgeFormValue = {
  clientId: string;
  text: string;
};

export type TourProgramDayFormValue = {
  id?: string | number;
  clientId: string;
  sortOrder: number;
  dayNumber: number;
  title: string;
  description: string;
  image: string;
  icon: string;
  experienceType: string;
  badges: TourProgramDayBadgeFormValue[];
  active: boolean;
};

export type TourGalleryItem = {
  id: string | number;
  mediaId: string | number;
  image: MediaAsset | null;
  title: string;
  alt: string;
  caption: string;
  sortOrder: number;
  active: boolean;
};

export type TourGalleryItemFormValue = {
  clientId: string;
  mediaId: string;
  image: string;
  title: string;
  alt: string;
  caption: string;
  sortOrder: number;
  active: boolean;
  media?: MediaAsset | null;
};

export type SelectOption = {
  id: string;
  value: string;
  label: string;
};

export type Tour = {
  id: string;
  sortOrder: number;
  active: boolean;
  /** Shown in the offer lists; off, the tour is live only on its own page. */
  listed?: boolean;
  featured: boolean;
  /** Position among the homepage's featured offers. */
  featuredOrder: number | null;
  recommended: boolean;
  xmlEnabled: boolean;
  partnerXml?: TourPartnerXml | null;
  /** What each empty partner setting follows from the tour (saved tours only). */
  partnerXmlDefaults?: TourPartnerXml | null;
  couponable: boolean;
  name: string;
  subtitle?: string | null;
  seoName: string;
  seoAutoGenerate: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoRobots?: string | null;
  listDescription: string;
  shortDescription: string;
  searchKeywords?: string[];
  programBefore: string;
  program: string;
  programFooter?: string | null;
  routeStops?: TourRouteStop[];
  inclusions: string;
  paymentProgram: string;
  teaser: string;
  tickets: string;
  optionalPrograms: string;
  prices: string;
  discounts: string;
  notes: string;
  galleryTitle?: string | null;
  gallerySubtitle?: string | null;
  gallery?: TourGalleryItem[];
  programDays: TourProgramDay[];
  priceItems: TourPriceItem[];
  regionId: string;
  regionLabel?: string | null;
  departurePlaceIds: number[];
  createdAt?: string | null;
  updatedAt?: string | null;
  lastBookingAt?: string | null;
  bookingsCount?: number;
  nextDepartureDate?: string | null;
  departurePlaces?: TourDeparturePlace[];
  countryIds: string[];
  countries?: SelectOption[];
  tagIds: string[];
  tags?: SelectOption[];
  categoryIds: string[];
  categories?: SelectOption[];
  programTypeId: string;
  programTypeLabel?: string | null;
  travelModeId: string;
  travelModeLabel?: string | null;
  catering?: string | null;
  cateringInfo?: string | null;
  accommodation?: string | null;
  accommodationInfo?: string | null;
  bookingFormTemplateId?: string | number | null;
  bookingFormTemplate?: {
    id: string | number;
    name: string;
    slug: string;
  } | null;
  price: string;
  displayedPrice: string;
  priceBox: TourPriceBox;
  dates: TourDate[];
  sliderText: string;
};

export type TourDetail = Tour;

export const tourFormSchema = z.object({
  sortOrder: z.coerce.number().int().min(0),
  active: z.boolean(),
  listed: z.boolean(),
  featured: z.boolean(),
  featuredOrder: z
    .string()
    .trim()
    .regex(/^\d{0,3}$/, 'Adj meg egy 0 és 999 közötti számot.'),
  recommended: z.boolean(),
  xmlEnabled: z.boolean(),
  partnerXml: z.object({
    country_id: z.string(),
    country_name: z.string().trim().max(255, 'Legfeljebb 255 karakter.'),
    accommodation_name: z.string().trim().max(255, 'Legfeljebb 255 karakter.'),
    city: z.string().trim().max(255, 'Legfeljebb 255 karakter.'),
    insurance_value: z
      .string()
      .trim()
      .regex(/^\d*$/, 'Egész számot adj meg (Ft/fő/nap).'),
    accommodation_description_travelmax: z.string(),
    travel_types: z.object({
      general: z.string(),
      travelgate: z.string(),
      cesys: z.string(),
      travelmax: z.array(z.string()),
    }),
  }),
  couponable: z.boolean(),
  name: z
    .string()
    .min(2, 'A név megadása kötelező.')
    .max(255, 'Legfeljebb 255 karakter.'),
  subtitle: z.string(),
  seoName: z.string(),
  seoAutoGenerate: z.boolean(),
  seoTitle: z.string().trim().max(255, 'Legfeljebb 255 karakter.'),
  seoDescription: z.string().trim().max(1000, 'Legfeljebb 1000 karakter.'),
  seoRobots: z.string(),
  listDescription: z.string(),
  shortDescription: z.string(),
  searchKeywords: z.array(z.string()),
  programBefore: z.string(),
  program: z.string(),
  programFooter: z.string(),
  routeStops: z.array(
    z.object({
      clientId: z.string(),
      name: z
        .string()
        .trim()
        .min(1, 'Add meg a megálló nevét.')
        .max(60, 'Legfeljebb 60 karakter.'),
      latitude: z.number(),
      longitude: z.number(),
      accommodation: z.boolean(),
    }),
  ),
  inclusions: z.string(),
  paymentProgram: z.string(),
  teaser: z.string(),
  tickets: z.string(),
  optionalPrograms: z.string(),
  prices: z.string(),
  discounts: z.string(),
  notes: z.string(),
  galleryTitle: z.string(),
  gallerySubtitle: z.string(),
  gallery: z.array(galleryItemFormSchema),
  priceBox: z.object({
    price: z.string(),
    currency: z.string(),
    priceSuffix: z.string(),
    discountBadge: z.string(),
    discountText: z.string(),
  }),
  programDays: z.array(
    z.object({
      id: z.union([z.string(), z.number()]).optional(),
      clientId: z.string(),
      sortOrder: z.coerce.number().int().min(0),
      dayNumber: z.coerce.number().int().min(1),
      title: z.string(),
      description: z.string(),
      image: z.string(),
      icon: z.string(),
      experienceType: z.string(),
      badges: z.array(
        z.object({
          clientId: z.string(),
          text: z.string(),
        }),
      ),
      active: z.boolean(),
    }),
  ),
  priceItems: z.array(
    z.object({
      clientId: z.string(),
      type: z.enum(['included', 'excluded']),
      text: z.string(),
      sortOrder: z.coerce.number().int().min(0),
      active: z.boolean(),
    }),
  ),
  regionId: z.string(),
  departurePlaceIds: z.array(z.string()),
  /** Per-tour fee by departure place id; empty uses the place's general fee. */
  departurePlaceFees: z.record(
    z.string(),
    z
      .string()
      .trim()
      .regex(/^(\d+(\.\d+)?)?$/, 'Adj meg egy nem negatív összeget.'),
  ),
  countryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
  programTypeId: z.string(),
  travelModeId: z.string(),
  catering: z.string().trim().max(255, 'Legfeljebb 255 karakter.'),
  cateringInfo: z.string().trim().max(2000, 'Legfeljebb 2000 karakter.'),
  accommodation: z.string().trim().max(255, 'Legfeljebb 255 karakter.'),
  accommodationInfo: z.string().trim().max(2000, 'Legfeljebb 2000 karakter.'),
  bookingFormTemplateId: z.string(),
  price: z.string(),
  sliderText: z.string(),
  dates: z.array(
    z.object({
      id: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      price: z.string(),
      status: z.enum(['available', 'sold_out', 'cancelled']),
      departurePlaceIds: z.array(z.string()),
      accommodation: z.string().trim().max(255, 'Legfeljebb 255 karakter.'),
      accommodationInfo: z
        .string()
        .trim()
        .max(2000, 'Legfeljebb 2000 karakter.'),
      catering: z.string().trim().max(255, 'Legfeljebb 255 karakter.'),
      cateringInfo: z.string().trim().max(2000, 'Legfeljebb 2000 karakter.'),
      xmlEnabled: z.boolean(),
      partnerXml: z.object({
        cesysAccommodation: z
          .string()
          .trim()
          .max(255, 'Legfeljebb 255 karakter.'),
        cesysRoom: z.string().trim().max(255, 'Legfeljebb 255 karakter.'),
      }),
      priceBox: z.object({
        price: z.string(),
        discountBadge: z.string(),
        originalPrice: z
          .string()
          .trim()
          .regex(/^(\d+(\.\d+)?)?$/, 'Adj meg egy nem negatív árat.'),
        label: z.string().trim().max(64, 'Legfeljebb 64 karakter.'),
      }),
      capacity: z
        .string()
        .trim()
        .regex(/^\d*$/, 'Adj meg egy nem negatív egész számot.'),
      extras: z.array(
        z.object({
          clientId: z.string(),
          name: z.string().trim().min(1, 'A felár neve kötelező.'),
          price: z
            .string()
            .trim()
            .regex(/^\d+(\.\d+)?$/, 'Adj meg egy nem negatív árat.'),
          currency: z.enum(['HUF', 'EUR']),
          priceUnit: z.enum(['per_person', 'per_booking']),
          chargeRule: z.enum(['optional', 'mandatory', 'solo_traveller']),
          /** One choice per line. */
          choices: z.string(),
        }),
      ),
    }),
  ),
});

export type TourFormValues = z.infer<typeof tourFormSchema>;

function optionalNumber(value: number | null | undefined): string {
  return value != null ? String(value) : '';
}

/**
 * The partner settings as the editor shows them: each stored one, else the
 * default the API derives from the tour (stored empty again on save while
 * left unchanged, so it keeps following the tour).
 */
function partnerXmlFormValues(
  settings?: TourPartnerXml | null,
  defaults?: TourPartnerXml | null,
): TourFormValues['partnerXml'] {
  const pick = <T>(
    stored: T | null | undefined,
    fallback: T | null | undefined,
  ) => stored ?? fallback ?? null;
  const types = settings?.travel_types;
  const defaultTypes = defaults?.travel_types;
  const travelmax = types?.travelmax?.length
    ? types.travelmax
    : (defaultTypes?.travelmax ?? []);

  return {
    country_id: optionalNumber(
      pick(settings?.country_id, defaults?.country_id),
    ),
    country_name: pick(settings?.country_name, defaults?.country_name) ?? '',
    accommodation_name:
      pick(settings?.accommodation_name, defaults?.accommodation_name) ?? '',
    city: pick(settings?.city, defaults?.city) ?? '',
    insurance_value: optionalNumber(
      pick(settings?.insurance_value, defaults?.insurance_value),
    ),
    accommodation_description_travelmax:
      pick(
        settings?.accommodation_description_travelmax,
        defaults?.accommodation_description_travelmax,
      ) ?? '',
    travel_types: {
      general: optionalNumber(pick(types?.general, defaultTypes?.general)),
      travelgate: optionalNumber(
        pick(types?.travelgate, defaultTypes?.travelgate),
      ),
      cesys: optionalNumber(pick(types?.cesys, defaultTypes?.cesys)),
      travelmax: travelmax.map(String),
    },
  };
}

export function mapTourToFormValues(
  tour?: Partial<Tour> | null,
): TourFormValues {
  const dates = (tour?.dates ?? []).map((date) => ({
    id: date.id ?? createClientId(),
    startDate: date.startDate ?? '',
    endDate: date.endDate ?? '',
    price: date.price ?? '',
    status: date.status ?? 'available',
    departurePlaceIds: (date.departurePlaceIds ?? []).map(String),
    accommodation: date.accommodation ?? '',
    accommodationInfo: date.accommodationInfo ?? '',
    catering: date.catering ?? '',
    cateringInfo: date.cateringInfo ?? '',
    xmlEnabled: date.xmlEnabled ?? true,
    partnerXml: {
      cesysAccommodation: date.partnerXml?.cesysAccommodation ?? '',
      cesysRoom: date.partnerXml?.cesysRoom ?? '',
    },
    priceBox: {
      price: date.priceBox?.price?.toString() ?? '',
      discountBadge: date.priceBox?.discountBadge ?? '',
      originalPrice: date.priceBox?.originalPrice?.toString() ?? '',
      label: date.priceBox?.label ?? '',
    },
    capacity: date.capacity?.toString() ?? '',
    extras: (date.extras ?? []).map((extra) => ({
      clientId: createClientId(),
      name: extra.name,
      price: extra.price.toString(),
      currency: extra.currency ?? 'HUF',
      priceUnit: extra.priceUnit,
      chargeRule: extra.chargeRule,
      choices: extra.choices.join('\n'),
    })),
  }));

  const programDays = (tour?.programDays ?? []).map((day, index) => ({
    id: day.id,
    clientId: createClientId(),
    sortOrder: day.sortOrder ?? index + 1,
    dayNumber: day.dayNumber ?? index + 1,
    title: day.title ?? '',
    description: day.description ?? '',
    image: day.image ?? '',
    icon: day.icon ?? '',
    experienceType: day.experienceType ?? '',
    badges: (day.badges ?? []).map((badge, badgeIndex) => ({
      clientId: `${day.id ?? index}-${badgeIndex + 1}`,
      text: badge ?? '',
    })),
    active: day.active ?? true,
  }));

  return {
    sortOrder: tour?.sortOrder ?? 1,
    active: tour?.active ?? true,
    listed: tour?.listed ?? true,
    featured: tour?.featured ?? false,
    featuredOrder: tour?.featuredOrder?.toString() ?? '',
    recommended: tour?.recommended ?? false,
    xmlEnabled: tour?.xmlEnabled ?? true,
    partnerXml: partnerXmlFormValues(
      tour?.partnerXml,
      tour?.partnerXmlDefaults,
    ),
    couponable: tour?.couponable ?? false,
    name: tour?.name ?? '',
    subtitle: tour?.subtitle ?? '',
    seoName: tour?.seoName ?? slugifyTourText(tour?.name ?? ''),
    seoAutoGenerate: tour?.seoAutoGenerate ?? true,
    seoTitle: tour?.seoTitle ?? '',
    seoDescription: tour?.seoDescription ?? '',
    seoRobots: tour?.seoRobots ?? '',
    listDescription: tour?.listDescription ?? '',
    shortDescription: tour?.shortDescription ?? '',
    searchKeywords: tour?.searchKeywords ?? [],
    programBefore: tour?.programBefore ?? '',
    program: tour?.program ?? '',
    programFooter: tour?.programFooter ?? '',
    routeStops: (tour?.routeStops ?? []).map((stop) => ({
      ...stop,
      clientId: createClientId(),
    })),
    inclusions: tour?.inclusions ?? '',
    paymentProgram: tour?.paymentProgram ?? '',
    teaser: tour?.teaser ?? '',
    tickets: tour?.tickets ?? '',
    optionalPrograms: tour?.optionalPrograms ?? '',
    prices: tour?.prices ?? '',
    discounts: tour?.discounts ?? '',
    notes: tour?.notes ?? '',
    galleryTitle: tour?.galleryTitle ?? '',
    gallerySubtitle: tour?.gallerySubtitle ?? '',
    gallery: (tour?.gallery ?? []).map(toGalleryItemFormValue),
    priceBox: {
      price: tour?.priceBox?.price?.toString() ?? '',
      currency: tour?.priceBox?.currency ?? 'HUF',
      priceSuffix: tour?.priceBox?.priceSuffix ?? '',
      discountBadge: tour?.priceBox?.discountBadge ?? '',
      discountText: tour?.priceBox?.discountText ?? '',
    },
    programDays,
    priceItems: (tour?.priceItems ?? []).map((item) => ({
      clientId: item.id ?? createClientId(),
      type: item.type ?? 'included',
      text: item.text ?? '',
      sortOrder: item.sortOrder ?? 0,
      active: item.active ?? true,
    })),
    regionId: tour?.regionId ?? '',
    departurePlaceIds: (tour?.departurePlaceIds ?? []).map(String),
    departurePlaceFees: Object.fromEntries(
      (tour?.departurePlaces ?? []).map((place) => [
        String(place.id),
        place.tourFee !== null && place.tourFee !== undefined
          ? String(place.tourFee)
          : '',
      ]),
    ),
    countryIds: tour?.countryIds ?? [],
    tagIds: tour?.tagIds ?? [],
    categoryIds: tour?.categoryIds ?? [],
    programTypeId: tour?.programTypeId ?? '',
    travelModeId: tour?.travelModeId ?? '',
    catering: tour?.catering ?? '',
    cateringInfo: tour?.cateringInfo ?? '',
    accommodation: tour?.accommodation ?? '',
    accommodationInfo: tour?.accommodationInfo ?? '',
    bookingFormTemplateId: tour?.bookingFormTemplateId
      ? String(tour.bookingFormTemplateId)
      : '',
    price: tour?.price ?? '',
    sliderText: tour?.sliderText ?? '',
    dates,
  };
}

export function getTourFormDefaults(
  tour?: Partial<Tour> | null,
): TourFormValues {
  return mapTourToFormValues(tour);
}

const isBlank = (value: string | null | undefined) =>
  (value ?? '').trim() === '';

/**
 * The form as it is saved: rows the user added but left completely empty (a
 * gallery row without an image, an empty price item or program day) are
 * dropped instead of failing the save.
 */
export function normalizeTourFormValues(
  values: TourFormValues,
): TourFormValues {
  return {
    ...values,
    programDays: values.programDays
      .filter(
        (day) =>
          !isBlank(day.title) ||
          !isBlank(day.description) ||
          !isBlank(day.image),
      )
      .map((day, index) => ({
        ...day,
        sortOrder: day.sortOrder ?? index + 1,
        dayNumber: day.dayNumber ?? index + 1,
        badges: day.badges.map((badge, badgeIndex) => ({
          ...badge,
          clientId: badge.clientId ?? `${day.clientId}-${badgeIndex + 1}`,
        })),
      })),
    gallery: values.gallery
      .filter((item) => !isBlank(item.mediaId))
      .map((item, index) => ({
        ...item,
        sortOrder: item.sortOrder ?? index + 1,
      })),
    priceBox: {
      ...values.priceBox,
    },
    priceItems: values.priceItems
      .filter((item) => !isBlank(item.text))
      .map((item, index) => ({
        ...item,
        sortOrder: item.sortOrder ?? index + 1,
      })),
  };
}

export type TourListQuery = {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  regionId?: string;
  featured?: 'all' | 'true' | 'false';
  active?: 'all' | 'true' | 'false';
  xmlEnabled?: 'all' | 'true' | 'false';
};

export type TourListResponse = {
  items: Tour[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type TourPartnerOffer = {
  id: string;
  name: string;
  partnerName: string;
  partnerEmail: string;
  inquiryDate: string;
  status: TourPartnerOfferStatus;
  note: string;
  active: boolean;
};

export type TourPartnerOfferFormValues = Omit<TourPartnerOffer, 'id'>;

export type TourPartnerOfferListQuery = {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: keyof TourPartnerOffer;
  sortDirection?: 'asc' | 'desc';
};

export type TourPartnerOfferListResponse = {
  items: TourPartnerOffer[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type TourRegionGroup = {
  id: string;
  active: boolean;
  featuredOnHomepage: boolean;
  type: TourRegionGroupType;
  name: string;
  seoName: string;
  seoAutoGenerate: boolean;
  galleryId: string;
  description: string;
  listBelowText: string;
  travelConditionsLink: string;
};

export type TourRegionGroupFormValues = Omit<TourRegionGroup, 'id'>;

export type TourRegionGroupListQuery = {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: keyof TourRegionGroup;
  sortDirection?: 'asc' | 'desc';
};

export type TourRegionGroupListResponse = {
  items: TourRegionGroup[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type TourSeasonalGroup = {
  id: string;
  active: boolean;
  menuType: TourSeasonalMenuType;
  name: string;
  seoName: string;
  seoAutoGenerate: boolean;
  boxText: string;
  hasOffers: boolean;
};

export type TourSeasonalGroupFormValues = Omit<TourSeasonalGroup, 'id'>;

export type TourSeasonalGroupListQuery = {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: keyof TourSeasonalGroup;
  sortDirection?: 'asc' | 'desc';
};

export type TourSeasonalGroupListResponse = {
  items: TourSeasonalGroup[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type TourDeparturePlace = {
  id: string;
  active: boolean;
  name: string;
  city: string;
  fee: string;
  /** Fee on the tour the place was loaded with, overriding the general fee. */
  tourFee?: number | null;
  travelCount: number;
};

export type TourDeparturePlaceFormValues = Omit<
  TourDeparturePlace,
  'id' | 'travelCount' | 'tourFee'
>;

export type TourDeparturePlaceListQuery = {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: keyof TourDeparturePlace;
  sortDirection?: 'asc' | 'desc';
};

export type TourDeparturePlaceListResponse = {
  items: TourDeparturePlace[];
  totalCount: number;
  page: number;
  perPage: number;
};

/** A public list whose tour order the office sets: a homepage tile's category page or a country. */
export type OrderedTourListType = 'category' | 'country' | 'featured';

export type OrderedTourList = {
  type: OrderedTourListType;
  key: string;
  label: string;
  categoryName?: string;
  tourCount: number;
  /** Whether the office set the list's own order (otherwise it follows the global order). */
  ordered: boolean;
};

export type OrderedTourLists = {
  tiles: OrderedTourList[];
  countries: OrderedTourList[];
  featured: OrderedTourList[];
};

export type OrderedTourListItem = {
  id: string;
  name: string;
  price: number | null;
  thumbnailUrl: string | null;
  link: string;
  /** Whether the office placed the tour on the list (otherwise it follows the placed ones in the global order). */
  placed: boolean;
};
