import { Link } from "react-router";

import type { UnifiedOfferCardModel } from "../content/portfolio-offer-card-model";
import OfferCardCTA from "./offer-card/OfferCardCTA";
import OfferCardContent from "./offer-card/OfferCardContent";
import OfferCardMedia from "./offer-card/OfferCardMedia";
import OfferCardMeta from "./offer-card/OfferCardMeta";
import OfferCardPrice from "./offer-card/OfferCardPrice";

type OfferCardProps = {
  offer: UnifiedOfferCardModel;
  className?: string;
  ctaLabel?: string;
  onClick?: () => void;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function OfferCard({
  offer,
  className,
  ctaLabel = "Foglalás",
  onClick,
}: OfferCardProps) {
  const cardClassName = joinClasses(
    "group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_6px_28px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00c389]/25 hover:shadow-[0_16px_44px_rgba(0,195,137,0.14)]",
    className,
  );

  const content = (
    <>
      <OfferCardMedia offer={offer} />
      <div className="flex flex-1 flex-col p-5">
        <OfferCardContent offer={offer} />
        <OfferCardMeta offer={offer} />
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <OfferCardPrice offer={offer} />
          <OfferCardCTA label={ctaLabel} />
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${offer.name} – ${ctaLabel}`}
        className={joinClasses(cardClassName, "w-full text-left")}
      >
        {content}
      </button>
    );
  }

  return (
    <Link to={offer.link} aria-label={`${offer.name} – ${ctaLabel}`} className={cardClassName}>
      {content}
    </Link>
  );
}
