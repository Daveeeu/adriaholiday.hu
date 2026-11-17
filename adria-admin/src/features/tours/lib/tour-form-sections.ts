import type { FieldErrors } from 'react-hook-form';

import type { TourFormValues } from './tours.types';

export const TOUR_FORM_SECTION_KEYS = [
  'basic',
  'seo',
  'gallery',
  'priceBox',
  'content',
  'programDays',
  'routeMap',
  'stay',
  'priceItems',
  'filters',
  'dates',
  'partnerXml',
  'bookingForm',
] as const;

export type TourFormSectionKey = (typeof TOUR_FORM_SECTION_KEYS)[number];

export type TourFormSectionState = Record<TourFormSectionKey, boolean>;

export const DEFAULT_OPEN_TOUR_FORM_SECTIONS: TourFormSectionState = {
  basic: true,
  seo: true,
  gallery: false,
  priceBox: true,
  content: false,
  programDays: false,
  routeMap: false,
  stay: true,
  priceItems: false,
  filters: true,
  dates: true,
  partnerXml: false,
  bookingForm: false,
};

export function allTourFormSections(open: boolean): TourFormSectionState {
  return Object.fromEntries(
    TOUR_FORM_SECTION_KEYS.map((key) => [key, open]),
  ) as TourFormSectionState;
}

/** The section each form field is edited in; a field not edited anywhere has none. */
const SECTION_OF_FIELD: Partial<
  Record<keyof TourFormValues, TourFormSectionKey>
> = {
  sortOrder: 'basic',
  active: 'basic',
  listed: 'basic',
  xmlEnabled: 'basic',
  couponable: 'basic',
  name: 'seo',
  subtitle: 'seo',
  seoName: 'seo',
  seoAutoGenerate: 'seo',
  seoTitle: 'seo',
  seoDescription: 'seo',
  seoRobots: 'seo',
  gallery: 'gallery',
  galleryTitle: 'gallery',
  gallerySubtitle: 'gallery',
  priceBox: 'priceBox',
  listDescription: 'content',
  shortDescription: 'content',
  searchKeywords: 'content',
  programBefore: 'content',
  program: 'content',
  programFooter: 'content',
  inclusions: 'content',
  paymentProgram: 'content',
  teaser: 'content',
  tickets: 'content',
  optionalPrograms: 'content',
  prices: 'content',
  discounts: 'content',
  notes: 'content',
  programDays: 'programDays',
  routeStops: 'routeMap',
  accommodation: 'stay',
  accommodationInfo: 'stay',
  catering: 'stay',
  cateringInfo: 'stay',
  priceItems: 'priceItems',
  regionId: 'filters',
  programTypeId: 'filters',
  travelModeId: 'filters',
  departurePlaceIds: 'filters',
  departurePlaceFees: 'filters',
  countryIds: 'filters',
  tagIds: 'filters',
  categoryIds: 'filters',
  featured: 'filters',
  featuredOrder: 'filters',
  recommended: 'filters',
  dates: 'dates',
  partnerXml: 'partnerXml',
  bookingFormTemplateId: 'bookingForm',
};

/** The sections that hold a field with an error, to open them so the error shows. */
export function tourFormSectionsWithErrors(
  errors: FieldErrors<TourFormValues>,
): TourFormSectionKey[] {
  return [
    ...new Set(
      (Object.keys(errors) as Array<keyof TourFormValues>)
        .map((field) => SECTION_OF_FIELD[field])
        .filter(
          (section): section is TourFormSectionKey => section !== undefined,
        ),
    ),
  ];
}
