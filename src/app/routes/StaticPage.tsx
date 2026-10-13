import { Link } from "react-router";

import { sanitizeRichTextHtml } from "@/lib/rich-text";
import Seo from "../seo/Seo";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";
import { absoluteUrl } from "../seo/site";
import { CLUB_TERMS_PATH } from "../newsletter/travel-club";
import { INSURANCE_PATH } from "../booking/insurance";

export default function StaticPage({
  title,
  children,
  canonicalPath,
  noIndex,
}: {
  title: string;
  children?: React.ReactNode;
  canonicalPath?: string;
  noIndex?: boolean;
}) {
  const { settings } = useSiteSettings();
  const path = canonicalPath ?? "/";

  const pageContentMap: Record<string, string> = {
    "/impresszum": settings.imprintContent,
    "/adatvedelem": settings.privacyContent,
    "/aszf": settings.termsContent,
    "/sutik": settings.cookieContent,
    [CLUB_TERMS_PATH]: settings.clubTermsContent,
    [INSURANCE_PATH]: settings.insuranceContent,
  };

  const pageDescriptionMap: Record<string, string> = {
    "/impresszum": "Az Adria Holiday szolgáltatói és üzemeltetői adatai.",
    "/adatvedelem": "Az Adria Holiday adatkezelési tájékoztatója és adatvédelmi gyakorlata.",
    "/aszf": "Az Adria Holiday általános szerződési feltételei.",
    "/sutik": "Tájékoztató az Adria Holiday oldalon használt sütikről és hozzájáruláskezelésről.",
    [INSURANCE_PATH]: "Az Adria Holiday utazásaihoz köthető ALFA Compass utas- és útlemondási biztosítás díjai, szolgáltatásai és termékismertetője.",
    [CLUB_TERMS_PATH]: "Az Adria Holiday Utazási Klub és a hírlevél-feliratkozáskor kapott kedvezménykupon felhasználási feltételei.",
  };

  const contentHtml = sanitizeRichTextHtml(pageContentMap[path]);
  const description = pageDescriptionMap[path] ?? (settings.siteName ? `${title} – ${settings.siteName}` : title);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Főoldal",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: absoluteUrl(path),
      },
    ],
  };

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
  };

  return (
    <div className="min-h-screen bg-[#f7fbff]">
      <Seo
        title={title}
        description={description}
        canonicalPath={path}
        noIndex={noIndex}
        jsonLd={[breadcrumbJsonLd, pageJsonLd]}
      />
      <div className="mx-auto max-w-5xl px-8 py-16 md:px-12 lg:px-20">
        <div className="rounded-[36px] border border-[#dbe7f1] bg-white p-8 shadow-[0_22px_70px_rgba(15,23,42,0.06)] md:p-12">
          <h1 className="text-4xl font-bold tracking-tight text-[#0f172a]">
            {title}
          </h1>

          {children ? (
            <div className="mt-8 space-y-5 text-[1.05rem] leading-8 text-[#475569]">{children}</div>
          ) : (
            contentHtml !== "" ? (
              <div
                className="mt-8 space-y-4 text-[1.05rem] leading-8 text-[#475569]
                  [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-[#0f172a]
                  [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-[#0f172a]
                  [&_strong]:font-semibold [&_strong]:text-[#0f172a]
                  [&_a]:font-semibold [&_a]:text-[#00a878] [&_a:hover]:text-[#0f8fc9]
                  [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6
                  [&_li]:marker:text-[#00c389]
                  [&_table]:my-6 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-sm [&_table]:leading-6
                  [&_td]:border [&_td]:border-[#dbe7f1] [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_th]:border [&_th]:border-[#dbe7f1] [&_th]:px-3 [&_th]:py-2"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <p className="mt-8 text-[1.05rem] leading-8 text-[#475569]">
                Az oldal tartalma jelenleg frissítés alatt áll.
              </p>
            )
          )}

          <div className="mt-10">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-6 py-3 font-semibold text-white"
            >
              Vissza a főoldalra
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
