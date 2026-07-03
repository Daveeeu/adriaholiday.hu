import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { fetchPublicSiteSettings } from "./site-settings-api";
import type { PublicSiteSettingsPayload, ResolvedSiteSettings } from "./site-settings.types";

type SiteSettingsContextValue = {
  isLoading: boolean;
  settings: ResolvedSiteSettings;
  raw: PublicSiteSettingsPayload;
};

const emptySettings: ResolvedSiteSettings = {
  siteName: "",
  logo: null,
  phone: "",
  email: "",
  address: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  headerNavigation: [],
  footerQuickLinks: [],
  footerCopyright: "",
  primaryCtaText: "",
  primaryCtaLink: "",
  defaultSeoTitle: "",
  defaultSeoDescription: "",
  defaultOgImage: null,
  imprintUrl: "",
  privacyUrl: "",
  termsUrl: "",
  cookieUrl: "",
  aboutContent: "",
  contactContent: "",
  imprintContent: "",
  privacyContent: "",
  termsContent: "",
  cookieContent: "",
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  isLoading: true,
  settings: emptySettings,
  raw: {},
});

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeLinkItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is { label: string; to: string } => {
    return !!item
      && typeof item === "object"
      && typeof item.label === "string"
      && item.label.trim() !== ""
      && typeof item.to === "string"
      && item.to.trim() !== "";
  });
}

function resolveSettings(payload: PublicSiteSettingsPayload): ResolvedSiteSettings {
  return {
    siteName: asString(payload.general?.site_name),
    logo: payload.brand?.logo && typeof payload.brand.logo === "object" ? payload.brand.logo : null,
    phone: asString(payload.contact?.phone),
    email: asString(payload.contact?.email),
    address: asString(payload.contact?.address),
    whatsapp: asString(payload.contact?.whatsapp),
    facebook: asString(payload.social?.facebook),
    instagram: asString(payload.social?.instagram),
    tiktok: asString(payload.social?.tiktok),
    headerNavigation: sanitizeLinkItems(payload.header?.navigation),
    footerQuickLinks: sanitizeLinkItems(payload.footer?.quick_links),
    footerCopyright: asString(payload.footer?.copyright),
    primaryCtaText: asString(payload.cta?.primary_text),
    primaryCtaLink: asString(payload.cta?.primary_link),
    defaultSeoTitle: asString(payload.seo?.default_title),
    defaultSeoDescription: asString(payload.seo?.default_description),
    defaultOgImage: payload.seo?.default_og_image && typeof payload.seo.default_og_image === "object"
      ? payload.seo.default_og_image
      : null,
    imprintUrl: asString(payload.legal?.imprint_url),
    privacyUrl: asString(payload.legal?.privacy_url),
    termsUrl: asString(payload.legal?.terms_url),
    cookieUrl: asString(payload.legal?.cookie_url),
    aboutContent: asString(payload.legal?.about_content),
    contactContent: asString(payload.legal?.contact_content),
    imprintContent: asString(payload.legal?.imprint_content),
    privacyContent: asString(payload.legal?.privacy_content),
    termsContent: asString(payload.legal?.terms_content),
    cookieContent: asString(payload.legal?.cookie_content),
  };
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [raw, setRaw] = useState<PublicSiteSettingsPayload>({});

  useEffect(() => {
    let active = true;

    fetchPublicSiteSettings()
      .then((payload) => {
        if (active) {
          setRaw(payload);
        }
      })
      .catch(() => {
        if (active) {
          setRaw({});
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SiteSettingsContextValue>(() => ({
    isLoading,
    raw,
    settings: resolveSettings(raw),
  }), [isLoading, raw]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
