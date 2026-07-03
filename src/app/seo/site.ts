export function getSiteUrl() {
  const envUrl = (import.meta as any).env?.VITE_SITE_URL as string | undefined;
  const url = (envUrl || "https://adriaholiday.hu").trim().replace(/\/+$/, "");
  return url;
}

export function absoluteUrl(pathname: string) {
  const base = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
