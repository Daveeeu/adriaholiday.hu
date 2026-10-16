import { z } from 'zod';

import type { LocationMutationInput } from '@/api/admin-api';
import type { Location } from '@/types/domain';

export const locationFormSchema = z.object({
  name: z.string().trim().min(2, 'A név megadása kötelező.'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Csak kisbetű, szám és kötőjel.'),
  isActive: z.boolean(),
  areaSlug: z
    .string()
    .trim()
    .regex(/^(?:[a-z0-9]+(?:[-_][a-z0-9]+)*)?$/, 'Csak kisbetű, szám, kötőjel és aláhúzás.'),
  areaName: z.string().trim().max(255),
  description: z.string(),
  guide: z.string(),
  apartmentInformation: z.string(),
  seoTitle: z.string().trim().max(255),
  seoDescription: z.string().trim().max(500),
  seoRobots: z.string().trim().max(100),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;

export function getLocationFormDefaults(location: Location): LocationFormValues {
  return {
    name: location.name,
    slug: location.slug,
    isActive: location.isActive ?? true,
    areaSlug: location.areaSlug ?? '',
    areaName: location.areaName ?? '',
    description: location.description ?? '',
    guide: location.guide ?? '',
    apartmentInformation: location.apartmentInformation ?? '',
    seoTitle: location.seoTitle ?? '',
    seoDescription: location.seoDescription ?? '',
    seoRobots: location.seoRobots ?? '',
  };
}

/** The whole location as the API saves it: its other fields unchanged. */
export function toLocationMutationInput(location: Location, values: LocationFormValues): LocationMutationInput {
  return {
    regionId: location.regionId,
    type: location.type,
    latitude: location.latitude,
    longitude: location.longitude,
    transferMinutesFromAirport: location.transferMinutesFromAirport,
    featured: location.featured,
    ...values,
  };
}

/** The public page of a location's apartments, when it has an area. */
export function apartmentPagePath(location: Pick<Location, 'areaSlug' | 'slug'>): string | null {
  return location.areaSlug ? `/apartmanok/${location.areaSlug}/${location.slug}` : null;
}
