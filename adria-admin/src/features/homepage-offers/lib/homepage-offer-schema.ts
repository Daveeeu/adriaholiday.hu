import { z } from 'zod';

export const homepageOfferStatuses = ['active', 'inactive'] as const;
export const homepageOfferLanguages = ['hu', 'en', 'de'] as const;

export const homepageOfferTranslationSchema = z.object({
  name: z.string().trim().min(2, 'A név megadása kötelező.'),
  seoName: z.string().trim().optional(),
  shortDescription: z.string().trim().optional(),
});

export const homepageOfferFormSchema = z.object({
  status: z.enum(homepageOfferStatuses),
  imageUrl: z.string().trim().optional(),
  imageTitle: z.string().trim().optional(),
  link: z.string().trim().min(2, 'A link megadása kötelező.'),
  autoSeo: z.boolean(),
  translations: z.object({
    hu: homepageOfferTranslationSchema,
    en: homepageOfferTranslationSchema,
    de: homepageOfferTranslationSchema,
  }),
});

export type HomepageOfferStatus = (typeof homepageOfferStatuses)[number];
export type HomepageOfferLanguage = (typeof homepageOfferLanguages)[number];
export type HomepageOfferFormValues = z.infer<typeof homepageOfferFormSchema>;

export type HomepageOffer = HomepageOfferFormValues & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getHomepageOfferFormDefaults(
  offer?: HomepageOffer,
): HomepageOfferFormValues {
  return {
    status: offer?.status ?? 'active',
    imageUrl: offer?.imageUrl ?? '',
    imageTitle: offer?.imageTitle ?? '',
    link: offer?.link ?? '',
    autoSeo: offer?.autoSeo ?? true,
    translations: {
      hu: {
        name: offer?.translations.hu.name ?? '',
        seoName: offer?.translations.hu.seoName ?? '',
        shortDescription: offer?.translations.hu.shortDescription ?? '',
      },
      en: {
        name: offer?.translations.en.name ?? '',
        seoName: offer?.translations.en.seoName ?? '',
        shortDescription: offer?.translations.en.shortDescription ?? '',
      },
      de: {
        name: offer?.translations.de.name ?? '',
        seoName: offer?.translations.de.seoName ?? '',
        shortDescription: offer?.translations.de.shortDescription ?? '',
      },
    },
  };
}
