import type { UnifiedOfferCardModel } from "../../content/portfolio-offer-card-model";
import { responsiveImage } from "../../lib/responsiveImage";

type OfferCardMediaProps = {
  offer: UnifiedOfferCardModel;
};

export default function OfferCardMedia({ offer }: OfferCardMediaProps) {
  return (
    <div className="h-52 overflow-hidden">
      {offer.imageUrl ? (
        <img
          {...responsiveImage(offer.imageUrl)}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          alt={offer.imageAlt ?? offer.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100" />
      )}
    </div>
  );
}
