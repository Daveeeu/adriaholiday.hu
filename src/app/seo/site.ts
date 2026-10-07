export function getSiteUrl() {
  const envUrl = import.meta.env.VITE_SITE_URL as string | undefined;
  const url = (envUrl || "https://adriaholiday.hu").trim().replace(/\/+$/, "");
  return url;
}

/**
 * Whether the site runs on its canonical domain; any other host (e.g. a staging
 * domain) must not be indexed. The server marks those pages noindex as well.
 */
export function isCanonicalHost() {
  return typeof window === "undefined" || window.location.host === new URL(getSiteUrl()).host;
}

export function absoluteUrl(pathname: string) {
  const base = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
