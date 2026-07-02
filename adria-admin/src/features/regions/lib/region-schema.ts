import { z } from 'zod';

import { t } from '@/i18n';
import type { Region } from '@/types/domain';

export const regionFormSchema = z.object({
  name: z.string().trim().min(2, t('validation.region.name')),
  slug: z
    .string()
    .trim()
    .min(2, t('validation.region.slug'))
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      t('validation.region.slug'),
  ),
  status: z.enum(['active', 'inactive']),
  heroImageUrl: z.string().trim().max(2048).optional().nullable(),
  portfolioFeatured: z.boolean().default(false),
  portfolioSortOrder: z.number().int().min(0).default(0),
  portfolioImageUrl: z.string().trim().max(2048).optional().nullable(),
  portfolioShortDescription: z.string().trim().optional().nullable(),
});

export type RegionFormValues = z.infer<typeof regionFormSchema>;

export function getRegionFormDefaults(region?: Region): RegionFormValues {
  return {
    name: region?.name ?? '',
    slug: region?.slug ?? '',
    status: region?.isActive ? 'active' : 'inactive',
    heroImageUrl: region?.heroImageUrl ?? '',
    portfolioFeatured: region?.portfolioFeatured ?? false,
    portfolioSortOrder: region?.portfolioSortOrder ?? 0,
    portfolioImageUrl: region?.portfolioImageUrl ?? region?.heroImageUrl ?? '',
    portfolioShortDescription: region?.portfolioShortDescription ?? region?.summary ?? '',
  };
}

export function slugifyRegionName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
