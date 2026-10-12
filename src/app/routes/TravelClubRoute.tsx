import { motion } from "motion/react";
import { BadgePercent, Bell, Check, Gift, Loader2, Mail, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import Seo from "../seo/Seo";
import { absoluteUrl } from "../seo/site";
import { CLUB_TERMS_PATH, TRAVEL_CLUB_PATH } from "../newsletter/travel-club";
import { useNewsletterSubscription } from "../newsletter/useNewsletterSubscription";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";

const TITLE = "Utazási Klub";
const DESCRIPTION =
  "Iratkozz fel az Adria Holiday hírlevelére: folyamatos akciók, egyedi ajánlatok és ajándék kedvezménykupon az első foglalásodhoz.";

const benefits = [
  { icon: <Bell className="size-5" />, title: "Folyamatos akciók", description: "Az aktuális utakról és kedvezményekről elsőként értesülsz." },
  { icon: <Sparkles className="size-5" />, title: "Egyedi ajánlatok", description: "Csak klubtagoknak szóló ajánlatokat is küldünk." },
  { icon: <Gift className="size-5" />, title: "Nyereményjátékok", description: "Részt vehetsz az időnként meghirdetett ajándéksorsolásokon." },
];

const validFor = [
  "Az Adria Holiday által szervezett társas, autóbuszos utazásokra",
  "60 000 Ft/fő feletti részvételi díjú utazásoknál",
  "A weboldalon, online leadott foglalásnál",
];

const notValidFor = [
  "Akciós utazásokra",
  "Adventi utazásokra",
  "Velencei karnevál programokra",
  "Repülőjegy-foglalásra",
  "Egyéni szállásfoglalásra",
];

const rules = [
  "Foglalásonként egy kupon használható fel.",
  "Egy email címre egy kupon igényelhető.",
  "A kupon készpénzre nem váltható, és nem ruházható át másra.",
  "A kupon csak az érvényességi idején belül használható fel.",
];

export default function TravelClubRoute() {
  const { settings } = useSiteSettings();
  const { email, setEmail, status, feedback, isSubmitting, handleSubmit } = useNewsletterSubscription();
  const couponValue = settings.newsletterCouponValue;
  const couponLabel = couponValue > 0 ? `${couponValue.toLocaleString("hu-HU")} Ft` : "";

  const steps = [
    "Add meg az email címed, és iratkozz fel a hírlevélre.",
    `A visszaigazoló emailben elküldjük a${couponLabel ? ` ${couponLabel} értékű` : ""} kuponkódodat.`,
    "Foglaláskor írd be a kuponkódot – a kedvezményt automatikusan levonjuk a végösszegből.",
  ];

  return (
    <div className="min-h-screen bg-[#f7fbff]">
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        canonicalPath={TRAVEL_CLUB_PATH}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Főoldal", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: TITLE, item: absoluteUrl(TRAVEL_CLUB_PATH) },
            ],
          },
        ]}
      />

      <section className="relative overflow-hidden bg-[#071321] pb-40 pt-36">
        <div className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-[#00c389]/20 blur-[120px]" />
        <div className="absolute -right-32 top-20 h-[420px] w-[420px] rounded-full bg-[#16b8ff]/20 blur-[120px]" />
        <motion.div
          className="relative mx-auto max-w-4xl px-6 text-center md:px-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex rounded-full bg-white/10 px-5 py-2 text-sm font-semibold tracking-wide text-[#5eead4]">
            ADRIA HOLIDAY UTAZÁSI KLUB
          </span>
          <h1 className="mt-5 text-[clamp(2.4rem,5vw,4.2rem)] font-bold leading-[1.04] tracking-[-0.045em] text-white">
            Csatlakozz a klubhoz,{" "}
            <span className="bg-gradient-to-r from-[#34d399] to-[#38bdf8] bg-clip-text text-transparent">
              {couponLabel ? `és kapj ${couponLabel} kedvezményt` : "és utazz kedvezőbben"}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            A klubtagság ingyenes: elég feliratkoznod a hírlevelünkre. Cserébe elsőként kapod az akciókat, egyedi ajánlatokat
            {couponLabel ? `, és ajándékba küldünk egy ${couponLabel} értékű kedvezménykupont` : ""}.
          </p>
        </motion.div>
      </section>

      <div className="relative -mt-28 mx-auto max-w-5xl space-y-6 px-6 pb-24 md:px-10">
        <motion.form
          onSubmit={handleSubmit}
          className="rounded-[32px] border border-[#dbe7f1] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] md:p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-[#0f172a]">Feliratkozás a hírlevélre</h2>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Email cím</span>
              <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                placeholder="Add meg az email címed"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-2xl border border-[#dbe7f1] bg-[#f7fbff] py-4 pl-12 pr-4 text-[#0f172a] placeholder-gray-400 focus:border-[#00c389] focus:outline-none disabled:opacity-60"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-6 py-4 font-semibold text-white shadow-[0_8px_24px_rgba(0,195,137,0.25)] disabled:opacity-70"
            >
              Feliratkozás
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
          {feedback ? (
            <p role="status" className={`mt-3 text-sm font-medium ${status === "error" ? "text-red-600" : "text-[#00a878]"}`}>
              {feedback}
            </p>
          ) : null}
          <p className="mt-4 flex items-start gap-2 text-sm text-[#64748b]">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#00a878]" />
            <span>
              A feliratkozással elfogadod az{" "}
              <Link to={CLUB_TERMS_PATH} className="font-semibold text-[#00a878] hover:text-[#0f8fc9]">
                Utazási Klub felhasználási feltételeit
              </Link>
              .
            </span>
          </p>
        </motion.form>

        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-[24px] border border-[#dbe7f1] bg-white p-6">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00c389] to-[#16b8ff] text-white">
                {benefit.icon}
              </span>
              <h3 className="mt-4 text-lg font-bold text-[#0f172a]">{benefit.title}</h3>
              <p className="mt-1 text-[#64748b]">{benefit.description}</p>
            </div>
          ))}
        </div>

        <Card icon={<BadgePercent className="size-5" />} title="Így kapod meg és így használod a kupont">
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e6faf3] text-sm font-bold text-[#00a878]">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card icon={<Check className="size-5" />} title="Mire érvényes?">
            <List items={validFor} marker={<Check className="size-4 text-[#00a878]" />} />
          </Card>
          <Card icon={<X className="size-5" />} title="Mire nem érvényes?" tone="muted">
            <List items={notValidFor} marker={<X className="size-4 text-[#e11d48]" />} />
          </Card>
        </div>

        <Card icon={<ShieldCheck className="size-5" />} title="Jó tudni">
          <List items={rules} marker={<span className="mt-2 size-1.5 rounded-full bg-[#00c389]" />} />
          <p className="mt-5 text-sm text-[#64748b]">
            A részletes szabályokat az{" "}
            <Link to={CLUB_TERMS_PATH} className="font-semibold text-[#00a878] hover:text-[#0f8fc9]">
              Utazási Klub felhasználási feltételei
            </Link>{" "}
            tartalmazzák.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Card({ icon, title, tone = "default", children }: { icon: ReactNode; title: string; tone?: "default" | "muted"; children: ReactNode }) {
  return (
    <section className={`rounded-[28px] border border-[#dbe7f1] p-6 md:p-8 ${tone === "muted" ? "bg-[#fbfcfe]" : "bg-white"}`}>
      <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight text-[#0f172a]">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#e6faf3] text-[#00a878]">{icon}</span>
        {title}
      </h2>
      <div className="mt-5 text-[1.02rem] leading-7 text-[#475569]">{children}</div>
    </section>
  );
}

function List({ items, marker }: { items: string[]; marker: ReactNode }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-1.5 flex shrink-0 items-center">{marker}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
