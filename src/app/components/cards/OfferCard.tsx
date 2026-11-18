import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, CalendarDays, Crown, Flame, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

export type OfferLike = {
  title: string;
  country: string;
  departure: string;
  price: string;
  priceNumber?: number;
  duration?: string;
  badge?: string;
  transport?: string;
  image: string;
};

const cardStyles = cva(
  "group relative overflow-hidden border border-black/10 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 touch-manipulation",
  {
    variants: {
      variant: {
        featured: "rounded-3xl shadow-sm",
        recommended: "rounded-3xl shadow-sm",
        standard: "rounded-3xl shadow-sm",
        compact: "rounded-2xl shadow-none",
        premium: "rounded-3xl shadow-sm ring-1 ring-[#00c389]/30",
        lastMinute: "rounded-3xl shadow-sm ring-1 ring-orange-500/30",
      },
    },
    defaultVariants: { variant: "standard" },
  }
);

type Props = {
  offer: OfferLike;
  to?: string;
  onClick?: () => void;
  eyebrow?: string;
  rightSlot?: ReactNode;
  className?: string;
} & VariantProps<typeof cardStyles>;

function Price({ value }: { value: string }) {
  return (
    <div className="text-slate-900 font-semibold tracking-[-0.02em]">
      <span className="text-[1.15rem] sm:text-[1.25rem]">{value}</span>
      <span className="text-slate-500 text-xs sm:text-sm font-semibold">
        {" "}
        -tól/fő
      </span>
    </div>
  );
}

function Chip({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "premium" | "lastMinute";
  children: ReactNode;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border";
  if (tone === "premium") {
    return (
      <span className={`${base} bg-[#00c389]/10 text-[#007f5a] border-[#00c389]/20`}>
        <Crown className="w-3.5 h-3.5" />
        {children}
      </span>
    );
  }
  if (tone === "lastMinute") {
    return (
      <span className={`${base} bg-orange-500/10 text-orange-700 border-orange-500/20`}>
        <Flame className="w-3.5 h-3.5" />
        {children}
      </span>
    );
  }
  return (
    <span className={`${base} bg-white/90 text-slate-700 border-black/10`}>
      {children}
    </span>
  );
}

export default function OfferCard({
  offer,
  to,
  onClick,
  variant,
  eyebrow,
  rightSlot,
  className,
}: Props) {
  const Wrapper: any = to ? Link : "button";
  const wrapperProps = to
    ? { to, "aria-label": `${offer.title} – részletek` }
    : { type: "button", onClick, "aria-label": `${offer.title} – részletek` };

  if (variant === "compact") {
    return (
      <Wrapper
        {...wrapperProps}
        className={[
          cardStyles({ variant }),
          "px-4 py-3 flex items-center gap-3",
          className ?? "",
        ].join(" ")}
      >
        <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          <img
            src={offer.image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-slate-900 font-semibold leading-tight truncate">
            {offer.title}
          </div>
          <div className="mt-1 text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {offer.country}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              {offer.departure}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-slate-900 font-semibold text-sm">{offer.price}</div>
          <ArrowRight className="w-4 h-4 text-slate-400 ml-auto mt-1" />
        </div>
      </Wrapper>
    );
  }

  const topChip =
    variant === "premium" ? (
      <Chip tone="premium">Prémium</Chip>
    ) : variant === "lastMinute" ? (
      <Chip tone="lastMinute">Last minute</Chip>
    ) : eyebrow ? (
      <Chip>{eyebrow}</Chip>
    ) : null;

  const imageHeight =
    variant === "featured" ? "h-56 sm:h-72" : variant === "recommended" ? "h-40 sm:h-44" : "h-32 sm:h-40";

  return (
    <Wrapper
      {...wrapperProps}
      className={[cardStyles({ variant }), className ?? ""].join(" ")}
    >
      <div className={`relative ${imageHeight}`}>
        <img
          src={offer.image}
          alt={offer.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4 right-4 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {topChip}
            <Chip>{offer.country}</Chip>
          </div>
          {rightSlot}
        </div>

        <div className="absolute left-4 right-4 bottom-4">
          <div className="text-white font-semibold leading-tight text-lg sm:text-xl">
            {offer.title}
          </div>
          <div className="mt-1 text-white/85 text-xs sm:text-sm flex flex-wrap gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              {offer.departure}
            </span>
            {offer.duration ? (
              <span className="text-white/80">{offer.duration}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
        <Price value={offer.price} />
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          Részletek
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Wrapper>
  );
}
