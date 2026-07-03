import { apiClient } from '@/lib/api-client';

import type {
  SiteSettingItem,
  SiteSettingsFormValues,
  SiteSettingsMedia,
  SiteSettingsResponse,
} from './site-settings.types';

export function getSiteSettings() {
  return apiClient.get<SiteSettingsResponse>('/api/admin/site-settings');
}

function toPayload(values: SiteSettingsFormValues): Array<{
  group: string;
  key: string;
  type: string;
  isPublic: boolean;
  value: unknown;
}> {
  return [
    { group: 'general', key: 'site_name', type: 'string', isPublic: true, value: values.siteName },
    { group: 'brand', key: 'logo', type: 'media', isPublic: true, value: values.logo },
    { group: 'contact', key: 'phone', type: 'string', isPublic: true, value: values.phone },
    { group: 'contact', key: 'email', type: 'string', isPublic: true, value: values.email },
    { group: 'contact', key: 'address', type: 'text', isPublic: true, value: values.address },
    { group: 'contact', key: 'whatsapp', type: 'string', isPublic: true, value: values.whatsapp },
    { group: 'social', key: 'facebook', type: 'string', isPublic: true, value: values.facebook },
    { group: 'social', key: 'instagram', type: 'string', isPublic: true, value: values.instagram },
    { group: 'social', key: 'tiktok', type: 'string', isPublic: true, value: values.tiktok },
    { group: 'header', key: 'navigation', type: 'json', isPublic: true, value: values.headerNavigation },
    { group: 'footer', key: 'copyright', type: 'string', isPublic: true, value: values.footerCopyright },
    { group: 'footer', key: 'quick_links', type: 'json', isPublic: true, value: values.footerQuickLinks },
    { group: 'cta', key: 'primary_text', type: 'string', isPublic: true, value: values.primaryCtaText },
    { group: 'cta', key: 'primary_link', type: 'string', isPublic: true, value: values.primaryCtaLink },
    { group: 'seo', key: 'default_title', type: 'string', isPublic: true, value: values.defaultSeoTitle },
    { group: 'seo', key: 'default_description', type: 'text', isPublic: true, value: values.defaultSeoDescription },
    { group: 'seo', key: 'default_og_image', type: 'media', isPublic: true, value: values.defaultOgImage },
    { group: 'analytics', key: 'meta_pixel_enabled', type: 'boolean', isPublic: false, value: values.metaPixelEnabled },
    { group: 'analytics', key: 'meta_pixel_id', type: 'string', isPublic: false, value: values.metaPixelId },
    { group: 'legal', key: 'imprint_url', type: 'string', isPublic: true, value: values.imprintUrl },
    { group: 'legal', key: 'privacy_url', type: 'string', isPublic: true, value: values.privacyUrl },
    { group: 'legal', key: 'terms_url', type: 'string', isPublic: true, value: values.termsUrl },
    { group: 'legal', key: 'cookie_url', type: 'string', isPublic: true, value: values.cookieUrl },
  ];
}

export function updateSiteSettings(values: SiteSettingsFormValues) {
  return apiClient.put<SiteSettingsResponse>('/api/admin/site-settings', {
    items: toPayload(values),
  });
}

function getArrayValue<T>(settings: SiteSettingItem[], group: string, key: string, fallback: T[]): T[] {
  const value = settings.find((setting) => setting.group === group && setting.key === key)?.value;
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function getStringValue(settings: SiteSettingItem[], group: string, key: string) {
  const value = settings.find((setting) => setting.group === group && setting.key === key)?.value;
  return typeof value === 'string' ? value : '';
}

function getBooleanValue(settings: SiteSettingItem[], group: string, key: string) {
  return Boolean(settings.find((setting) => setting.group === group && setting.key === key)?.value);
}

function getMediaValue(settings: SiteSettingItem[], group: string, key: string): SiteSettingsMedia {
  const value = settings.find((setting) => setting.group === group && setting.key === key)?.value;

  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    (typeof candidate.id !== 'string' && typeof candidate.id !== 'number')
    || typeof candidate.url !== 'string'
    || typeof candidate.name !== 'string'
  ) {
    return null;
  }

  return candidate as NonNullable<SiteSettingsMedia>;
}

export function toSiteSettingsFormValues(settings: SiteSettingItem[]): SiteSettingsFormValues {
  return {
    siteName: getStringValue(settings, 'general', 'site_name'),
    logo: getMediaValue(settings, 'brand', 'logo'),
    phone: getStringValue(settings, 'contact', 'phone'),
    email: getStringValue(settings, 'contact', 'email'),
    address: getStringValue(settings, 'contact', 'address'),
    whatsapp: getStringValue(settings, 'contact', 'whatsapp'),
    facebook: getStringValue(settings, 'social', 'facebook'),
    instagram: getStringValue(settings, 'social', 'instagram'),
    tiktok: getStringValue(settings, 'social', 'tiktok'),
    footerCopyright: getStringValue(settings, 'footer', 'copyright'),
    footerQuickLinks: getArrayValue(settings, 'footer', 'quick_links', []),
    headerNavigation: getArrayValue(settings, 'header', 'navigation', []),
    primaryCtaText: getStringValue(settings, 'cta', 'primary_text'),
    primaryCtaLink: getStringValue(settings, 'cta', 'primary_link'),
    defaultSeoTitle: getStringValue(settings, 'seo', 'default_title'),
    defaultSeoDescription: getStringValue(settings, 'seo', 'default_description'),
    defaultOgImage: getMediaValue(settings, 'seo', 'default_og_image'),
    metaPixelEnabled: getBooleanValue(settings, 'analytics', 'meta_pixel_enabled'),
    metaPixelId: getStringValue(settings, 'analytics', 'meta_pixel_id'),
    imprintUrl: getStringValue(settings, 'legal', 'imprint_url'),
    privacyUrl: getStringValue(settings, 'legal', 'privacy_url'),
    termsUrl: getStringValue(settings, 'legal', 'terms_url'),
    cookieUrl: getStringValue(settings, 'legal', 'cookie_url'),
  };
}
