import { z } from 'zod';

import { t } from '@/i18n';
import type { Offer, OfferContent } from '@/types/domain';

export const offerLocaleOrder = ['hu', 'en', 'de'] as const;

export const offerTranslationSchema = z.object({
  title: z.string().trim().min(2, t('validation.offer.translation.title')),
  teaser: z.string().trim().min(10, t('validation.offer.translation.teaser')),
  description: z
    .string()
    .trim()
    .min(20, t('validation.offer.translation.description')),
  program: z.string().trim().min(10, t('validation.offer.translation.program')),
  tickets: z.string().trim().min(10, t('validation.offer.translation.tickets')),
  optionalPrograms: z
    .string()
    .trim()
    .min(10, t('validation.offer.translation.optionalPrograms')),
  pricingInformation: z
    .string()
    .trim()
    .min(10, t('validation.offer.translation.pricingInformation')),
});

export const offerFormSchema = z.object({
  title: z.string().trim().min(2, t('validation.offer.title')),
  slug: z
    .string()
    .trim()
    .min(2, t('validation.offer.slug'))
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      t('validation.offer.slugFormat'),
    ),
  featured: z.boolean(),
  status: z.enum(['draft', 'published', 'archived']),
  pdfUrl: z.string().trim().min(5, t('validation.offer.pdf')),
  regionId: z.string().min(1, t('validation.offer.region')),
  offerGroupId: z.string().min(1, t('validation.offer.group')),
  galleryId: z.string().min(1, t('validation.offer.gallery')),
  translations: z.object({
    hu: offerTranslationSchema,
    en: offerTranslationSchema,
    de: offerTranslationSchema,
  }),
});

export type OfferFormValues = z.infer<typeof offerFormSchema>;

export function slugifyOfferTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function emptyTranslation(): z.infer<typeof offerTranslationSchema> {
  return {
    title: '',
    teaser: '',
    description: '',
    program: '',
    tickets: '',
    optionalPrograms: '',
    pricingInformation: '',
  };
}

export function getOfferFormDefaults(
  offer?: Offer,
  translations?: OfferContent[],
): OfferFormValues {
  const translationMap = new Map(
    (translations ?? []).map((translation) => [
      translation.locale,
      translation,
    ]),
  );

  const getTranslation = (locale: OfferContent['locale']) => {
    const translation = translationMap.get(locale);

    return translation
      ? {
          title: translation.title,
          teaser: translation.teaser,
          description: translation.description,
          program: translation.program,
          tickets: translation.tickets,
          optionalPrograms: translation.optionalPrograms,
          pricingInformation: translation.pricingInformation,
        }
      : emptyTranslation();
  };

  return {
    title: offer?.title ?? '',
    slug: offer?.slug ?? '',
    featured: offer?.featured ?? false,
    status: offer?.status ?? 'draft',
    pdfUrl: offer?.pdfUrl ?? '/files/offers/new-offer.pdf',
    regionId: offer?.regionId ?? '',
    offerGroupId: offer?.offerGroupId ?? '',
    galleryId: offer?.galleryId ?? '',
    translations: {
      hu: getTranslation('hu'),
      en: getTranslation('en'),
      de: getTranslation('de'),
    },
  };
}
