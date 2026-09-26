import { motion } from "motion/react";
import { Calendar, Clock, MapPin, Search, Wallet, type LucideIcon } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";

import { useAnalytics } from "../analytics/useAnalytics";
import {
  BUDGET_OPTIONS,
  EMPTY_OFFER_SEARCH,
  TRIP_DURATION_OPTIONS,
  buildOfferSearchUrl,
  normalizeOfferSearch,
  type OfferSearchCriteria,
} from "../content/offer-search";

const FIELD_CLASS_NAME =
  "w-full bg-transparent py-4 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none [color-scheme:dark]";
const OPTION_CLASS_NAME = "bg-[#0A1628] text-white";

function todayIsoDate() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

function SearchField({
  id,
  label,
  icon: Icon,
  className,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative rounded-[20px] border border-white/10 bg-white/5 transition-colors focus-within:border-[#00c389]/60">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        {children}
      </div>
    </div>
  );
}

export default function HeroSearchForm() {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const [criteria, setCriteria] = useState<OfferSearchCriteria>(EMPTY_OFFER_SEARCH);

  const updateCriteria = <K extends keyof OfferSearchCriteria>(key: K, value: OfferSearchCriteria[K]) => {
    setCriteria((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalized = normalizeOfferSearch(criteria);

    trackEvent("search", {
      entity: { type: "offer_list", slug: null },
      metadata: {
        placement: "home_hero",
        search_term: normalized.search || null,
        departure: normalized.departure || null,
        from: normalized.from || null,
        duration: normalized.duration || null,
        max_price: normalized.maxPrice ? Number(normalized.maxPrice) : null,
      },
    });

    navigate(buildOfferSearchUrl(normalized));
    window.scrollTo({ top: 0 });
  };

  return (
    <form
      role="search"
      aria-label="Utazások keresése"
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-white/15 bg-white/12 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-3xl"
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <SearchField id="hero-search-destination" label="Úti cél" icon={MapPin} className="col-span-2 md:col-span-1">
          <input
            id="hero-search-destination"
            type="search"
            value={criteria.search}
            onChange={(event) => updateCriteria("search", event.target.value)}
            placeholder="Úti cél"
            autoComplete="off"
            maxLength={100}
            className={FIELD_CLASS_NAME}
          />
        </SearchField>

        <SearchField id="hero-search-departure" label="Indulás helye" icon={MapPin} className="col-span-2 md:col-span-1">
          <input
            id="hero-search-departure"
            type="text"
            value={criteria.departure}
            onChange={(event) => updateCriteria("departure", event.target.value)}
            placeholder="Indulás helye"
            autoComplete="off"
            maxLength={100}
            className={FIELD_CLASS_NAME}
          />
        </SearchField>

        <SearchField id="hero-search-from" label="Legkorábbi indulás" icon={Calendar} className="col-span-1">
          <input
            id="hero-search-from"
            type="date"
            value={criteria.from}
            min={todayIsoDate()}
            onChange={(event) => updateCriteria("from", event.target.value)}
            className={FIELD_CLASS_NAME}
          />
        </SearchField>

        <SearchField id="hero-search-duration" label="Időtartam" icon={Clock} className="col-span-1">
          <select
            id="hero-search-duration"
            value={criteria.duration}
            onChange={(event) =>
              updateCriteria("duration", event.target.value as OfferSearchCriteria["duration"])
            }
            className={`${FIELD_CLASS_NAME} appearance-none`}
          >
            <option value="" className={OPTION_CLASS_NAME}>
              Időtartam
            </option>
            {TRIP_DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className={OPTION_CLASS_NAME}>
                {option.label}
              </option>
            ))}
          </select>
        </SearchField>

        <SearchField id="hero-search-budget" label="Költségkeret" icon={Wallet} className="col-span-2 md:col-span-1">
          <select
            id="hero-search-budget"
            value={criteria.maxPrice}
            onChange={(event) => updateCriteria("maxPrice", event.target.value)}
            className={`${FIELD_CLASS_NAME} appearance-none`}
          >
            <option value="" className={OPTION_CLASS_NAME}>
              Költségkeret
            </option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className={OPTION_CLASS_NAME}>
                {option.label}
              </option>
            ))}
          </select>
        </SearchField>

        <motion.button
          type="submit"
          className="col-span-2 rounded-[20px] bg-gradient-to-r from-[#00c389] to-[#16b8ff] py-4 text-white shadow-[0_4px_20px_rgba(0,195,137,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:col-span-1"
          whileHover={{
            scale: 1.02,
            boxShadow: "0 6px 28px rgba(0,195,137,0.4)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center justify-center gap-2 font-semibold">
            <Search className="h-4 w-4" />
            Keresés
          </span>
        </motion.button>
      </div>
    </form>
  );
}
