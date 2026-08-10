import type { UnifiedOfferCardModel } from "../../content/portfolio-offer-card-model";
import type { OfferCardVariant } from "./offer-card-variant";

type OfferCardMediaProps = {
  offer: UnifiedOfferCardModel;
  variant: OfferCardVariant;
};

export default function OfferCardMedia({ offer, variant }: OfferCardMediaProps) {
  const isHero = variant === "hero";

  return (
    <div className={`overflow-hidden ${isHero ? "h-56" : "h-52"}`}>
      {offer.imageUrl ? (
        <img
          src={offer.imageUrl}
          alt={offer.imageAlt ?? offer.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100" />
      )}
    </div>
  );
}
