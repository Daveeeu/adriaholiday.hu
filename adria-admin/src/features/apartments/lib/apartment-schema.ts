import { z } from 'zod';

import { createSlug } from '@/data/generators/core-generators';
import {
  APARTMENT_TYPE_DEFAULT_DIMENSIONS,
  APARTMENT_TYPE_VALUES,
} from '@/features/apartments/constants/apartmentTypes';
import { apartmentPricingMatrixConfig } from './apartments.constants';
import type { ApartmentFormContext, ApartmentFormValues } from './apartments.types';
import type { Apartment } from '@/types/domain';

const priceCellSchema = z.string().trim();

const pricingMatrixSchema = z.object({
  columns: z.array(
    z.object({
      id: z.string().min(1),
      startDate: z.string().trim(),
      endDate: z.string().trim(),
    }),
  ),
  rows: z.array(
    z.object({
      id: z.string().min(1),
      category: z.string().trim(),
      beds: z.string().trim(),
      prices: z.array(priceCellSchema),
    }),
  ),
});

const priceSeasonSchema = z.object({
  id: z.string().min(1),
  apartmentId: z.string().optional(),
  startDate: z.string().trim(),
  endDate: z.string().trim(),
  category: z.string().trim(),
  beds: z.string().trim(),
  price: z.string().trim(),
});

export const apartmentFormSchema = z
  .object({
    isActive: z.boolean(),
    active: z.boolean(),
    featured: z.boolean(),
    isAccommodation: z.boolean(),
    accommodation: z.boolean(),
    stars: z.number().int().min(0).max(5),
    name: z.string().trim().min(2, 'A név megadása kötelező.'),
    slug: z.string().trim(),
    seoName: z.string().trim(),
    seo_name: z.string().trim(),
    autoGenerateSeoName: z.boolean(),
    seo_auto_generate: z.boolean(),
    code: z.string().trim().min(2, 'A kód megadása kötelező.'),
    type: z.union([
      z.enum(APARTMENT_TYPE_VALUES),
      z.literal(''),
    ]),
    bedrooms: z.number().int().min(0),
    bathrooms: z.number().int().min(0),
    maxGuests: z.number().int().min(0),
    sizeM2: z.number().min(0),
    address: z.string().trim().min(5, 'A cím megadása kötelező.'),
    mapAddress: z.string().trim().min(5, 'A térkép cím megadása kötelező.'),
    map_address: z.string().trim().min(5, 'A térkép cím megadása kötelező.'),
    latitude: z.number().min(-90, 'A koordináta érvénytelen.').max(90, 'A koordináta érvénytelen.'),
    longitude: z.number().min(-180, 'A koordináta érvénytelen.').max(180, 'A koordináta érvénytelen.'),
    coordinates: z.string().trim(),
    shortDescription: z.string().trim(),
    description: z.string().trim(),
    additionalInformation: z.string().trim(),
    apartmentTypeContent: z.string().trim(),
    apartment_type_content: z.string().trim(),
    apartment_type_description: z.string().trim(),
    apartment_type_text_description: z.string().trim(),
    apartment_type_text_description_2: z.string().trim(),
    typeDescription: z.string().trim(),
    allInclusiveDescription: z.string().trim(),
    allInclusiveContent: z.string().trim(),
    all_inclusive_content: z.string().trim(),
    regionId: z.string().min(1, 'A régió kiválasztása kötelező.'),
    locationId: z.string().min(1, 'A hely kiválasztása kötelező.'),
    galleryId: z.string().min(1, 'A galéria kiválasztása kötelező.'),
    amenities: z.array(z.string()),
    services: z.array(z.string()),
    priceHeader: z.string().trim(),
    priceInnerHeader: z.string().trim(),
    pricingMatrix: pricingMatrixSchema,
    priceSeasons: z.array(priceSeasonSchema),
    status: z.enum(['draft', 'published', 'archived']),
    region_id: z.string().trim(),
    place_id: z.string().trim(),
    gallery_id: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (!values.type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Az apartman típusának kiválasztása kötelező.',
        path: ['type'],
      });
    }

    if (!values.autoGenerateSeoName && values.seoName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Az SEO név megadása kötelező.',
        path: ['seoName'],
      });
    }

    if (!values.autoGenerateSeoName && values.seo_name.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Az SEO név megadása kötelező.',
        path: ['seo_name'],
      });
    }
  });

export type ApartmentFormSchema = z.infer<typeof apartmentFormSchema>;
export type { ApartmentFormValues } from './apartments.types';

function createPricingMatrixDefaults(apartment?: Apartment) {
  const existingColumns = apartment?.pricingMatrix?.columns ?? [];
  const existingRows = apartment?.pricingMatrix?.rows ?? [];

  const columns = Array.from({ length: apartmentPricingMatrixConfig.columns }).map((_, columnIndex) => ({
    id: existingColumns[columnIndex]?.id ?? `price-column-${columnIndex + 1}`,
    startDate: existingColumns[columnIndex]?.startDate ?? '',
    endDate: existingColumns[columnIndex]?.endDate ?? '',
  }));

  const rows = Array.from({ length: apartmentPricingMatrixConfig.rows }).map((_, rowIndex) => ({
    id: existingRows[rowIndex]?.id ?? `price-row-${rowIndex + 1}`,
    category: existingRows[rowIndex]?.category ?? '',
    beds: existingRows[rowIndex]?.beds ?? '',
    prices: Array.from({ length: apartmentPricingMatrixConfig.columns }).map(
      (_, columnIndex) => existingRows[rowIndex]?.prices?.[columnIndex] ?? '',
    ),
  }));

  return { columns, rows };
}

function createDefaultCode(name: string) {
  return `APT-${createSlug(name || 'uj-apartman').toUpperCase().slice(0, 8)}`;
}

export function getApartmentFormDefaults(
  apartment?: Apartment,
  context?: ApartmentFormContext,
): ApartmentFormValues {
  const firstRegionId = apartment?.regionId ?? apartment?.region_id ?? context?.regions?.[0]?.id ?? '';
  const locationId =
    apartment?.locationId ??
    apartment?.place_id ??
    context?.locations?.find((location) => location.regionId === firstRegionId)?.id ??
    context?.locations?.[0]?.id ??
    '';
  const galleryId =
    apartment?.galleryId ??
    apartment?.gallery_id ??
    context?.galleries?.find((gallery) => gallery.regionId === firstRegionId)?.id ??
    context?.galleries?.[0]?.id ??
    '';

    const name = apartment?.name ?? '';

  return {
    isActive: apartment?.isActive ?? apartment?.active ?? apartment?.status !== 'archived',
    active: apartment?.active ?? apartment?.isActive ?? apartment?.status !== 'archived',
    featured: apartment?.featured ?? false,
    isAccommodation: apartment?.isAccommodation ?? apartment?.accommodation ?? false,
    accommodation: apartment?.accommodation ?? apartment?.isAccommodation ?? false,
    stars: apartment?.stars ?? 4,
    name,
    slug: apartment?.slug ?? createSlug(name),
    seoName: apartment?.seoName ?? createSlug(name),
    seo_name: apartment?.seo_name ?? apartment?.seoName ?? createSlug(name),
    autoGenerateSeoName: !apartment?.seoName,
    seo_auto_generate: apartment?.seo_auto_generate ?? !apartment?.seoName,
    code: apartment?.code ?? createDefaultCode(name),
    type: apartment?.type ?? context?.defaultType ?? '',
    bedrooms: apartment?.bedrooms ?? 0,
    bathrooms: apartment?.bathrooms ?? 0,
    maxGuests: apartment?.maxGuests ?? 0,
    sizeM2: apartment?.sizeM2 ?? 0,
    address: apartment?.address ?? '',
    mapAddress: apartment?.mapAddress ?? apartment?.address ?? '',
    map_address: apartment?.map_address ?? apartment?.mapAddress ?? apartment?.address ?? '',
    latitude: apartment?.latitude ?? 45,
    longitude: apartment?.longitude ?? 14,
    coordinates:
      apartment?.coordinates ??
      `${String(apartment?.latitude ?? 45)}, ${String(apartment?.longitude ?? 14)}`,
    shortDescription: apartment?.shortDescription ?? '',
    description: apartment?.description ?? apartment?.shortDescription ?? '',
    additionalInformation: apartment?.additionalInformation ?? '',
    apartmentTypeContent:
      apartment?.apartmentTypeContent ?? apartment?.apartment_type_content ?? apartment?.typeDescription ?? '',
    apartment_type_content:
      apartment?.apartment_type_content ?? apartment?.apartmentTypeContent ?? apartment?.typeDescription ?? '',
    apartment_type_description: apartment?.apartment_type_description ?? '',
    apartment_type_text_description: apartment?.apartment_type_text_description ?? '',
    apartment_type_text_description_2: apartment?.apartment_type_text_description_2 ?? '',
    typeDescription: apartment?.typeDescription ?? '',
    allInclusiveDescription: apartment?.allInclusiveDescription ?? '',
    allInclusiveContent:
      apartment?.allInclusiveContent ?? apartment?.all_inclusive_content ?? apartment?.allInclusiveDescription ?? '',
    all_inclusive_content:
      apartment?.all_inclusive_content ?? apartment?.allInclusiveContent ?? apartment?.allInclusiveDescription ?? '',
    regionId: firstRegionId,
    locationId,
    galleryId,
    amenities: apartment?.amenities ?? [],
    services: apartment?.services ?? apartment?.amenities ?? [],
    priceHeader: apartment?.priceHeader ?? 'Árak',
    priceInnerHeader: apartment?.priceInnerHeader ?? 'Kategória / ágyszám',
    pricingMatrix: createPricingMatrixDefaults(apartment),
    priceSeasons:
      apartment?.priceSeasons?.map((season) => ({ ...season })) ?? [],
    status: apartment?.status ?? 'draft',
    region_id: apartment?.region_id ?? firstRegionId,
    place_id: apartment?.place_id ?? locationId,
    gallery_id: apartment?.gallery_id ?? galleryId,
  };
}

export function getApartmentDimensions(type: Apartment['type']) {
  return APARTMENT_TYPE_DEFAULT_DIMENSIONS[type];
}
