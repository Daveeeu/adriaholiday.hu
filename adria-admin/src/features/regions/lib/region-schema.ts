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
});

export type RegionFormValues = z.infer<typeof regionFormSchema>;

export function getRegionFormDefaults(region?: Region): RegionFormValues {
  return {
    name: region?.name ?? '',
    slug: region?.slug ?? '',
    status: region?.isActive ? 'active' : 'inactive',
  };
}

export function slugifyRegionName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
