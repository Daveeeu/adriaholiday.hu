import { Clock, Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router";

import { sanitizeRichTextHtml } from "@/lib/rich-text";
import ContactForm from "../components/ContactForm";
import Seo from "../seo/Seo";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";
import { absoluteUrl } from "../seo/site";

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
    "/kapcsolat": settings.contactContent,
    "/impresszum": settings.imprintContent,
    "/adatvedelem": settings.privacyContent,
    "/aszf": settings.termsContent,
    "/sutik": settings.cookieContent,
  };

  const pageDescriptionMap: Record<string, string> = {
    "/kapcsolat": "Kapcsolatfelvételi lehetőségek, ügyfélszolgálati elérhetőségek és ajánlatkérési információk.",
    "/impresszum": "Az Adria Holiday szolgáltatói és üzemeltetői adatai.",
    "/adatvedelem": "Az Adria Holiday adatkezelési tájékoztatója és adatvédelmi gyakorlata.",
    "/aszf": "Az Adria Holiday általános szerződési feltételei.",
    "/sutik": "Tájékoztató az Adria Holiday oldalon használt sütikről és hozzájáruláskezelésről.",
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

          {path === "/kapcsolat" ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {settings.phone ? (
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                  className="flex items-start gap-3 rounded-2xl border border-[#dbe7f1] bg-[#f8fcff] p-4 text-[#0f172a]"
                >
                  <Phone className="mt-1 size-5 text-[#00a878]" />
                  <span>{settings.phone}</span>
                </a>
              ) : null}
              {settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-start gap-3 rounded-2xl border border-[#dbe7f1] bg-[#f8fcff] p-4 text-[#0f172a]"
                >
                  <Mail className="mt-1 size-5 text-[#00a878]" />
                  <span className="break-all">{settings.email}</span>
                </a>
              ) : null}
              {settings.whatsapp ? (
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-2xl border border-[#dbe7f1] bg-[#f8fcff] p-4 text-[#0f172a]"
                >
                  <MessageCircle className="mt-1 size-5 text-[#00a878]" />
                  <span>WhatsApp: {settings.whatsapp}</span>
                </a>
              ) : null}
              {settings.address ? (
                <div className="flex items-start gap-3 rounded-2xl border border-[#dbe7f1] bg-[#f8fcff] p-4 text-[#0f172a]">
                  <MapPin className="mt-1 size-5 text-[#00a878]" />
                  <span className="whitespace-pre-line">{settings.address}</span>
                </div>
              ) : null}
              {settings.openingHours ? (
                <div className="flex items-start gap-3 rounded-2xl border border-[#dbe7f1] bg-[#f8fcff] p-4 text-[#0f172a]">
                  <Clock className="mt-1 size-5 text-[#00a878]" />
                  <span className="whitespace-pre-line">{settings.openingHours}</span>
                </div>
              ) : null}
            </div>
          ) : null}

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
                  [&_li]:marker:text-[#00c389]"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <p className="mt-8 text-[1.05rem] leading-8 text-[#475569]">
                Az oldal tartalma jelenleg frissítés alatt áll.
              </p>
            )
          )}

          {path === "/kapcsolat" ? (
            <div className="mt-10">
              <ContactForm />
            </div>
          ) : null}

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
