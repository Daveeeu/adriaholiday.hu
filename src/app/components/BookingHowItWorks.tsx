import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { telHref } from "../site-settings/phone";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";
import { companyYears } from "../lib/companyYears";

type Contact = { icon: ReactNode; title: string; body: ReactNode };

/** How a booking proceeds and how to reach the office, under the booking form as on the legacy site. */
export default function BookingHowItWorks() {
  const { settings } = useSiteSettings();

  const steps: ReactNode[] = [
    "Ha foglalni szeretnél, töltsd ki a fenti űrlapot, és küldd el. Ha csak érdeklődnél, az alábbi elérhetőségek bármelyikén megteheted.",
    "A foglalási adatok megérkezése után pár percen belül e-mailben megkapod a visszaigazolásunkat a fizetéssel kapcsolatos tudnivalókkal és az utazási könyvvel.",
    "Az előleg beérkezése után kollégáink elkészítik a szerződésedet és a (előleg)számládat, amelyet e-mailben küldünk el. Ezzel létrejön az utazási szerződés, amelyen módosítani csak az Általános Szerződési Feltételek szerint lehet.",
    "Az előleget a visszaigazolásban szereplő bankszámlára utalhatod, vagy bármely OTP Bank fiókban készpénzben is befizetheted: autóbuszos utaknál a foglalás után 48 órán belül, közeli indulásnál 24 órán belül.",
    "Az utazáshoz szükséges részvételi jegyet néhány nappal indulás előtt küldjük el, benne minden fontos információval.",
    settings.email ? (
      <>
        További kérdéseidet az{" "}
        <a href={`mailto:${settings.email}`} className="font-semibold text-[#00a878] hover:text-[#0f8fc9]">
          {settings.email}
        </a>{" "}
        címen teheted fel.
      </>
    ) : (
      "További kérdéseidet telefonon vagy e-mailben is felteheted."
    ),
  ];

  const contactCards: Array<Contact | null> = [
    { icon: <ShieldCheck />, title: "Megbízhatóság", body: <p>Több mint {companyYears()} éve stabilan működünk!</p> },
    settings.phones.length > 0
      ? {
          icon: <Phone />,
          title: "Hívj bizalommal!",
          body: (
            <div className="flex flex-col gap-0.5">
              {settings.phones.map((phone) => (
                <a key={phone} href={telHref(phone)} className="hover:text-[#00a878]">
                  {phone}
                </a>
              ))}
            </div>
          ),
        }
      : null,
    settings.email
      ? {
          icon: <Mail />,
          title: "Írj nekünk",
          body: (
            <a href={`mailto:${settings.email}`} className="break-words hover:text-[#00a878]">
              {settings.email}
            </a>
          ),
        }
      : null,
    settings.address
      ? { icon: <MapPin />, title: "Ügyintézés helye", body: <p className="whitespace-pre-line">{settings.address}</p> }
      : null,
  ];
  const contacts = contactCards.filter((contact): contact is Contact => contact !== null);

  return (
    <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] md:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-[#0f172a]">Hogyan zajlik a foglalás?</h2>
      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-3 text-[#475569] leading-relaxed">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e6faf3] text-sm font-bold text-[#00a878]">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {contacts.map((contact) => (
          <div key={contact.title} className="rounded-[22px] bg-[#f5f9fc] p-4 text-sm text-[#334155]">
            <div className="mb-2 text-[#00c389] [&_svg]:h-5 [&_svg]:w-5">{contact.icon}</div>
            <div className="mb-1 font-bold text-[#0f172a]">{contact.title}</div>
            {contact.body}
          </div>
        ))}
      </div>
    </section>
  );
}
