import type { PublicSiteSettingsPayload } from "./site-settings.types";

function getBaseUrl() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, "");
  }

  return "/api";
}

export async function fetchPublicSiteSettings(): Promise<PublicSiteSettingsPayload> {
  const response = await fetch(`${getBaseUrl()}/portfolio/site-settings`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to load site settings: ${response.status}`);
  }

  return response.json() as Promise<PublicSiteSettingsPayload>;
}
