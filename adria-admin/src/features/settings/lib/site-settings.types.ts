import type { MediaAsset } from '@/services/media-service';

export type SiteSettingType =
  | 'string'
  | 'text'
  | 'json'
  | 'boolean'
  | 'number'
  | 'media';

export type SiteSettingGroup =
  | 'general'
  | 'brand'
  | 'contact'
  | 'social'
  | 'header'
  | 'footer'
  | 'cta'
  | 'seo'
  | 'analytics'
  | 'legal';

export type SiteLinkItem = {
  label: string;
  to: string;
};

export type SiteSettingsMedia = Pick<
  MediaAsset,
  'id' | 'url' | 'thumbnailUrl' | 'sizes' | 'alt' | 'title' | 'mimeType' | 'category' | 'categoryLabel' | 'sourceContext' | 'sourceId' | 'fileName' | 'name'
> | null;

export type SiteSettingItem = {
  id: number;
  group: SiteSettingGroup;
  key: string;
  type: SiteSettingType;
  isPublic: boolean;
  value: unknown;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SiteSettingsResponse = {
  items: SiteSettingItem[];
};

export type SiteSettingsFormValues = {
  siteName: string;
  logo: SiteSettingsMedia;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  footerCopyright: string;
  footerQuickLinks: SiteLinkItem[];
  headerNavigation: SiteLinkItem[];
  primaryCtaText: string;
  primaryCtaLink: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage: SiteSettingsMedia;
  metaPixelEnabled: boolean;
  metaPixelId: string;
  imprintUrl: string;
  privacyUrl: string;
  termsUrl: string;
  cookieUrl: string;
  aboutContent: string;
  contactContent: string;
  imprintContent: string;
  privacyContent: string;
  termsContent: string;
  cookieContent: string;
};
