import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Bus,
  Calendar,
  Clock,
  Flame,
  Hotel,
  Loader2,
  Mountain,
  Plane,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Utensils,
  Wallet,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { useAnalytics } from "../analytics/useAnalytics";
import {
  fetchPortfolioCategoryFilters,
  fetchPortfolioCategoryOffers,
  type PortfolioCategoryFilterChip,
  type PortfolioOfferCard,
} from "../content/portfolio-offers-api";
import {
  toUnifiedOfferCardModel,
  type UnifiedOfferCardModel,
} from "../content/portfolio-offer-card-model";

type CategoryOffersPageProps = {
  categorySlug: string;
  title: string;
  subtitle: string;
  heroImage?: string | null;
  onBack: () => void;
  onOfferSelect: (slug: string) => void;
};

type OfferFilters = {
  quickFilters: string[];
  order: string;
  page: string;
};

type OfferViewModel = {
  raw: PortfolioOfferCard;
  card: UnifiedOfferCardModel;
};

const DEFAULT_ORDER = "sort_order";
const WARMEST_ORDER = "warmest";

const FILTER_ICON_MAP: Record<string, LucideIcon> = {
  waves: Waves,
  "building-2": Building2,
  mountain: Mountain,
  wallet: Wallet,
  bus: Bus,
  plane: Plane,
  sparkles: Sparkles,
  sun: Sun,
};

function safeTrim(value: string | null | undefined) {
  return (value ?? "").trim();
}

function uniqueCountryCount(items: PortfolioOfferCard[]) {
  return new Set(
    items
      .map((item) => safeTrim(item.country))
      .filter((value) => value !== ""),
  ).size;
}

function parseQuickFilterValue(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

function serializeQuickFilterValue(filters: string[]) {
  return filters.join(",");
}

function renderFilterIcon(icon: string | null) {
  const Icon = icon ? FILTER_ICON_MAP[icon] : undefined;

  return Icon ? <Icon className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />;
}

function displayCount(value: number) {
  return value > 0 ? `${value}+` : "0";
}

function offerViewModel(offer: PortfolioOfferCard): OfferViewModel {
  return {
    raw: offer,
    card: toUnifiedOfferCardModel(offer),
  };
}

function spotlightReasons(offer: OfferViewModel) {
  return [
    offer.card.transportLabel,
    offer.card.mealsLabel,
    offer.raw.programTypeLabel,
  ].filter((value): value is string => Boolean(value && value.trim() !== ""));
}

function spotlightHighlights(offer: OfferViewModel) {
  return [
    offer.card.departureCountText ?? "Fix program",
    offer.card.transportLabel ?? "Szervezett utazás",
  ];
}

export default function CategoryOffersPage({
  categorySlug,
  title,
  subtitle,
  heroImage,
  onBack,
  onOfferSelect,
}: CategoryOffersPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { trackEvent } = useAnalytics();
  const [items, setItems] = useState<PortfolioOfferCard[]>([]);
  const [recommended, setRecommended] = useState<PortfolioOfferCard[]>([]);
  const [quickFilters, setQuickFilters] = useState<PortfolioCategoryFilterChip[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [hasError, setHasError] = useState(false);
  const filterSectionRef = useRef<HTMLDivElement | null>(null);

  const filters = useMemo<OfferFilters>(
    () => ({
      quickFilters: parseQuickFilterValue(searchParams.get("filters")),
      order: searchParams.get("order") ?? DEFAULT_ORDER,
      page: searchParams.get("page") ?? "1",
    }),
    [searchParams],
  );

  const serializedFilters = useMemo(
    () => (filters.quickFilters.length > 0 ? serializeQuickFilterValue(filters.quickFilters) : undefined),
    [filters.quickFilters],
  );

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setHasError(false);

    fetchPortfolioCategoryOffers(categorySlug, {
      page: Math.max(1, Number(filters.page) || 1),
      perPage,
      order: filters.order,
      filters: serializedFilters,
    })
      .then((response) => {
        if (cancelled) {
          return;
        }

        setItems(response.items ?? []);
        setRecommended(response.recommended ?? []);
        setTotalCount(response.totalCount ?? 0);
        setPage(response.page ?? 1);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setItems([]);
        setRecommended([]);
        setTotalCount(0);
        setHasError(true);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categorySlug, filters.order, filters.page, perPage, serializedFilters]);

  useEffect(() => {
    let cancelled = false;

    setIsLoadingFilters(true);

    fetchPortfolioCategoryFilters(categorySlug, { filters: serializedFilters })
      .then((response) => {
        if (!cancelled) {
          setQuickFilters(response);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuickFilters([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingFilters(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categorySlug, serializedFilters]);

  const replaceSearchState = (values: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(values).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
        return;
      }

      next.set(key, value);
    });

    if (resetPage) {
      next.set("page", "1");
    }

    setSearchParams(next, { replace: true, preventScrollReset: true });
  };

  const clearParams = () => {
    trackEvent("filter_remove", {
      entity: {
        type: "category",
        slug: categorySlug,
      },
      metadata: {
        filter_type: "all",
      },
    });

    setSearchParams(new URLSearchParams({ page: "1" }), {
      replace: true,
      preventScrollReset: true,
    });
  };

  const setOrder = (order: string) => {
    trackEvent("filter_click", {
      entity: {
        type: "category",
        slug: categorySlug,
      },
      metadata: {
        filter_type: "order",
        filter_value: order,
      },
    });

    replaceSearchState({ order: order === DEFAULT_ORDER ? undefined : order });
  };

  const toggleQuickFilter = (slug: string) => {
    const next = new Set(filters.quickFilters);
    const isRemoving = next.has(slug);

    if (isRemoving) {
      next.delete(slug);
    } else {
      next.add(slug);
    }

    trackEvent(isRemoving ? "filter_remove" : "filter_click", {
      entity: {
        type: "category",
        slug: categorySlug,
      },
      metadata: {
        filter_type: "quick_filter",
        filter_value: slug,
        result_count: totalCount,
      },
    });

    replaceSearchState({
      filters: next.size > 0 ? serializeQuickFilterValue(Array.from(next)) : undefined,
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(Math.max(1, nextPage)));
    setSearchParams(next, { replace: true, preventScrollReset: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const itemCards = useMemo(() => items.map(offerViewModel), [items]);
  const recommendedCards = useMemo(() => recommended.map(offerViewModel), [recommended]);
  const spotlightOffer = useMemo(
    () => (recommendedCards[0] ?? itemCards[0] ?? null),
    [itemCards, recommendedCards],
  );
  const highlightedOffers = useMemo(() => recommendedCards.slice(0, 3), [recommendedCards]);
  const hasResults = itemCards.length > 0;
  const hasRecommended = highlightedOffers.length > 0;
  const hasActiveFilters = filters.quickFilters.length > 0 || filters.order !== DEFAULT_ORDER;
  const hasActiveQuickFilters = filters.quickFilters.length > 0;
  const showCategoryHighlights = hasResults && !hasActiveQuickFilters;
  const resultCountLabel = hasActiveFilters
    ? `${totalCount} elérhető utazás a kiválasztott szűrők alapján.`
    : `${totalCount} elérhető utazás.`;

  return (
    <div className="min-h-screen bg-[#f5f9fc]">
      <section className="relative h-[520px] overflow-hidden">
        <img
          src={
            heroImage ??
            "https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;1600x900;"
          }
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/88 via-[#07111f]/48 to-[#07111f]/20" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1500px] items-end px-8 pb-16 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            <button
              onClick={onBack}
              className="mb-8 flex items-center gap-2 text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Vissza a főoldalra</span>
            </button>

            <h1
              className="mb-5 text-white"
              style={{
                fontSize: "clamp(2.8rem, 5vw, 5rem)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }}
            >
              {title}
            </h1>

            <p className="max-w-2xl text-xl leading-relaxed text-white/85">{subtitle}</p>

            <div className="mt-10 flex flex-wrap gap-4">
              <HeroStatCard label="Ajánlat" value={displayCount(totalCount)} />
              <HeroStatCard label="Ország" value={displayCount(uniqueCountryCount(items))} />
              <HeroStatCard label="Tapasztalat" value="15 év" />
            </div>
          </div>
        </div>
      </section>

      <section ref={filterSectionRef} className="relative z-20 -mt-14">
        <div className="mx-auto max-w-[1500px] px-8 md:px-12 lg:px-20">
          <div className="rounded-[32px] border border-gray-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#00c389]/8 px-3 py-1.5 text-xs font-bold text-[#00a878]">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  ÉLMÉNY ALAPÚ SZŰRÉS
                </div>
                <h3 className="mb-1 text-2xl font-bold text-[#0f172a]">Milyen utazást keresel?</h3>
                <p className="text-gray-500">
                  Több szűrőt is kombinálhatsz. Ami nem adna találatot, automatikusan letiltásra kerül.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  <QuickPill
                    active={filters.order === DEFAULT_ORDER}
                    label="Legnépszerűbb"
                    onClick={() => setOrder(DEFAULT_ORDER)}
                  />
                  <QuickPill
                    active={filters.order === "price_asc"}
                    label="Legolcsóbb"
                    onClick={() => setOrder("price_asc")}
                  />
                  <QuickPill
                    active={filters.order === WARMEST_ORDER}
                    label="Legmelegebb"
                    onClick={() => setOrder(WARMEST_ORDER)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isLoadingFilters ? (
                <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-[#00c389]" />
                  Filter chipek betöltése...
                </div>
              ) : (
                quickFilters.map((filter) => (
                  <button
                    key={filter.slug}
                    type="button"
                    onClick={() => toggleQuickFilter(filter.slug)}
                    disabled={filter.disabled}
                    className={
                      filter.disabled
                        ? "group inline-flex cursor-not-allowed items-center gap-3 rounded-full bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-300 opacity-60"
                        : filter.active
                          ? "group inline-flex items-center gap-3 rounded-full border border-[#00c389]/40 bg-[#00c389]/8 px-5 py-3 text-sm font-semibold text-[#0f172a] shadow-[0_8px_22px_rgba(15,23,42,0.06)]"
                          : "group inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-[#00c389]/40 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)]"
                    }
                  >
                    <span
                      className={
                        filter.disabled
                          ? "flex h-8 w-8 items-center justify-center rounded-full bg-gray-50"
                          : filter.active
                            ? "flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#00c389]"
                            : "flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f7fb] text-[#00c389]"
                      }
                    >
                      {renderFilterIcon(filter.icon)}
                    </span>
                    <span>{filter.label}</span>
                    <span className="rounded-full bg-[#f4f7fb] px-2 py-1 text-xs text-gray-400">
                      {filter.count}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearParams}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[#00c389]/30 hover:text-[#00a878]"
                >
                  Szűrők törlése
                </button>
              ) : null}
              <div className="text-sm text-slate-500">{resultCountLabel}</div>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="py-20">
          <div className="mx-auto max-w-[1500px] px-8 md:px-12 lg:px-20">
            <LoadingState />
          </div>
        </section>
      ) : hasError ? (
        <section className="py-20">
          <div className="mx-auto max-w-[1500px] px-8 md:px-12 lg:px-20">
            <ErrorState />
          </div>
        </section>
      ) : !hasResults ? (
        <section className="py-20">
          <div className="mx-auto max-w-[1500px] px-8 md:px-12 lg:px-20">
            <EmptyState />
          </div>
        </section>
      ) : (
        <>
          {showCategoryHighlights && spotlightOffer ? (
            <section className="pt-14">
              <div className="mx-auto max-w-[1500px] px-8 md:px-12 lg:px-20">
                <SpotlightOfferCard offer={spotlightOffer} onOfferSelect={onOfferSelect} />
              </div>
            </section>
          ) : null}

          {showCategoryHighlights && hasRecommended ? (
            <section className="pt-16">
              <div className="mx-auto max-w-[1500px] px-8 md:px-12 lg:px-20">
                <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-[#00a878]">
                      <TrendingUp className="h-4 w-4" />
                      AJÁNLOTT UTAK
                    </div>
                    <h3 className="text-3xl font-bold text-[#0f172a]">Ezek passzolnak hozzád legjobban</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {highlightedOffers.map((offer) => (
                    <RecommendedOfferCard
                      key={`recommended-${offer.card.id}`}
                      offer={offer}
                      onOfferSelect={onOfferSelect}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="py-20">
            <div className="mx-auto max-w-[1500px] px-8 md:px-12 lg:px-20">
              <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-[#00a878]">
                    <TrendingUp className="h-4 w-4" />
                    TALÁLATOK
                  </div>
                  <h3 className="mb-2 text-3xl font-bold text-[#0f172a]">További ajánlatok</h3>
                  <p className="text-gray-500">{resultCountLabel}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {itemCards.map((offer) => (
                  <ResultOfferCard
                    key={`result-${offer.card.id}`}
                    offer={offer}
                    onOfferSelect={onOfferSelect}
                  />
                ))}
              </div>

              {showCategoryHighlights && spotlightOffer ? (
                <div className="relative mb-10 mt-10 overflow-hidden rounded-[40px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#0b1830] to-[#10283f]" />
                  <div className="absolute -right-20 -top-20 h-[320px] w-[320px] rounded-full bg-[#00c389]/20 blur-3xl" />
                  <div className="absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full bg-[#16b8ff]/15 blur-3xl" />

                  <div className="relative z-10 flex flex-col gap-10 px-8 py-10 md:px-12 md:py-12 xl:flex-row xl:items-center xl:justify-between">
                    <div className="max-w-3xl">
                      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                        <Sparkles className="h-4 w-4 text-[#00c389]" />
                        SZEMÉLYRE SZABOTT AJÁNLÁS
                      </div>
                      <h3
                        className="mb-5 text-white"
                        style={{
                          fontSize: "clamp(2rem, 4vw, 3.5rem)",
                          fontWeight: 750,
                          lineHeight: 1.05,
                          letterSpacing: "-0.04em",
                        }}
                      >
                        Nem tudod melyik utat válaszd?
                      </h3>
                      <p className="max-w-2xl text-lg leading-relaxed text-white/72">
                        Segítünk megtalálni a hozzád illő utazást ár, időtartam, élmény és úti cél alapján.
                        Pár kattintás és már mutatjuk is a legjobb ajánlatokat.
                      </p>
                      <div className="mt-7 flex flex-wrap gap-3">
                        {spotlightHighlights(spotlightOffer).map((item) => (
                          <div
                            key={item}
                            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur-md"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex min-w-[320px] flex-col gap-5">
                      <div className="grid grid-cols-2 gap-4">
                        <MetricCard value={displayCount(totalCount)} label="Elérhető körutazás" />
                        <MetricCard value={displayCount(uniqueCountryCount(items))} label="Európai ország" />
                      </div>

                      <button
                        type="button"
                        onClick={() => onOfferSelect(spotlightOffer.card.seoName)}
                        className="group relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-7 py-5 text-white shadow-[0_20px_50px_rgba(0,195,137,0.28)]"
                      >
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                        <span className="relative flex items-center justify-center gap-3 text-lg font-semibold">
                          Segíts választani
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => canGoBack && goToPage(page - 1)}
                  disabled={!canGoBack}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-[#00c389]/30 hover:text-[#00a878] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Előző oldal
                </button>

                <div className="text-sm text-slate-500">
                  Oldal {page} / {totalPages}
                </div>

                <button
                  type="button"
                  onClick={() => canGoForward && goToPage(page + 1)}
                  disabled={!canGoForward}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,195,137,0.22)] transition-all hover:shadow-[0_18px_56px_rgba(0,195,137,0.3)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Következő oldal
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function HeroStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-xl">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-sm text-white/70">{label}</div>
    </div>
  );
}

function QuickPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-white"
          : "rounded-full border border-gray-100 bg-[#f4f7fb] px-4 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-white"
      }
    >
      {label}
    </button>
  );
}

function SpotlightOfferCard({
  offer,
  onOfferSelect,
}: {
  offer: OfferViewModel;
  onOfferSelect: (slug: string) => void;
}) {
  const reasons = spotlightReasons(offer);

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[34px] shadow-[0_22px_70px_rgba(15,23,42,0.11)]">
      {offer.card.imageUrl ? (
        <img
          src={offer.card.imageUrl}
          alt={offer.card.imageAlt ?? offer.card.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07111f]/88 via-[#07111f]/58 to-[#07111f]/18" />

      <div className="relative z-10 grid grid-cols-1 gap-8 p-8 md:p-10 lg:grid-cols-[0.9fr_0.75fr]">
        <div className="max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/12 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#00c389]" />
            Neked ajánljuk
          </div>

          {offer.card.primaryBadge ? (
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                {offer.card.primaryBadge}
              </div>
            </div>
          ) : null}

          <h2
            className="mb-4 text-white"
            style={{
              fontSize: "clamp(2rem, 3.2vw, 3.1rem)",
              fontWeight: 760,
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
            }}
          >
            {offer.card.name}
          </h2>

          {offer.card.description ? (
            <p className="mb-7 max-w-lg text-base leading-relaxed text-white/78">{offer.card.description}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-5">
            <div className="min-w-[260px]">
              <div className="mb-2 text-sm text-white/60">Induló ár</div>
              <div className="flex flex-wrap items-end gap-4">
                {offer.card.displayedPrice ? (
                  <div className="text-5xl font-bold text-white">{offer.card.displayedPrice}</div>
                ) : (
                  <div className="text-4xl font-bold text-white">Ár hamarosan</div>
                )}
              </div>
              <div className="mt-2 text-sm font-semibold text-[#00c389]">
                Válogatott ajánlat az adott kategóriából
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOfferSelect(offer.card.seoName)}
              className="group rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-6 py-4 text-white shadow-[0_18px_34px_rgba(0,195,137,0.24)]"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                Részletek
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {offer.card.departureCountText ? (
              <SpotlightBadge icon={<Flame className="h-3.5 w-3.5 text-orange-400" />}>
                {offer.card.departureCountText}
              </SpotlightBadge>
            ) : null}
            {offer.card.transportLabel ? (
              <SpotlightBadge icon={<Star className="h-3.5 w-3.5 text-[#00c389]" />}>
                {offer.card.transportLabel}
              </SpotlightBadge>
            ) : null}
          </div>
        </div>

        <div className="hidden items-stretch lg:flex">
          <div className="w-full rounded-[28px] border border-white/15 bg-white/12 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="mb-1 text-xs text-white/55">Gyors áttekintés</div>
                <div className="text-xl font-bold text-white">Mi vár rád?</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#00c389]">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <SpotlightInfo icon={<Calendar />} label="Indulás" value={offer.card.departureLabel ?? "Érdeklődjön"} />
              <SpotlightInfo icon={<Clock />} label="Időtartam" value={offer.card.durationLabel ?? "Többnapos út"} />
              <SpotlightInfo icon={<Utensils />} label="Ellátás" value={offer.card.mealsLabel ?? "Információ később"} />
              <SpotlightInfo
                icon={<Hotel />}
                label="Szállás"
                value={safeTrim(offer.raw.accommodation) || offer.card.transportLabel || "Szervezett út"}
              />
            </div>

            {reasons.length > 0 ? (
              <div className="mb-4 rounded-2xl border border-white/10 bg-[#07111f]/35 p-4">
                <div className="mb-3 text-xs text-white/55">Miért érdemes?</div>
                <div className="space-y-2">
                  {reasons.map((reason) => (
                    <div key={reason} className="flex items-center gap-2 text-sm text-white/82">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00c389]/15 text-xs text-[#00c389]">
                        ✓
                      </span>
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <div className="mb-1 text-xs text-white/55">Ajánlott élmény</div>
              <div className="font-bold text-white">
                {offer.raw.programTypeLabel ?? offer.card.primaryBadge ?? "Válogatott körutazás"}
              </div>
              <div className="mt-1 text-xs text-white/55">
                Ideális választás az adott kategória kiemelt ajánlatai közül.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpotlightBadge({
  children,
  icon,
}: {
  children: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-white/82 backdrop-blur-md">
      {icon}
      {children}
    </div>
  );
}

function SpotlightInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-xl">
      <div className="mb-2 w-4 text-[#00c389]">{icon}</div>
      <div className="mb-1 text-xs text-white/70">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function RecommendedOfferCard({
  offer,
  onOfferSelect,
}: {
  offer: OfferViewModel;
  onOfferSelect: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOfferSelect(offer.card.seoName)}
      className="group relative h-[270px] overflow-hidden rounded-[28px] text-left shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
    >
      {offer.card.imageUrl ? (
        <img
          src={offer.card.imageUrl}
          alt={offer.card.imageAlt ?? offer.card.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-700" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/85 via-[#07111f]/30 to-transparent" />

      <div className="absolute left-4 top-4 flex gap-2">
        {offer.card.primaryBadge ? (
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            {offer.card.primaryBadge}
          </span>
        ) : null}
      </div>

      <div className="absolute bottom-5 left-5 right-5">
        <h4 className="mb-3 text-xl font-bold leading-tight text-white">{offer.card.name}</h4>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-white/85">{offer.card.departureLabel ?? "Érdeklődjön"}</div>
          <div className="font-bold text-white">{offer.card.displayedPrice ?? "Ár hamarosan"}</div>
        </div>
      </div>
    </button>
  );
}

function ResultOfferCard({
  offer,
  onOfferSelect,
}: {
  offer: OfferViewModel;
  onOfferSelect: (slug: string) => void;
}) {
  const metaItems = [
    {
      key: "departure",
      icon: <Calendar className="h-4 w-4" />,
      value: offer.card.departureLabel ?? "Érdeklődjön",
    },
    {
      key: "duration",
      icon: <Clock className="h-4 w-4" />,
      value: offer.card.durationLabel ?? "Többnapos út",
    },
    {
      key: "transport",
      icon: offer.card.transportLabel?.includes("Repül") ? <Plane className="h-4 w-4" /> : <Bus className="h-4 w-4" />,
      value: offer.card.transportLabel ?? "Szervezett út",
    },
    {
      key: "meals",
      icon: <Utensils className="h-4 w-4" />,
      value: offer.card.mealsLabel ?? "Információ később",
    },
  ];

  return (
    <div className="group overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all hover:shadow-[0_18px_60px_rgba(0,195,137,0.12)]">
      <button
        type="button"
        onClick={() => onOfferSelect(offer.card.seoName)}
        className="relative block h-[240px] w-full overflow-hidden text-left"
      >
        {offer.card.imageUrl ? (
          <img
            src={offer.card.imageUrl}
            alt={offer.card.imageAlt ?? offer.card.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        {offer.card.primaryBadge ? (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              {offer.card.primaryBadge}
            </span>
          </div>
        ) : null}
        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="max-w-xl text-2xl font-bold leading-tight text-white">{offer.card.name}</h3>
          {offer.card.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-white/75">{offer.card.description}</p>
          ) : null}
        </div>
      </button>

      <div className="p-6">
        <div className="mb-5 grid grid-cols-2 gap-3">
          {metaItems.map((item) => (
            <ResultMetaItem key={item.key} icon={item.icon} value={item.value} />
          ))}
        </div>

        {offer.card.departureCountText ? (
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00c389]/8 px-3 py-1.5 text-xs font-bold text-[#00a878]">
              <Calendar className="h-3.5 w-3.5" />
              {offer.card.departureCountText}
            </span>
          </div>
        ) : null}

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 text-xs text-gray-500">Induló ár</div>
            <div className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-3xl font-bold text-transparent">
              {offer.card.displayedPrice ?? "Ár hamarosan"}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOfferSelect(offer.card.seoName)}
            className="group/btn shrink-0 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-5 py-3 text-white shadow-lg"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              Részletek
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultMetaItem({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-[#f5f9fc] px-3 py-2 text-gray-700">
      <span className="shrink-0 text-[#00c389]">{icon}</span>
      <span className="truncate text-xs font-semibold">{value}</span>
    </div>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
      <div className="mb-2 text-4xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/65">{label}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-[30px] border border-gray-100 bg-white">
      <div className="flex items-center gap-3 text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin text-[#00c389]" />
        <span className="text-sm font-medium">Ajánlatok betöltése...</span>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-[30px] border border-red-200 bg-red-50 p-8 text-red-700">
      <div className="text-lg font-semibold">Nem sikerült betölteni az ajánlatokat.</div>
      <p className="mt-2 text-sm">Kérjük, próbáld újra később. A lista kizárólag a Laravel API-ból töltődik.</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[30px] border border-dashed border-gray-200 bg-white p-10 text-center">
      <div className="text-lg font-semibold text-slate-900">Nincs elérhető ajánlat ebben a kategóriában.</div>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        Nézz vissza később, vagy válassz másik kategóriát.
      </p>
    </div>
  );
}
