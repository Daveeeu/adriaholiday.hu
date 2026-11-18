import { useMemo } from "react";
import { Link } from "react-router";
import { Offer, offers } from "../../data/offers";
import OfferCard from "../cards/OfferCard";

function matchesQuery(offer: Offer, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    offer.title,
    offer.country,
    offer.departure,
    offer.duration ?? "",
    offer.transport,
    offer.hotel,
    offer.shortDescription ?? "",
    ...(offer.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export default function FeaturedTripsLanding({
  query,
  maxVisible = 6,
  onClearQuery,
}: {
  query: string;
  maxVisible?: number;
  onClearQuery: () => void;
}) {
  const visible = useMemo(() => {
    const filtered = offers.filter((o) => matchesQuery(o, query));
    const sorted = [...filtered].sort((a, b) => b.priceNumber - a.priceNumber);
    return sorted.slice(0, Math.max(3, Math.min(maxVisible, 6)));
  }, [query, maxVisible]);

  const featured = visible[0];
  const rest = visible.slice(1);

  return (
    <section
      id="featured-trips"
      className="bg-white"
      aria-labelledby="featured-trips-title"
    >
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-20 py-12 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2
              id="featured-trips-title"
              className="text-slate-900 font-semibold tracking-[-0.03em] text-2xl sm:text-3xl"
            >
              Kiemelt utak
            </h2>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Rövid lista a legnépszerűbb ajánlatokból — kevesebb görgetés,
              gyorsabb döntés.
            </p>
          </div>

          <Link
            to="/utazasok"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline underline-offset-4"
          >
            Összes ajánlat
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {visible.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-slate-700 font-semibold">
              Nincs találat erre: <span className="text-slate-900">“{query}”</span>
            </p>
            <button
              type="button"
              className="mt-4 h-11 px-4 rounded-xl border border-black/10 bg-white text-slate-900 font-semibold hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              onClick={onClearQuery}
            >
              Keresés törlése
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {featured ? (
              <OfferCard
                offer={featured}
                to={`/ajanlat/${featured.slug}`}
                variant="featured"
                eyebrow="Kiemelt"
                className="lg:col-span-2"
              />
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              {rest.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  to={`/ajanlat/${offer.slug}`}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
