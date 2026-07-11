import type { UnifiedOfferCardModel } from "../content/portfolio-offer-card-model";
import OfferCard from "./OfferCard";

type FeaturedCardProps = {
  offer: UnifiedOfferCardModel;
};

export default function FeaturedCard({ offer }: FeaturedCardProps) {
  return <OfferCard offer={offer} variant="default" />;
}
