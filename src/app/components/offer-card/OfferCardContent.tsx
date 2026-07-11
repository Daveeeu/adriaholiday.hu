import type { UnifiedOfferCardModel } from "../../content/portfolio-offer-card-model";
import type { OfferCardVariant } from "./offer-card-variant";

type OfferCardContentProps = {
  offer: UnifiedOfferCardModel;
  variant: OfferCardVariant;
};

export default function OfferCardContent({ offer, variant }: OfferCardContentProps) {
  const isHero = variant === "hero";

  return (
    <>
      <h3
        className={`mb-2 font-bold leading-tight tracking-[-0.02em] text-gray-900 ${
          isHero ? "text-[1.8rem]" : "text-[1.35rem]"
        }`}
      >
        {offer.name}
      </h3>

      {offer.description ? (
        <p className="mb-4 text-sm leading-relaxed text-gray-500">{offer.description}</p>
      ) : null}

      <div className="mb-4 h-[2px] w-10 bg-gradient-to-r from-[#00c389] to-transparent opacity-40" />
    </>
  );
}
