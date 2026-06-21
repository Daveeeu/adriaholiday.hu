import { z } from 'zod';

import { slugifyBusText } from './buses.constants';

export type BusLanguage = 'hu' | 'en' | 'de';

export type BusTranslation = {
  name: string;
  seoName: string;
  seoAutoGenerate: boolean;
};

export type BusTranslations = Record<BusLanguage, BusTranslation>;

export type Bus = {
  id: string | number;
  active: boolean;
  vehicleCode: string;
  translations: BusTranslations;
  createdAt: string;
  updatedAt: string;
};

export type BusFormValues = {
  active: boolean;
  vehicleCode: string;
  translations: BusTranslations;
};

export type BusUpsertInput = BusFormValues;

export type BusPanelMode = 'create' | 'edit' | 'detail';

export type BusesListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: BusesSortKey;
  sortDirection?: 'asc' | 'desc';
};

export type BusesSortKey = 'id' | 'vehicleCode' | 'name' | 'active' | 'createdAt';

export type BusesListResponse = {
  items: Bus[];
  totalCount: number;
  page: number;
  perPage: number;
};

export const busTranslationSchema = z.object({
  name: z.string().trim().min(2, 'A név megadása kötelező.'),
  seoName: z.string().trim(),
  seoAutoGenerate: z.boolean(),
});

export const busFormSchema = z.object({
  active: z.boolean(),
  vehicleCode: z.string().trim(),
  translations: z.object({
    hu: busTranslationSchema,
    en: busTranslationSchema,
    de: busTranslationSchema,
  }),
});

export type BusFormSchema = z.infer<typeof busFormSchema>;

export function normalizeBusFormValues(values: BusFormValues): BusUpsertInput {
  const normalizeTranslation = (translation: BusTranslation) => ({
    ...translation,
    seoName: translation.seoAutoGenerate
      ? slugifyBusText(translation.name)
      : translation.seoName.trim(),
  });

  return {
    active: values.active,
    vehicleCode: values.vehicleCode.trim(),
    translations: {
      hu: normalizeTranslation(values.translations.hu),
      en: normalizeTranslation(values.translations.en),
      de: normalizeTranslation(values.translations.de),
    },
  };
}

export function getBusFormDefaults(bus?: Bus): BusFormValues {
  return {
    active: bus?.active ?? true,
    vehicleCode: bus?.vehicleCode ?? '',
    translations: {
      hu: {
        name: bus?.translations.hu.name ?? '',
        seoName: bus?.translations.hu.seoName ?? '',
        seoAutoGenerate: bus?.translations.hu.seoAutoGenerate ?? true,
      },
      en: {
        name: bus?.translations.en.name ?? '',
        seoName: bus?.translations.en.seoName ?? '',
        seoAutoGenerate: bus?.translations.en.seoAutoGenerate ?? true,
      },
      de: {
        name: bus?.translations.de.name ?? '',
        seoName: bus?.translations.de.seoName ?? '',
        seoAutoGenerate: bus?.translations.de.seoAutoGenerate ?? true,
      },
    },
  };
}
