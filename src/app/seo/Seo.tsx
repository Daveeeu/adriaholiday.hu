import { Helmet } from "react-helmet-async";
import { absoluteUrl, SITE_NAME } from "./site";

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
  title: string;
  description: string;
  canonicalPath: string;
  ogImageUrl?: string;
  ogType?: "website" | "article" | "product";
  noIndex?: boolean;
  jsonLd?: JsonLd | JsonLd[];
}) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = absoluteUrl(canonicalPath);
  const imageUrl =
    ogImageUrl ??
    "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1200x630;";

  const robots = noIndex
    ? "noindex,nofollow"
    : "index,follow,max-image-preview:large";

  const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType ?? "website"} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {jsonLdArray.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
