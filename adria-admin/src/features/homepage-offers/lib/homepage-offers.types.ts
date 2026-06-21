import { z } from 'zod';

import type { HOMEPAGE_OFFER_LANGUAGES } from './homepage-offers.constants';
import { slugifyHomepageOffer } from './homepage-offers.constants';

export type HomepageOfferLanguage = (typeof HOMEPAGE_OFFER_LANGUAGES)[number];

export type HomepageOfferTranslation = {
  name: string;
  seoName: string;
  seoAutoGenerate: boolean;
};

export type HomepageOfferTranslations = Record<
  HomepageOfferLanguage,
  HomepageOfferTranslation
>;

export type HomepageOffer = {
  id: string | number;
  active: boolean;
  sortOrder: number;
  image: string | null;
  imageTitle: string;
  link: string;
  translations: HomepageOfferTranslations;
  createdAt?: string;
  updatedAt?: string;
};

export type HomepageOfferFormValues = {
  active: boolean;
  sortOrder: number;
  image: string;
  imageTitle: string;
  link: string;
  translations: HomepageOfferTranslations;
};

export type HomepageOffersListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: HomepageOffersSortKey;
  sortDirection?: 'asc' | 'desc';
};

export type HomepageOffersSortKey =
  | 'sortOrder'
  | 'id'
  | 'active'
  | 'link'
  | 'imageTitle'
  | 'name';

export type HomepageOffersListResponse = {
  items: HomepageOffer[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type HomepageOfferUpsertInput = {
  active: boolean;
  sortOrder: number;
  image: string | null;
  imageTitle: string;
  link: string;
  translations: HomepageOfferTranslations;
};

export type HomepageOfferPanelMode = 'create' | 'edit' | 'detail';

export const homepageOfferTranslationSchema = z.object({
  name: z.string().trim().min(2, 'A magyar név megadása kötelező.'),
  seoName: z.string().trim(),
  seoAutoGenerate: z.boolean(),
});

export const homepageOfferFormSchema = z.object({
  active: z.boolean(),
  sortOrder: z.number().int().min(1, 'A sorrend legalább 1 legyen.'),
  image: z.string().trim(),
  imageTitle: z.string().trim(),
  link: z.string().trim().min(2, 'A link megadása kötelező.'),
  translations: z.object({
    hu: homepageOfferTranslationSchema,
    en: homepageOfferTranslationSchema,
    de: homepageOfferTranslationSchema,
  }),
});

export type HomepageOfferFormSchema = z.infer<typeof homepageOfferFormSchema>;

export function normalizeHomepageOfferFormValues(
  values: HomepageOfferFormValues,
): HomepageOfferUpsertInput {
  const normalizeTranslation = (translation: HomepageOfferTranslation) => ({
    ...translation,
    seoName: translation.seoAutoGenerate
      ? slugifyHomepageOffer(translation.name)
      : translation.seoName.trim(),
  });

  return {
    active: values.active,
    sortOrder: values.sortOrder,
    image: values.image.trim() ? values.image.trim() : null,
    imageTitle: values.imageTitle.trim(),
    link: values.link.trim(),
    translations: {
      hu: normalizeTranslation(values.translations.hu),
      en: normalizeTranslation(values.translations.en),
      de: normalizeTranslation(values.translations.de),
    },
  };
}

export function getHomepageOfferFormDefaults(
  offer?: HomepageOffer,
): HomepageOfferFormValues {
  return {
    active: offer?.active ?? true,
    sortOrder: offer?.sortOrder ?? 1,
    image: offer?.image ?? '',
    imageTitle: offer?.imageTitle ?? '',
    link: offer?.link ?? '',
    translations: {
      hu: {
        name: offer?.translations.hu.name ?? '',
        seoName: offer?.translations.hu.seoName ?? '',
        seoAutoGenerate: offer?.translations.hu.seoAutoGenerate ?? true,
      },
      en: {
        name: offer?.translations.en.name ?? '',
        seoName: offer?.translations.en.seoName ?? '',
        seoAutoGenerate: offer?.translations.en.seoAutoGenerate ?? true,
      },
      de: {
        name: offer?.translations.de.name ?? '',
        seoName: offer?.translations.de.seoName ?? '',
        seoAutoGenerate: offer?.translations.de.seoAutoGenerate ?? true,
      },
    },
  };
}
