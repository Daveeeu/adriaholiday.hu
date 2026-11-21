import { ArrowRight } from "lucide-react";

import type { UnifiedOfferCardModel } from "../content/portfolio-offer-card-model";
import { responsiveImage } from "../lib/responsiveImage";
import { offerMetaItems } from "./offer-card/offer-meta-items";
import { OfferLink } from "./OfferResultCard";

/**
 * The large first card of the homepage's featured offers: the photo fills the
 * whole card and the trip's name, dates, price and button sit on it.
 */
export default function OfferHeroCard({ offer }: { offer: UnifiedOfferCardModel }) {
  const metaItems = offerMetaItems(offer);

  return (
    <OfferLink
      slug={offer.seoName}
      className="group relative flex h-full min-h-[460px] w-full overflow-hidden rounded-[30px] text-left shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all hover:shadow-[0_18px_60px_rgba(0,195,137,0.18)]"
    >
      {offer.imageUrl ? (
        <img
          {...responsiveImage(offer.imageUrl)}
          sizes="(min-width: 1024px) 66vw, 100vw"
          alt={offer.imageAlt ?? offer.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400 via-slate-300 to-slate-200" />
      )}
      {/* Darkened from the bottom up, so the text stays readable and the top of the photo clear. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

      {offer.primaryBadge ? (
        <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
          {offer.primaryBadge}
        </span>
      ) : null}

      <div className="relative mt-auto w-full px-6 pb-6 pt-16 md:px-8 md:pb-8">
        <h3 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-4xl">{offer.name}</h3>
        {offer.description ? (
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/80 md:text-base">{offer.description}</p>
        ) : null}

        <ul className="mt-5 flex flex-wrap gap-2">
          {metaItems.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
            >
              <span className="shrink-0 text-[#5ff0c4]">{item.icon}</span>
              {item.value}
              {item.key === "departure" && offer.otherDepartureCount > 0 ? (
                <span className="text-[#5ff0c4]">+{offer.otherDepartureCount} további időpont</span>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1 text-xs text-white/70">Induló ár</div>
            <div className="text-3xl font-bold text-white md:text-4xl">{offer.displayedPrice ?? "Ár hamarosan"}</div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-6 py-3 text-sm font-semibold text-white shadow-lg">
            Részletek
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </OfferLink>
  );
}
