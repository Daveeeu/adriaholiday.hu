import { ArrowRight, Bus, Calendar, Clock, Plane, Utensils } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { INQUIRE_LABEL, type UnifiedOfferCardModel } from "../content/portfolio-offer-card-model";
import { responsiveImage } from "../lib/responsiveImage";
import { TRIP_DATES_ID } from "../lib/tripSection";

/**
 * A real link to an offer, so crawlers can follow it and it opens in a new tab on
 * ctrl/middle click; a plain click goes through onSelect (tracking, scroll) when given.
 */
export function OfferLink({
  slug,
  onSelect,
  className,
  children,
}: {
  slug: string;
  onSelect?: (slug: string) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={`/ajanlat/${slug}`}
      className={className}
      onClick={(event) => {
        if (!onSelect || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        event.preventDefault();
        onSelect(slug);
      }}
    >
      {children}
    </Link>
  );
}

type OfferResultCardProps = {
  offer: UnifiedOfferCardModel;
  onSelect?: (slug: string) => void;
};

/** The trip tile of the offer lists and the homepage's featured offers. */
export default function OfferResultCard({ offer, onSelect }: OfferResultCardProps) {
  const metaItems = [
    {
      key: "departure",
      icon: <Calendar className="h-4 w-4" />,
      value: offer.departureLabel ?? INQUIRE_LABEL,
    },
    {
      key: "duration",
      icon: <Clock className="h-4 w-4" />,
      value: offer.durationLabel ?? "Többnapos út",
    },
    {
      key: "transport",
      icon: offer.transportLabel?.includes("Repül") ? <Plane className="h-4 w-4" /> : <Bus className="h-4 w-4" />,
      value: offer.transportLabel ?? "Szervezett út",
    },
    {
      key: "meals",
      icon: <Utensils className="h-4 w-4" />,
      value: offer.mealsLabel ?? "Információ később",
    },
  ];

  return (
    <div className="group h-full overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all hover:shadow-[0_18px_60px_rgba(0,195,137,0.12)]">
      <OfferLink slug={offer.seoName} onSelect={onSelect} className="relative block h-[240px] w-full overflow-hidden text-left">
        {offer.imageUrl ? (
          <img
            {...responsiveImage(offer.imageUrl)}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            alt={offer.imageAlt ?? offer.name}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100" />
        )}
        {/* Darkened only behind the title, so the photo stays clear. */}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        {offer.primaryBadge ? (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              {offer.primaryBadge}
            </span>
          </div>
        ) : null}
        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="max-w-xl text-2xl font-bold leading-tight text-white">{offer.name}</h3>
          {offer.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-white/75">{offer.description}</p>
          ) : null}
        </div>
      </OfferLink>

      <div className="p-6">
        <div className="mb-6 grid grid-cols-2 gap-3">
          {metaItems.map((item) => (
            <MetaItem key={item.key} icon={item.icon} value={item.value}>
              {item.key === "departure" && offer.otherDepartureCount > 0 ? (
                <Link
                  to={`/ajanlat/${offer.seoName}#${TRIP_DATES_ID}`}
                  className="block text-xs font-bold text-[#00a878] hover:text-[#00c389]"
                >
                  +{offer.otherDepartureCount} további időpont
                </Link>
              ) : null}
            </MetaItem>
          ))}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 text-xs text-gray-500">Induló ár</div>
            <div className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-3xl font-bold text-transparent">
              {offer.displayedPrice ?? "Ár hamarosan"}
            </div>
          </div>

          <OfferLink slug={offer.seoName} onSelect={onSelect} className="inline-block group/btn shrink-0 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-5 py-3 text-white shadow-lg">
            <span className="flex items-center gap-2 text-sm font-semibold">
              Részletek
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </span>
          </OfferLink>
        </div>
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  value,
  children,
}: {
  icon: ReactNode;
  value: string;
  /** A line under the value, e.g. the link to the trip's other dates. */
  children?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-[#f5f9fc] px-3 py-2 text-gray-700">
      <span className="shrink-0 text-[#00c389]">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold">{value}</span>
        {children}
      </span>
    </div>
  );
}
