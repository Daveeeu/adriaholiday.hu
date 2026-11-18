import { Award, Bus, ShieldCheck, Users } from "lucide-react";

const reasons = [
  {
    icon: <Award className="w-5 h-5 text-[#00c389]" />,
    title: "15+ év tapasztalat",
    text: "Stabil háttér, jól szervezett utak, rutinos csapat.",
  },
  {
    icon: <Bus className="w-5 h-5 text-[#00c389]" />,
    title: "Kényelmes utazás",
    text: "Modern buszok és átgondolt menetrend a nyugodt úthoz.",
  },
  {
    icon: <Users className="w-5 h-5 text-[#00c389]" />,
    title: "Magyar kísérés",
    text: "Támogatás és tájékoztatás az út során, emberi hangon.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#00c389]" />,
    title: "Kiszámítható feltételek",
    text: "Átlátható kommunikáció, kevesebb bizonytalanság.",
  },
] as const;

export default function WhyUsLanding() {
  return (
    <section className="bg-white border-y border-black/5" aria-labelledby="why-us-title">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-20 py-12 sm:py-14">
        <h2
          id="why-us-title"
          className="text-slate-900 font-semibold tracking-[-0.03em] text-2xl sm:text-3xl"
        >
          Miért az Adria Holiday?
        </h2>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Röviden: kevesebb stressz, több élmény. Itt vannak a legfontosabb
          okok.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="rounded-2xl border border-black/5 bg-slate-50 p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center">
                {r.icon}
              </div>
              <div className="mt-4 font-semibold text-slate-900">{r.title}</div>
              <div className="mt-1 text-sm text-slate-600 leading-relaxed">
                {r.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

