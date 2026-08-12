import { z } from 'zod';

import type { ApartmentType } from '@/types/domain';

import { APARTMENT_RESERVED_TYPE_SLUGS } from '../constants/apartmentTypes';

export const apartmentTypeFormSchema = z.object({
  name: z.string().trim().min(2, 'A név megadása kötelező.'),
  slug: z
    .string()
    .trim()
    .min(2, 'A slug megadása kötelező.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'A slug csak kisbetűket, számokat és kötőjelet tartalmazhat.')
    .refine(
      (value) => !(APARTMENT_RESERVED_TYPE_SLUGS as readonly string[]).includes(value),
      'Ez a slug foglalt, válassz másikat.',
    ),
  sortOrder: z.number().int().min(0).default(0),
  status: z.enum(['active', 'inactive']),
});

export type ApartmentTypeFormValues = z.infer<typeof apartmentTypeFormSchema>;

export function getApartmentTypeFormDefaults(apartmentType?: ApartmentType): ApartmentTypeFormValues {
  return {
    name: apartmentType?.name ?? '',
    slug: apartmentType?.slug ?? '',
    sortOrder: apartmentType?.sortOrder ?? 0,
    status: apartmentType?.isActive ?? true ? 'active' : 'inactive',
  };
}

export function slugifyApartmentTypeName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
