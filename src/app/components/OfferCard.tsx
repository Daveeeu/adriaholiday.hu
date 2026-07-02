import { ArrowRight, Bus, Calendar, Clock, Utensils } from "lucide-react";
import { Link } from "react-router";
import type { ReactNode } from "react";

import type { UnifiedOfferCardModel } from "../content/portfolio-offer-card-model";

type OfferCardProps = {
  offer: UnifiedOfferCardModel;
  className?: string;
  ctaLabel?: string;
  onClick?: () => void;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Badge({ children }: { children: string }) {
  return (
    <span className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/15">
      {children}
    </span>
  );
}

function MetaItem({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#f5f9fc] px-3 py-2 text-gray-700 min-w-0">
      <span className="text-[#00c389] shrink-0">{icon}</span>
      <span className="text-xs font-semibold truncate">{value}</span>
    </div>
  );
}

export default function OfferCard({
  offer,
  className,
  ctaLabel = "Részletek",
  onClick,
}: OfferCardProps) {
  const metaItems = [
    offer.departureLabel
      ? {
          key: "departure",
          icon: <Calendar className="w-4 h-4" />,
          value: offer.departureLabel,
        }
      : null,
    offer.durationLabel
      ? {
          key: "duration",
          icon: <Clock className="w-4 h-4" />,
          value: offer.durationLabel,
        }
      : null,
    offer.transportLabel
      ? {
          key: "transport",
          icon: <Bus className="w-4 h-4" />,
          value: offer.transportLabel,
        }
      : null,
    offer.mealsLabel
      ? {
          key: "meals",
          icon: <Utensils className="w-4 h-4" />,
          value: offer.mealsLabel,
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; icon: ReactNode; value: string }>;

  const hasMeta = metaItems.length > 0;
  const hasPricing = Boolean(offer.displayedPrice || offer.departureCountText);

  const heroContent = (
    <>
      {offer.imageUrl ? (
        <img
          src={offer.imageUrl}
          alt={offer.imageAlt ?? offer.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      {(offer.primaryBadge || offer.secondaryBadge) && (
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {offer.primaryBadge ? <Badge>{offer.primaryBadge}</Badge> : null}
          {offer.secondaryBadge ? <Badge>{offer.secondaryBadge}</Badge> : null}
        </div>
      )}
      <div className="absolute bottom-5 left-5 right-5">
        <h3 className="line-clamp-2 max-w-xl text-2xl font-bold leading-tight text-white">
          {offer.name}
        </h3>
        {offer.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-white/75">
            {offer.description}
          </p>
        ) : null}
      </div>
    </>
  );

  const cardBody = (
    <div className="p-6">
      {hasMeta ? (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {metaItems.map((item) => (
            <MetaItem key={item.key} icon={item.icon} value={item.value} />
          ))}
        </div>
      ) : null}

      {offer.departureCountText ? (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00c389]/8 text-[#00a878] text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" />
            {offer.departureCountText}
          </span>
        </div>
      ) : null}

      {hasPricing ? (
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-gray-500 mb-1">Induló ár</div>
            {offer.displayedPrice ? (
              <div className="text-3xl font-bold bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
                {offer.displayedPrice}
              </div>
            ) : null}
          </div>

          <div className="shrink-0">
            <div className="group/btn px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white shadow-lg">
              <span className="flex items-center gap-2 text-sm font-semibold">
                {ctaLabel}
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  if (onClick) {
    return (
      <div
        className={joinClasses(
          "group bg-white rounded-[30px] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_60px_rgba(0,195,137,0.12)] transition-all",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClick}
          className="relative h-[240px] overflow-hidden block w-full text-left"
          aria-label={`${offer.name} – ${ctaLabel}`}
        >
          {heroContent}
        </button>
        {cardBody}
      </div>
    );
  }

  return (
    <div
      className={joinClasses(
        "group bg-white rounded-[30px] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_60px_rgba(0,195,137,0.12)] transition-all",
        className,
      )}
    >
      <Link
        to={offer.link}
        aria-label={`${offer.name} – ${ctaLabel}`}
        className="relative h-[240px] overflow-hidden block w-full text-left"
      >
        {heroContent}
      </Link>
      <Link to={offer.link} aria-label={`${offer.name} – ${ctaLabel}`} className="block">
        {cardBody}
      </Link>
    </div>
  );
}
