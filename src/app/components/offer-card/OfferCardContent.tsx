import type { UnifiedOfferCardModel } from "../../content/portfolio-offer-card-model";

type OfferCardContentProps = {
  offer: UnifiedOfferCardModel;
};

export default function OfferCardContent({ offer }: OfferCardContentProps) {
  return (
    <>
      <h3 className="mb-2 text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-gray-900">{offer.name}</h3>

      {offer.description ? (
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500">{offer.description}</p>
      ) : null}
    </>
  );
}
