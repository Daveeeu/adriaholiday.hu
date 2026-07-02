import { apiClient } from '@/lib/api-client';

import type { SelectOption } from './tours.types';
import { slugifyTourText } from './tours.constants';

type RawSelectOption = Partial<SelectOption> & {
  value?: string | number;
  code?: string;
  seoName?: string;
  name?: string;
  title?: string;
  label?: string;
  slug?: string;
};

function warnInvalidOption(option: RawSelectOption) {
  if (import.meta.env.DEV) {
    console.warn('Missing select option label, falling back to identifier.', option);
  }
}

export function normalizeSelectOption(
  option: Partial<SelectOption> & {
    value?: string | number;
    code?: string;
    seoName?: string;
    name?: string;
    title?: string;
    label?: string;
    slug?: string;
  } = {},
): SelectOption {
  const id =
    option.id ?? option.value ?? option.code ?? option.seoName ?? option.slug ?? option.name ?? option.title ?? '';
  const label = option.label ?? option.name ?? option.title ?? option.slug ?? '';

  if (label === '') {
    warnInvalidOption(option);
  }

  return {
    id: String(id),
    value: String(option.value ?? id),
    label: label || String(id || 'Ismeretlen'),
  };
}

async function getSelectOptions(path: string, search?: string): Promise<SelectOption[]> {
  return apiClient
    .get<SelectOption[]>(path, {
      query: search ? { search } : undefined,
    })
    .then((options) => options.map(normalizeSelectOption));
}

export async function getRegionOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/regions', search);
}

export async function createRegionOption(values: {
  name: string;
  slug?: string;
  countryCode?: string;
  isActive?: boolean;
}) {
  const region = await apiClient.post<{ id: string | number; name: string }>('/api/admin/regions', {
    name: values.name,
    slug: values.slug || slugifyTourText(values.name),
    country_code: values.countryCode || 'hr',
    timezone: 'Europe/Zagreb',
    currency: 'EUR',
    hero_image_url: null,
    summary: null,
    description: null,
    is_active: values.isActive ?? true,
    sort_order: 0,
    portfolio_featured: false,
    portfolio_sort_order: 0,
    portfolio_image_url: null,
    portfolio_short_description: null,
  });

  return normalizeSelectOption({ id: String(region.id), value: String(region.id), label: region.name });
}

export async function getGroupOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/groups', search);
}

export async function createGroupOption(values: {
  name: string;
  code?: string;
  isActive?: boolean;
}) {
  const response = await apiClient.post<SelectOption>('/api/admin/tour-region-groups', {
    active: values.isActive ?? true,
    featured_on_homepage: false,
    type: 'group',
    name: values.name,
    seo_name: values.code || slugifyTourText(values.name),
    seo_auto_generate: true,
    gallery_id: null,
    description: null,
    list_below_text: null,
    travel_conditions_link: null,
  });

  return normalizeSelectOption(response);
}

export async function getOfferGroupOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/offer-groups', search);
}

export async function getHomepageOfferOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/homepage-offers', search);
}

export async function createOfferGroupOption(values: {
  name: string;
  code?: string;
  isActive?: boolean;
}) {
  const response = await apiClient.post<SelectOption>('/api/admin/tour-seasonal-groups', {
    active: values.isActive ?? true,
    menu_type: 'intro',
    name: values.name,
    seo_name: values.code || slugifyTourText(values.name),
    seo_auto_generate: true,
    box_text: null,
    has_offers: false,
  });

  return normalizeSelectOption(response);
}

export async function getDeparturePlaceOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/departure-places', search);
}

export async function createDeparturePlaceOption(values: {
  name: string;
  city?: string;
  fee?: string;
  isActive?: boolean;
}) {
  const response = await apiClient.post<{ id: string | number; name: string }>('/api/admin/tour-departure-places', {
    active: values.isActive ?? true,
    name: values.name,
    city: values.city || values.name,
    fee: values.fee || null,
  });

  return normalizeSelectOption({ id: String(response.id), value: String(response.id), label: response.name });
}

export async function getCountryOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/countries', search);
}

export async function createCountryOption(values: {
  name: string;
  code?: string;
  isActive?: boolean;
}) {
  const response = await apiClient.post<SelectOption>('/api/admin/countries', {
    name: values.name,
    code: values.code || slugifyTourText(values.name),
    active: values.isActive ?? true,
  });

  return normalizeSelectOption(response);
}

export async function getFitOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/fits', search);
}

export async function createFitOption(values: {
  name: string;
  code?: string;
  isActive?: boolean;
}) {
  const response = await apiClient.post<SelectOption>('/api/admin/fits', {
    name: values.name,
    code: values.code || slugifyTourText(values.name),
    active: values.isActive ?? true,
  });

  return normalizeSelectOption(response);
}

export async function getProgramTypeOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/program-types', search);
}

export async function createProgramTypeOption(values: {
  name: string;
  code?: string;
  isActive?: boolean;
}) {
  const response = await apiClient.post<SelectOption>('/api/admin/program-types', {
    name: values.name,
    code: values.code || slugifyTourText(values.name),
    active: values.isActive ?? true,
  });

  return normalizeSelectOption(response);
}

export async function getTravelModeOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/travel-modes', search);
}

export async function createTravelModeOption(values: {
  name: string;
  code?: string;
  isActive?: boolean;
}) {
  const response = await apiClient.post<SelectOption>('/api/admin/travel-modes', {
    name: values.name,
    code: values.code || slugifyTourText(values.name),
    active: values.isActive ?? true,
  });

  return normalizeSelectOption(response);
}

export async function getDifficultyOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/difficulties', search);
}

export async function createDifficultyOption(values: {
  name: string;
  code?: string;
  isActive?: boolean;
}) {
  const response = await apiClient.post<SelectOption>('/api/admin/difficulties', {
    name: values.name,
    code: values.code || slugifyTourText(values.name),
    active: values.isActive ?? true,
  });

  return normalizeSelectOption(response);
}

export async function getTagOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/blog-tags', search);
}

export async function createTagOption(values: {
  name: string;
  isActive?: boolean;
}) {
  const response = await apiClient.post<{ id: string | number }>('/api/admin/blog/tags', {
    active: values.isActive ?? true,
    sort_order: 0,
    translations: {
      hu: { name: values.name },
      en: { name: values.name },
      de: { name: values.name },
    },
  });

  return normalizeSelectOption({ id: String(response.id), value: String(response.id), label: values.name });
}

export async function getCategoryOptions(search?: string) {
  return getSelectOptions('/api/admin/select-options/blog-categories', search);
}

export async function createCategoryOption(values: {
  name: string;
  code?: string;
  isActive?: boolean;
}) {
  const response = await apiClient.post<{ id: string | number }>('/api/admin/blog/categories', {
    active: values.isActive ?? true,
    column: '1',
    sort_order: 0,
    translations: {
      hu: { name: values.name, seo_name: values.code || slugifyTourText(values.name), seo_auto_generate: true },
      en: { name: values.name, seo_name: values.code || slugifyTourText(values.name), seo_auto_generate: true },
      de: { name: values.name, seo_name: values.code || slugifyTourText(values.name), seo_auto_generate: true },
    },
  });

  return normalizeSelectOption({ id: String(response.id), value: String(response.id), label: values.name });
}
