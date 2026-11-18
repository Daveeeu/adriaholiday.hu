import type { FieldErrors } from 'react-hook-form';

import type { TourFormValues } from './tours.types';

/** The editor's sections in menu order, grouped; one is shown at a time. */
export const TOUR_FORM_SECTIONS = [
  {
    key: 'basic',
    group: 'Alapok',
    title: 'Alapadatok',
    description: 'Aktív-e az út, hol jelenjen meg, és a sorrendje.',
  },
  {
    key: 'seo',
    group: 'Alapok',
    title: 'Név és webcím',
    description: 'Név, alcím, webcím és a keresőkben megjelenő szöveg.',
  },
  {
    key: 'gallery',
    group: 'Alapok',
    title: 'Képek',
    description: 'Az út képei; az első aktív kép a borítókép.',
  },
  {
    key: 'priceBox',
    group: 'Ár és időpontok',
    title: 'Árdoboz',
    description:
      'Az alapár és a kedvezmény; a megjelenített árat a rendszer írja.',
  },
  {
    key: 'dates',
    group: 'Ár és időpontok',
    title: 'Időpontok',
    description: 'Indulások, időpontonkénti ár, férőhely és felárak.',
  },
  {
    key: 'priceItems',
    group: 'Ár és időpontok',
    title: 'Ár tartalma',
    description: 'Mit tartalmaz és mit nem tartalmaz az ár.',
  },
  {
    key: 'descriptions',
    group: 'Tartalom',
    title: 'Leírások',
    description:
      'A listák rövid leírása, az ismertető és a keresési kulcsszavak.',
  },
  {
    key: 'programText',
    group: 'Tartalom',
    title: 'Program szövege',
    description:
      'A program előtti szöveg, a teljes program és a program alatti szöveg.',
  },
  {
    key: 'programDays',
    group: 'Tartalom',
    title: 'Program napok',
    description: 'Napokra bontott program képekkel és címkékkel.',
  },
  {
    key: 'routeMap',
    group: 'Tartalom',
    title: 'Útvonal térkép',
    description: 'A megállók, amelyekből a térkép készül.',
  },
  {
    key: 'stay',
    group: 'Tartalom',
    title: 'Szállás és ellátás',
    description:
      'Az utazás oldalának felső kártyáin, kiegészítő információval.',
  },
  {
    key: 'info',
    group: 'Tartalom',
    title: 'Tudnivalók',
    description:
      'Kedvcsináló, fakultatív programok, belépők, fizetés, árak, kedvezmények, jegyzet.',
  },
  {
    key: 'filters',
    group: 'Beállítások',
    title: 'Besorolás és kiemelés',
    description:
      'Régió, kategóriák, országok, címkék, felszállási helyek és főoldali kiemelés.',
  },
  {
    key: 'partnerXml',
    group: 'Beállítások',
    title: 'Partnerportálok',
    description:
      'Amit az út a Travelgate, Travelmax, Cesys és az általános feedben mutat.',
  },
  {
    key: 'bookingForm',
    group: 'Beállítások',
    title: 'Foglalási űrlap',
    description: 'Melyik űrlapsablon szerint kérje be az adatokat a foglalás.',
  },
] as const;

export type TourFormSectionKey = (typeof TOUR_FORM_SECTIONS)[number]['key'];

export const DEFAULT_TOUR_FORM_SECTION: TourFormSectionKey = 'basic';

export function isTourFormSection(
  value: string | null,
): value is TourFormSectionKey {
  return TOUR_FORM_SECTIONS.some((section) => section.key === value);
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
  dates: 'dates',
  priceItems: 'priceItems',
  listDescription: 'descriptions',
  shortDescription: 'descriptions',
  searchKeywords: 'descriptions',
  programBefore: 'programText',
  program: 'programText',
  programFooter: 'programText',
  programDays: 'programDays',
  routeStops: 'routeMap',
  accommodation: 'stay',
  accommodationInfo: 'stay',
  catering: 'stay',
  cateringInfo: 'stay',
  teaser: 'info',
  optionalPrograms: 'info',
  tickets: 'info',
  inclusions: 'info',
  paymentProgram: 'info',
  prices: 'info',
  discounts: 'info',
  notes: 'info',
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
  partnerXml: 'partnerXml',
  bookingFormTemplateId: 'bookingForm',
};

/** The sections that hold a field with an error, in menu order. */
export function tourFormSectionsWithErrors(
  errors: FieldErrors<TourFormValues> | string[],
): TourFormSectionKey[] {
  const fields = Array.isArray(errors)
    ? errors.map((path) => path.split('.')[0])
    : Object.keys(errors);
  const sections = new Set(
    (fields as Array<keyof TourFormValues>)
      .map((field) => SECTION_OF_FIELD[field])
      .filter(
        (section): section is TourFormSectionKey => section !== undefined,
      ),
  );

  return TOUR_FORM_SECTIONS.map((section) => section.key).filter((key) =>
    sections.has(key),
  );
}
