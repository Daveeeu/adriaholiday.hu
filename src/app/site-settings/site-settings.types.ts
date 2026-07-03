export type SiteLinkItem = {
  label: string;
  to: string;
};

export type SiteMedia = {
  id?: string | number;
  url: string;
  thumbnailUrl?: string | null;
  sizes?: {
    thumbnail?: string | null;
    preview?: string | null;
    large?: string | null;
    original?: string | null;
  } | null;
  alt?: string | null;
  title?: string | null;
  mimeType?: string | null;
} | null;

export type PublicSiteSettingsPayload = {
  general?: { site_name?: string };
  brand?: { logo?: SiteMedia };
  contact?: { phone?: string; email?: string; address?: string; whatsapp?: string };
  social?: { facebook?: string; instagram?: string; tiktok?: string };
  header?: { navigation?: SiteLinkItem[] };
  footer?: { copyright?: string; quick_links?: SiteLinkItem[] };
  cta?: { primary_text?: string; primary_link?: string };
  seo?: { default_title?: string; default_description?: string; default_og_image?: SiteMedia };
  legal?: { imprint_url?: string; privacy_url?: string; terms_url?: string; cookie_url?: string };
};

export type ResolvedSiteSettings = {
  siteName: string;
  logo: SiteMedia;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  headerNavigation: SiteLinkItem[];
  footerQuickLinks: SiteLinkItem[];
  footerCopyright: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage: SiteMedia;
  imprintUrl: string;
  privacyUrl: string;
  termsUrl: string;
  cookieUrl: string;
};
