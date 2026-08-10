import type { UnifiedOfferCardModel } from "../../content/portfolio-offer-card-model";

type OfferCardPriceProps = {
  offer: UnifiedOfferCardModel;
};

export default function OfferCardPrice({ offer }: OfferCardPriceProps) {
  const priceLabel = offer.displayedPrice ?? "Ár hamarosan";

  return (
    <div className="min-w-0">
      <p className="truncate text-lg font-bold leading-none text-[#0f172a]">{priceLabel}</p>
      <p className="mt-1.5 text-[11px] font-medium text-gray-400">-tól/fő</p>
    </div>
  );
}
