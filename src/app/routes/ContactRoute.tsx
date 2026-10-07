import { motion } from "motion/react";
import { ArrowUpRight, Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { ReactNode } from "react";

import ContactForm from "../components/ContactForm";
import RichTextContent from "../components/RichTextContent";
import { sanitizeRichTextHtml } from "@/lib/rich-text";
import Seo from "../seo/Seo";
import { absoluteUrl } from "../seo/site";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";

const PATH = "/kapcsolat";
const TITLE = "Kapcsolat";
const DESCRIPTION = "Hívj, írj, vagy gyere be az irodába – segítünk megtalálni a következő utadat.";

type ContactCard = {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
  action?: string;
  external?: boolean;
};

export default function ContactRoute() {
  const { settings } = useSiteSettings();
  const extraContent = sanitizeRichTextHtml(settings.contactContent);

  const cards: ContactCard[] = [
    settings.phone
      ? { icon: <Phone className="size-5" />, label: "Telefon", value: settings.phone, href: `tel:${settings.phone.replace(/\s+/g, "")}`, action: "Hívás" }
      : null,
    settings.email
      ? { icon: <Mail className="size-5" />, label: "E-mail", value: settings.email, href: `mailto:${settings.email}`, action: "Levél írása" }
      : null,
    settings.whatsapp
      ? { icon: <MessageCircle className="size-5" />, label: "WhatsApp", value: settings.whatsapp, href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`, action: "Üzenet", external: true }
      : null,
    settings.address
      ? {
          icon: <MapPin className="size-5" />,
          label: "Iroda",
          value: settings.address,
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`,
          action: "Útvonaltervezés",
          external: true,
        }
      : null,
    settings.openingHours ? { icon: <Clock className="size-5" />, label: "Nyitvatartás", value: settings.openingHours } : null,
  ].filter((card): card is ContactCard => card !== null);

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        canonicalPath={PATH}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Főoldal", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: TITLE, item: absoluteUrl(PATH) },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            name: settings.siteName || "Adria Holiday",
            url: absoluteUrl("/"),
            telephone: settings.phone || undefined,
            email: settings.email || undefined,
            address: settings.address || undefined,
          },
        ]}
      />

      <section className="relative overflow-hidden bg-[#071321] pb-40 pt-36">
        <div className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-[#00c389]/20 blur-[120px]" />
        <div className="absolute -right-32 top-20 h-[420px] w-[420px] rounded-full bg-[#16b8ff]/20 blur-[120px]" />
        <motion.div
          className="relative mx-auto max-w-6xl px-6 text-center md:px-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex rounded-full bg-white/10 px-5 py-2 text-sm font-semibold tracking-wide text-[#5eead4]">KAPCSOLAT</span>
          <h1 className="mt-5 text-[clamp(2.4rem,5vw,4.2rem)] font-bold leading-[1.04] tracking-[-0.045em] text-white">
            Beszéljünk a{" "}
            <span className="bg-gradient-to-r from-[#34d399] to-[#38bdf8] bg-clip-text text-transparent">következő utadról</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">{DESCRIPTION}</p>
        </motion.div>
      </section>

      <section className="relative -mt-28 pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:px-10 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {cards.map((card) => {
              const content = (
                <>
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00c389] to-[#16b8ff] text-white shadow-[0_10px_24px_rgba(0,195,137,0.3)]">
                    {card.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{card.label}</span>
                    <span className="mt-1 block whitespace-pre-line break-words text-lg font-semibold text-[#0f172a]">{card.value}</span>
                    {card.action ? (
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#00a878] transition-colors group-hover:text-[#0f8fc9]">
                        {card.action}
                        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    ) : null}
                  </span>
                </>
              );
              const className =
                "group flex items-start gap-4 rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] transition-all duration-300";

              return card.href ? (
                <a
                  key={card.label}
                  href={card.href}
                  {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`${className} hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,195,137,0.16)]`}
                >
                  {content}
                </a>
              ) : (
                <div key={card.label} className={className}>
                  {content}
                </div>
              );
            })}

            {settings.facebook || settings.instagram ? (
              <div className="flex gap-3 pt-2">
                {settings.facebook ? (
                  <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex size-12 items-center justify-center rounded-2xl border border-gray-100 bg-white text-[#0f172a] shadow-sm transition-colors hover:text-[#00a878]">
                    <Facebook className="size-5" />
                  </a>
                ) : null}
                {settings.instagram ? (
                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex size-12 items-center justify-center rounded-2xl border border-gray-100 bg-white text-[#0f172a] shadow-sm transition-colors hover:text-[#00a878]">
                    <Instagram className="size-5" />
                  </a>
                ) : null}
              </div>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <ContactForm />
          </motion.div>
        </div>

        {extraContent !== "" ? (
          <div className="mx-auto mt-16 max-w-3xl px-6 md:px-10">
            <RichTextContent html={extraContent} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
