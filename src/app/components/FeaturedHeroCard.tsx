import type { UnifiedOfferCardModel } from "../content/portfolio-offer-card-model";
import OfferCard from "./OfferCard";

type FeaturedHeroCardProps = {
  offer: UnifiedOfferCardModel;
};

export default function FeaturedHeroCard({ offer }: FeaturedHeroCardProps) {
  return <OfferCard offer={offer} variant="hero" />;
}
