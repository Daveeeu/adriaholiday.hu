import { Bus, Plane } from "lucide-react";

import type { UnifiedOfferCardModel } from "../../content/portfolio-offer-card-model";
import type { OfferCardVariant } from "./offer-card-variant";

type OfferCardMediaProps = {
  offer: UnifiedOfferCardModel;
  variant: OfferCardVariant;
};

export default function OfferCardMedia({ offer, variant }: OfferCardMediaProps) {
  const isHero = variant === "hero";
  const TransportIcon = offer.transportLabel?.includes("Repül") ? Plane : Bus;
  const priceLabel = offer.displayedPrice ?? "Ár hamarosan";

  return (
    <div className={`relative overflow-hidden ${isHero ? "h-56" : "h-52"}`}>
      {offer.imageUrl ? (
        <img
          src={offer.imageUrl}
          alt={offer.imageAlt ?? offer.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

      <div className="absolute right-4 top-4 rounded-2xl bg-white/95 px-3.5 py-2 shadow-md backdrop-blur-md">
        <p className="text-base font-bold leading-none text-[#00a878]">{priceLabel}</p>
        <p className="mt-1 text-[10px] leading-none text-gray-500">-tól/fő</p>
      </div>

      {offer.transportLabel ? (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 shadow-md backdrop-blur-md">
          <TransportIcon className="h-3.5 w-3.5 text-[#00c389]" />
          <span className="text-xs font-semibold text-gray-800">{offer.transportLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
