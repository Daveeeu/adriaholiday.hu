import { ShieldCheck, Star, Users } from "lucide-react";

const testimonials = [
  {
    name: "B. Angéla",
    context: "Ausztria körutazás",
    text: "Minden részlet gördülékenyen volt megszervezve, az idegenvezető fantasztikus volt, a sofőrök pedig végig biztonságos és kényelmes utazást biztosítottak.",
  },
  {
    name: "Annamária",
    context: "London repülős út",
    text: "Kedves, türelmes és figyelmes idegenvezetőt ismertünk meg. Biztosan nem ez volt az utolsó közös utunk.",
  },
  {
    name: "H. Katalin",
    context: "Cseh kastélyok",
    text: "Az utazás teljesen zökkenőmentes volt, az idegenvezető óriási tudással és kedvességgel vezette végig az utat.",
  },
] as const;

export default function LandingTrust() {
  return (
    <section className="bg-slate-50 border-y border-black/5" aria-labelledby="trust-title">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-20 py-12 sm:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="trust-title"
              className="text-slate-900 font-semibold tracking-[-0.03em] text-2xl sm:text-3xl"
            >
              Bizalom, amiért érdemes velünk utazni
            </h2>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Valódi utasélmények, átlátható folyamatok, és szervezés, amire lehet
              építeni.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <Star className="w-4 h-4 text-[#00c389]" />
              4.9/5
            </span>
            <span className="text-slate-400">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#00c389]" />
              10 000+ utas
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm"
            >
              <blockquote className="text-slate-700 leading-relaxed">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <div className="font-semibold text-slate-900">{t.name}</div>
                <div className="text-slate-500">{t.context}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: <ShieldCheck className="w-5 h-5 text-[#00c389]" />,
              title: "Biztonságos foglalás",
              text: "Átlátható feltételek, egyértelmű következő lépések.",
            },
            {
              icon: <ShieldCheck className="w-5 h-5 text-[#00c389]" />,
              title: "Garantált indulások",
              text: "Kiszámítható szervezés, stabil háttérrel.",
            },
            {
              icon: <ShieldCheck className="w-5 h-5 text-[#00c389]" />,
              title: "Segítőkész csapat",
              text: "Gyors válaszok, utazás előtti és alatti támogatás.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white border border-black/5 p-4 flex gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00c389]/10 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="text-slate-900 font-semibold">{item.title}</div>
                <div className="text-slate-600 text-sm mt-0.5">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

