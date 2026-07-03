import { Helmet } from "react-helmet-async";

import { useSiteSettings } from "../site-settings/SiteSettingsProvider";
import { absoluteUrl } from "./site";

type JsonLd = Record<string, any>;

export default function Seo({
  title,
  description,
  canonicalPath,
  ogImageUrl,
  ogType,
  noIndex,
  jsonLd,
}: {
  title?: string;
  description?: string;
  canonicalPath: string;
  ogImageUrl?: string;
  ogType?: "website" | "article" | "product";
  noIndex?: boolean;
  jsonLd?: JsonLd | JsonLd[];
}) {
  const { settings } = useSiteSettings();
  const siteName = settings.siteName || settings.defaultSeoTitle || "";
  const effectiveTitle = title?.trim() || settings.defaultSeoTitle || siteName;
  const effectiveDescription = description?.trim() || settings.defaultSeoDescription || "";
  const fullTitle = siteName && effectiveTitle && !effectiveTitle.includes(siteName)
    ? `${effectiveTitle} | ${siteName}`
    : effectiveTitle;
  const canonicalUrl = absoluteUrl(canonicalPath);
  const imageUrl = ogImageUrl ?? settings.defaultOgImage?.sizes?.large ?? settings.defaultOgImage?.url;

  const robots = noIndex
    ? "noindex,nofollow"
    : "index,follow,max-image-preview:large";

  const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      {fullTitle ? <title>{fullTitle}</title> : null}
      {effectiveDescription ? <meta name="description" content={effectiveDescription} /> : null}
      <meta name="robots" content={robots} />

      <link rel="canonical" href={canonicalUrl} />

      {siteName ? <meta property="og:site_name" content={siteName} /> : null}
      <meta property="og:type" content={ogType ?? "website"} />
      {fullTitle ? <meta property="og:title" content={fullTitle} /> : null}
      {effectiveDescription ? <meta property="og:description" content={effectiveDescription} /> : null}
      <meta property="og:url" content={canonicalUrl} />
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      {fullTitle ? <meta name="twitter:title" content={fullTitle} /> : null}
      {effectiveDescription ? <meta name="twitter:description" content={effectiveDescription} /> : null}
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}

      {jsonLdArray.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
