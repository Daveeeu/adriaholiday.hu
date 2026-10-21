import { Compass } from "lucide-react";

import OfferCard from "../components/OfferCard";
import type { PortfolioOfferCard } from "../content/portfolio-offers-api";
import { toUnifiedOfferCardModel } from "../content/portfolio-offer-card-model";

type AssistantRecommendationsProps = {
  trips: PortfolioOfferCard[];
  maxRecommendations: number;
};

/**
 * The trips the consultant is talking about, as the site's own offer cards.
 * They open in a new tab, so the conversation keeps going.
 */
export default function AssistantRecommendations({ trips, maxRecommendations }: AssistantRecommendationsProps) {
  return (
    <section aria-labelledby="assistant-recommendations-title" className="space-y-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="assistant-recommendations-title" className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Ajánlott utak
          </h2>
          <p className="text-sm text-[#64748b]">
            Csak a katalógusunkban szereplő utak. Az árak és a szabad helyek tájékoztató jellegűek, a foglaláskor véglegesítjük őket.
          </p>
        </div>
        {trips.length > 0 ? (
          <span className="text-sm font-medium text-[#00a878]">
            {trips.length} / {maxRecommendations} ajánlat
          </span>
        ) : null}
      </div>

      {trips.length === 0 ? (
        <div className="flex items-center gap-4 rounded-[28px] border border-dashed border-[#cfe0ec] bg-white/60 px-6 py-8 text-[#64748b]">
          <Compass className="size-8 shrink-0 text-[#16b8ff]" />
          <p>Itt jelennek meg az utak, amelyeket a tanácsadó a beszélgetés során ajánl neked.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <OfferCard
              key={trip.id}
              offer={toUnifiedOfferCardModel(trip)}
              ctaLabel="Megnézem"
              onClick={() => window.open(trip.link, "_blank", "noopener")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
