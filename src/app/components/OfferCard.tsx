import { Link } from "react-router";

import type { UnifiedOfferCardModel } from "../content/portfolio-offer-card-model";
import OfferCardCTA from "./offer-card/OfferCardCTA";
import OfferCardContent from "./offer-card/OfferCardContent";
import OfferCardMedia from "./offer-card/OfferCardMedia";
import OfferCardMeta from "./offer-card/OfferCardMeta";
import OfferCardPrice from "./offer-card/OfferCardPrice";
import type { OfferCardVariant } from "./offer-card/offer-card-variant";

type OfferCardProps = {
  offer: UnifiedOfferCardModel;
  variant?: OfferCardVariant;
  className?: string;
  ctaLabel?: string;
  onClick?: () => void;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function OfferCard({
  offer,
  variant = "default",
  className,
  ctaLabel = "Foglalás",
  onClick,
}: OfferCardProps) {
  const isHero = variant === "hero";

  const cardClassName = joinClasses(
    "group relative flex h-full flex-col overflow-hidden border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#00c389]/25",
    isHero
      ? "rounded-[34px] shadow-[0_10px_40px_rgba(15,23,42,0.07)] hover:shadow-[0_20px_56px_rgba(0,195,137,0.16)]"
      : "rounded-[28px] shadow-[0_6px_28px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_44px_rgba(0,195,137,0.14)]",
    className,
  );

  const content = (
    <>
      <OfferCardMedia offer={offer} variant={variant} />
      <div className={joinClasses("flex flex-1 flex-col", isHero ? "p-6" : "p-5")}>
        <OfferCardContent offer={offer} variant={variant} />
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
