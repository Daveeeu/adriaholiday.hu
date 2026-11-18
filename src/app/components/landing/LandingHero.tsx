import { Search, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { offers } from "../../data/offers";

export default function LandingHero({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const featured = useMemo(() => {
    return (
      offers.find((o) => o.badge === "Népszerű") ??
      offers.find((o) => o.guaranteed) ??
      offers[0]
    );
  }, []);

  return (
    <section className="relative bg-white" aria-label="Kezdőszakasz">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-20 pt-10 sm:pt-14 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <div>
            <p className="text-sm font-semibold text-slate-600">
              Prémium buszos és repülős utazások
            </p>

            <h2 className="mt-3 text-slate-900 font-semibold tracking-[-0.04em] leading-[1.05] text-[clamp(2.1rem,5vw,3.4rem)]">
              Kényelmes utazás.{" "}
              <span className="text-slate-900">Tiszta ajánlatok.</span>{" "}
              <span className="text-slate-700">Magyar szervezés.</span>
            </h2>

            <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              Válassz úti célt, és mutatjuk a legjobb, átlátható indulásokat —
              rejtett meglepetések nélkül.
            </p>

            <form
              className="mt-6 rounded-2xl border border-black/10 bg-white p-3 shadow-sm"
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = query.trim();
                onSearch(trimmed);
                const el = document.getElementById("featured-trips");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              aria-label="Keresés"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1">
                  <span className="sr-only">Úti cél</span>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Úti cél, ország vagy város (pl. Albánia, London)"
                      className="w-full h-12 pl-9 pr-3 rounded-xl border border-black/10 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      autoComplete="off"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  className="h-12 px-5 rounded-xl bg-[#00c389] text-white font-semibold shadow-[0_10px_26px_rgba(0,195,137,0.20)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Keresés
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00c389]" />
                  Biztonságos foglalás
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00c389]" />
                  15+ év tapasztalat
                </span>
                <Link
                  to="/utazasok"
                  className="inline-flex items-center gap-1.5 font-semibold text-slate-900 hover:underline underline-offset-4"
                >
                  Összes ajánlat
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </form>
          </div>

          <aside className="lg:pt-1" aria-label="Kiemelt ajánlat">
            <div className="rounded-3xl border border-black/10 bg-white overflow-hidden shadow-sm">
              <div className="relative h-56 sm:h-64">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute left-4 bottom-4 right-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                    Kiemelt ajánlat
                    {featured.badge ? (
                      <span className="text-slate-500">• {featured.badge}</span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-white text-xl font-semibold leading-tight">
                    {featured.title}
                  </div>
                  <div className="mt-1 text-white/85 text-sm">
                    {featured.departure} • {featured.duration ?? featured.country}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      Árak
                    </div>
                    <div className="text-slate-900 text-2xl font-semibold tracking-[-0.02em]">
                      {featured.price}
                      <span className="text-slate-500 text-sm font-semibold">
                        {" "}
                        -tól/fő
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/ajanlat/${featured.slug}`)}
                    className="h-11 px-4 rounded-xl border border-black/10 bg-white text-slate-900 font-semibold hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-label={`${featured.title} részletek`}
                  >
                    Részletek
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

