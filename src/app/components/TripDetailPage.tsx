// TripDetailPage.tsx

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Bus,
  Hotel,
  Utensils,
  Star,
  Check,
  X,
  ShieldCheck,
  TrendingUp,
  Users,
  Flame,
} from "lucide-react";
import OfferGallerySection from "./OfferGallerySection";
import OfferProgramTimeline from "./OfferProgramTimeline";
import OfferContentSection from "./OfferContentSection";
import OfferPrintableVersion from "./OfferPrintableVersion";
import { useAnalytics } from "../analytics/useAnalytics";
import { type PortfolioPriceBox } from "../content/portfolio-offer-detail-api";
import { toUnifiedOfferCardModel } from "../content/portfolio-offer-card-model";
import OfferCard from "./OfferCard";
import BookingSection from "../booking/BookingSection";

interface TripDetailPageProps {
  trip: any;
  relatedTrips?: Array<{
    seoName?: string;
    name: string;
    country?: string | null;
    displayedPrice?: string | null;
    image?: { url?: string | null; thumbnailUrl?: string | null } | null;
    link?: string | null;
  }>;
  onBack: () => void;
}

function mergePriceBoxes(
  base?: PortfolioPriceBox | null,
  override?: PortfolioPriceBox | null,
): PortfolioPriceBox | null {
  const merged = { ...(base ?? {}) } as PortfolioPriceBox;

  if (override) {
    Object.entries(override).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        (merged as Record<string, unknown>)[key] = value;
      }
    });
  }

  const hasValue = Object.values(merged).some((value) => {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === "string") {
      return value.trim() !== "";
    }

    return true;
  });

  return hasValue ? merged : null;
}

export default function TripDetailPage({ trip, onBack, relatedTrips = [] }: TripDetailPageProps) {
  const { trackEvent } = useAnalytics();
  const dateOptions = trip.dateOptions || [
    {
      id: "default",
      label: trip.departure || trip.date || "Érdeklődjön",
      status: trip.guaranteed ? "Garantált indulás" : "Elérhető",
      seatsLeft: trip.seatsLeft ?? null,
      price: trip.priceBox?.price ?? null,
      displayedPrice: trip.priceBox?.displayedPrice ?? null,
      priceBox: trip.priceBox ?? null,
    },
  ];

  const [selectedDateId, setSelectedDateId] = useState(dateOptions[0].id);
  const selectedDate =
    dateOptions.find((item: any) => item.id === selectedDateId) ||
    dateOptions[0];

  const priceBox = mergePriceBoxes(trip.priceBox ?? null, selectedDate.priceBox ?? null);
  const selectedSeats = priceBox?.availableSeats ?? selectedDate.seatsLeft ?? null;

  useEffect(() => {
    if (!priceBox) {
      return;
    }

    trackEvent("pricebox_view", {
      entity: {
        type: "tour",
        slug: trip.slug,
      },
      metadata: {
        price: priceBox.price,
        displayed_price: priceBox.displayedPrice,
      },
    });
  }, [priceBox?.displayedPrice, priceBox?.price, trackEvent, trip.slug]);

  return (
    <div className="min-h-screen bg-[#f5f9fc]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={trip.image}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07111f]/80 via-[#07111f]/55 to-[#07111f]/90" />
        </div>

        <div className="relative z-10 max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20 pt-10 pb-28">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-white/75 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Vissza az ajánlatokhoz</span>
          </button>

          <div className="flex flex-wrap gap-3 mb-6">
            <Pill>{trip.country}</Pill>
            {trip.badge && <Pill active>{trip.badge}</Pill>}
            {priceBox?.ratingText ? (
              <Pill>
                <Star className="w-4 h-4 text-[#00c389]" />
                {priceBox.ratingText}
              </Pill>
            ) : null}
          </div>

          <h1
            className="text-white max-w-4xl"
            style={{
              fontSize: "clamp(3rem,6vw,6rem)",
              lineHeight: 0.95,
              fontWeight: 800,
              letterSpacing: "-0.05em",
            }}
          >
            {trip.title}
          </h1>

          {trip.subtitle ? (
            <p className="text-white/85 text-2xl font-medium max-w-2xl mt-3">
              {trip.subtitle}
            </p>
          ) : null}

          <p className="text-white/75 text-xl max-w-2xl mt-8 leading-relaxed">
            {trip.shortDescription}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-5xl">
            <HeroInfoCard
              icon={<Calendar />}
              label="Indulás"
              value={selectedDate.label}
            />
            <HeroInfoCard icon={<Clock />} label="Időtartam" value={trip.duration} />
            <HeroInfoCard
              icon={<Bus />}
              label="Utazás"
              value={trip.transport === "bus" ? "Buszos út" : "Repülős út"}
            />
            <HeroInfoCard icon={<Utensils />} label="Ellátás" value={trip.meals} />
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-12">
        <div className="max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
          <div className="bg-white rounded-[36px] border border-gray-100 shadow-[0_20px_70px_rgba(15,23,42,0.08)] p-6 md:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7 items-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InfoBox
                  icon={<ShieldCheck />}
                  label="Indulás státusza"
                  value={selectedDate.status}
                />
                {selectedSeats !== null ? (
                  <InfoBox
                    icon={<Users />}
                    label="Szabad helyek"
                    value={`Még ${selectedSeats} szabad hely`}
                  />
                ) : null}
                <InfoBox icon={<Hotel />} label="Szállás" value={trip.hotel} />
                <InfoBox
                  icon={<Calendar />}
                  label="Választott dátum"
                  value={selectedDate.label}
                />
              </div>

              <PriceBox
                priceBox={priceBox}
                onBookClick={() => {
                  trackEvent("booking_anchor_click", {
                    entity: {
                      type: "tour",
                      slug: trip.slug,
                    },
                    metadata: {
                      placement: "hero_pricebox",
                    },
                  });
                  document.getElementById("foglalas")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-10">
            <div>
              <OfferGallerySection
                title={trip.galleryTitle}
                subtitle={trip.gallerySubtitle}
                gallery={trip.gallery}
              />

              <OfferProgramTimeline
                programDays={trip.programDays}
                intro={trip.programBefore}
              />

              <OfferContentSection
                title="Kiegészítő / fizető programok"
                content={trip.paymentProgram}
              />

              <OfferContentSection
                title="További szolgáltatási információk"
                content={trip.inclusions}
              />

              <OfferContentSection title="Árak" content={trip.prices} />

              <OfferContentSection title="Kedvezmények" content={trip.discounts} />

              <OfferContentSection title="Jegyzet / egyéb" content={trip.notes} />

              <PriceInformationSection priceInformation={trip.priceInformation} />

              <SimilarTrips currentTrip={trip} relatedTrips={relatedTrips} />

              <BookingSection
                selectedDate={selectedDate}
                trip={trip}
                priceBox={priceBox}
              />
            </div>

            <aside className="space-y-6">
              <div className="sticky top-[92px] rounded-[34px] bg-white border border-gray-100 shadow-[0_16px_50px_rgba(15,23,42,0.08)] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#00c389]/10 text-[#00c389] flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="font-bold text-[#0f172a]">
                      Biztonságos foglalás
                    </div>
                    <div className="text-sm text-gray-500">
                      Gyors visszaigazolással
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[#0f172a] font-bold mb-3">
                    Válassz időpontot
                  </div>

                  <div className="space-y-3">
                    {dateOptions.map((date: any) => {
                      const active = selectedDateId === date.id;

                      return (
                        <button
                          key={date.id}
                          onClick={() => {
                            setSelectedDateId(date.id);
                            trackEvent("date_select", {
                              entity: {
                                type: "tour_date",
                                id: date.id,
                                slug: trip.slug,
                              },
                              metadata: {
                                label: date.label,
                                status: date.status,
                                price: date.price,
                              },
                            });
                          }}
                          className={`w-full text-left rounded-2xl p-4 border transition-all ${
                            active
                              ? "border-[#00c389] bg-[#00c389]/8 shadow-[0_10px_26px_rgba(0,195,137,0.12)]"
                              : "border-gray-100 bg-[#f5f9fc] hover:border-[#00c389]/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="font-bold text-[#0f172a]">
                              {date.label}
                            </div>

                            {active && (
                              <div className="w-6 h-6 rounded-full bg-[#00c389] text-white flex items-center justify-center">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-full bg-white text-[#00a878] font-bold">
                              {date.status}
                            </span>
                            {date.priceBox?.availableSeats !== null &&
                            date.priceBox?.availableSeats !== undefined ? (
                              <span className="px-2.5 py-1 rounded-full bg-white text-gray-500 font-semibold">
                                Még {date.priceBox.availableSeats} szabad hely
                              </span>
                            ) : date.seatsLeft !== null &&
                              date.seatsLeft !== undefined ? (
                              <span className="px-2.5 py-1 rounded-full bg-white text-gray-500 font-semibold">
                                Még {date.seatsLeft} szabad hely
                              </span>
                            ) : null}
                            {date.displayedPrice || date.priceBox?.displayedPrice ? (
                              <span className="px-2.5 py-1 rounded-full bg-white text-gray-900 font-bold">
                                {date.displayedPrice || date.priceBox?.displayedPrice}
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {priceBox?.urgencyText ? (
                    <SidebarInfo icon={<Users />} text={priceBox.urgencyText} />
                  ) : null}

                  {priceBox?.ratingText ? (
                    <SidebarInfo icon={<Star />} text={priceBox.ratingText} />
                  ) : null}

                  {priceBox?.discountText ? (
                    <SidebarInfo icon={<Flame />} text={priceBox.discountText} />
                  ) : null}
                </div>

                {priceBox ? (
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent("booking_anchor_click", {
                        entity: {
                          type: "tour",
                          slug: trip.slug,
                        },
                        metadata: {
                          placement: "sidebar_pricebox",
                        },
                      });
                      document
                        .getElementById("foglalas")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="group/cta flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] font-bold text-white shadow-[0_14px_34px_rgba(0,195,137,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(0,195,137,0.4)]"
                  >
                    Foglalás
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                  </button>
                ) : null}

                <OfferPrintableVersion slug={trip.slug} />

              </div>

            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function Pill({ children, active = false }: any) {
  return (
    <div
      className={`px-4 py-2 rounded-full backdrop-blur-xl text-sm font-semibold border border-white/10 flex items-center gap-2 ${
        active
          ? "bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white"
          : "bg-white/10 text-white"
      }`}
    >
      {children}
    </div>
  );
}

function parseDiscountPercent(discountBadge?: string | null): number | null {
  if (!discountBadge) {
    return null;
  }

  const match = discountBadge.match(/(-?\d+(?:[.,]\d+)?)\s*%/);
  if (!match) {
    return null;
  }

  const value = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(value) || value === 0) {
    return null;
  }

  return Math.abs(value);
}

function formatDiscountedDisplayedPrice(
  basePrice: number,
  displayedPrice?: string | null,
  priceSuffix?: string | null,
): string {
  const formattedAmount = `${new Intl.NumberFormat("hu-HU").format(
    Math.round(basePrice),
  )},-`;

  if (displayedPrice) {
    const match = displayedPrice.match(/^([^\d]*)([\d\s.,-]+)(.*)$/);
    if (match) {
      const [, prefix, , suffix] = match;
      return `${prefix}${formattedAmount}${suffix}`;
    }
  }

  if (priceSuffix) {
    return `${formattedAmount} Ft${priceSuffix.startsWith("/") ? "" : " "}${priceSuffix}`;
  }

  return `${formattedAmount} Ft`;
}

function PriceBox({
  priceBox,
  onBookClick,
}: {
  priceBox?: PortfolioPriceBox | null;
  onBookClick: () => void;
}) {
  if (!priceBox) {
    return null;
  }

  const discountPercent = parseDiscountPercent(priceBox.discountBadge);
  const discountedPrice =
    discountPercent !== null && priceBox.price !== null && priceBox.price !== undefined
      ? priceBox.price * (1 - discountPercent / 100)
      : null;
  const discountedDisplayedPrice =
    discountedPrice !== null
      ? formatDiscountedDisplayedPrice(
          discountedPrice,
          priceBox.displayedPrice,
          priceBox.priceSuffix,
        )
      : null;
  const hasDiscount = Boolean(priceBox.discountBadge && discountedDisplayedPrice);
  const priceLabel = hasDiscount ? "Akciós ár" : "Ár";

  return (
    <div className="rounded-[30px] bg-gradient-to-br from-[#07111f] to-[#0d2240] p-6 text-white shadow-[0_24px_60px_rgba(7,17,31,0.24)]">
      <div className="text-white/50 text-sm mb-2">{priceLabel}</div>

      {hasDiscount ? (
        <div className="flex items-center gap-3 mb-2">
          <div className="relative text-white/35 text-3xl font-bold">
            {priceBox.displayedPrice}
            <div className="absolute left-0 right-0 top-1/2 h-[3px] rounded-full bg-red-500" />
          </div>
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-xs font-bold">
            {priceBox.discountBadge}
          </div>
        </div>
      ) : null}

      <div className="text-5xl font-bold tracking-tight">
        {discountedDisplayedPrice ?? priceBox.displayedPrice}
      </div>

      <a
        href="#foglalas"
        onClick={(event) => {
          event.preventDefault();
          onBookClick();
        }}
        className="group/cta mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-lg font-bold text-white shadow-[0_20px_40px_rgba(0,195,137,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_52px_rgba(0,195,137,0.4)]"
      >
        Foglalás
        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/cta:translate-x-1" />
      </a>
    </div>
  );
}

function HeroInfoCard({ icon, label, value }: any) {
  return (
    <div className="rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/10 p-5">
      <div className="text-[#00c389] mb-3">{icon}</div>
      <div className="text-white/60 text-sm mb-1">{label}</div>
      <div className="text-white font-bold">{value}</div>
    </div>
  );
}

function InfoBox({ icon, label, value }: any) {
  return (
    <div className="rounded-[24px] bg-[#f5f9fc] p-5 min-h-[150px]">
      <div className="text-[#00c389] mb-3">{icon}</div>
      <div className="text-gray-500 text-sm mb-1">{label}</div>
      <div className="text-[#0f172a] font-bold leading-tight">{value}</div>
    </div>
  );
}

function SectionEyebrow({ title }: any) {
  return (
    <div className="inline-flex items-center gap-2 text-[#00a878] text-sm font-bold mb-4">
      <TrendingUp className="w-4 h-4" />
      {title}
    </div>
  );
}

function SidebarInfo({ icon, text }: any) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f5f9fc] p-4">
      <div className="text-[#00c389]">{icon}</div>
      <div className="text-sm font-semibold text-[#0f172a]">{text}</div>
    </div>
  );
}

function PriceInformationSection({ priceInformation }: { priceInformation?: { included?: Array<{ id: string; text: string }>; excluded?: Array<{ id: string; text: string }>; } | null }) {
  const included = priceInformation?.included ?? [];
  const excluded = priceInformation?.excluded ?? [];

  if (included.length === 0 && excluded.length === 0) {
    return null;
  }

  return (
    <div className="mb-20">
      <SectionEyebrow title="ÁRINFORMÁCIÓ" />

      <h2 className="mb-4 text-5xl font-bold tracking-tight text-[#0f172a]">
        Mit tartalmaz az ár?
      </h2>

      <p className="mb-10 text-lg text-gray-500">
        Átlátható információk a foglalás előtt.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {included.length > 0 ? (
          <PriceInformationCard
            title="Az ár tartalmazza"
            items={included}
            positive
          />
        ) : null}

        {excluded.length > 0 ? (
          <PriceInformationCard
            title="Az ár nem tartalmazza"
            items={excluded}
          />
        ) : null}
      </div>
    </div>
  );
}

function PriceInformationCard({ title, items, positive = false }: { title: string; items: Array<{ id: string; text: string }>; positive?: boolean; }) {
  return (
    <div className="bg-white rounded-[30px] border border-gray-100 p-8">
      <h3 className="text-2xl font-bold text-[#0f172a] mb-6">{title}</h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                positive ? "bg-[#00c389]/10 text-[#00c389]" : "bg-red-50 text-red-500"
              }`}
            >
              {positive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </div>

            <span className="text-gray-700">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimilarTrips({ currentTrip, relatedTrips }: any) {
  const items = (relatedTrips ?? [])
    .filter((offer: any) => offer.seoName !== currentTrip.slug)
    .slice(0, 3)
    .map((offer: any) => toUnifiedOfferCardModel(offer));

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mb-24">
      <SectionEyebrow title="HASONLÓ UTAK" />

      <h2 className="text-5xl font-bold text-[#0f172a] mb-4 tracking-tight">
        Ezek is érdekelhetnek
      </h2>

      <p className="text-gray-500 text-lg mb-10">
        Hasonló hangulatú, tengerparti és városnézős ajánlatok.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <OfferCard key={item.id} offer={item} />
        ))}
      </div>
    </section>
  );
}
