// TripDetailPage.tsx

import { type ReactNode, useEffect, useState } from "react";
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
  Plane,
  ChevronRight,
  MapPin,
  CreditCard,
  Info,
  Mail,
} from "lucide-react";
import { Link } from "react-router";
import OfferGallerySection from "./OfferGallerySection";
import OfferProgramTimeline from "./OfferProgramTimeline";
import OfferContentSection from "./OfferContentSection";
import OfferTeaserCard from "./OfferTeaserCard";
import OfferPrintableVersion from "./OfferPrintableVersion";
import { useAnalytics } from "../analytics/useAnalytics";
import { type PortfolioPriceBox } from "../content/portfolio-offer-detail-api";
import { toUnifiedOfferCardModel } from "../content/portfolio-offer-card-model";
import type { PortfolioFeaturedTour } from "../content/portfolio-featured-tours-api";
import type { TripDetail } from "../routes/TripRoute";
import OfferCard from "./OfferCard";
import BookingHowItWorks from "./BookingHowItWorks";
import BookingSection from "../booking/BookingSection";
import GroupInquirySection, {
  GROUP_INQUIRY_MIN_PASSENGERS,
  GROUP_INQUIRY_SECTION_ID,
} from "../booking/GroupInquirySection";
import { parseDiscountPercent } from "../content/discount-badge";
import { responsiveImage } from "../lib/responsiveImage";

interface TripDetailPageProps {
  trip: TripDetail;
  relatedTrips?: PortfolioFeaturedTour[];
  onBack: () => void;
}

const DATE_PICKER_ID = "idopontok";

type IconLabelValueProps = {
  icon: ReactNode;
  label: ReactNode;
  value: ReactNode;
};

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
  const dateOptions = trip.dateOptions;

  const [selectedDateId, setSelectedDateId] = useState(
    (dateOptions.find((date) => date.bookable) ?? dateOptions[0]).id,
  );
  const selectedDate =
    dateOptions.find((item) => item.id === selectedDateId) ||
    dateOptions[0];
  // A sold-out or cancelled date, or a tour without a bookable date, can
  // only be requested as a group quote.
  const canBook = trip.hasBookableDates && selectedDate.bookable;
  const bookingSectionId = canBook ? "foglalas" : GROUP_INQUIRY_SECTION_ID;
  const bookLabel = canBook ? "Foglalás" : "Ajánlatot kérek";
  const [groupInquiryOpened, setGroupInquiryOpened] = useState(false);

  function openGroupInquiry(placement: string) {
    setGroupInquiryOpened(true);
    trackEvent("lead_start", {
      entity: { type: "tour", slug: trip.slug },
      metadata: { source: "group_inquiry", placement },
    });
    requestAnimationFrame(() => {
      document.getElementById(GROUP_INQUIRY_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const priceBox = mergePriceBoxes(trip.priceBox ?? null, selectedDate.priceBox ?? null);
  const selectedSeats = priceBox?.availableSeats ?? selectedDate.seatsLeft ?? null;
  const offeredDeparturePlaces =
    selectedDate.departurePlaceIds.length > 0
      ? trip.departurePlaces.filter((place) => selectedDate.departurePlaceIds.includes(Number(place.id)))
      : trip.departurePlaces;

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
            {...responsiveImage(trip.image)}
            sizes="100vw"
            fetchPriority="high"
            decoding="async"
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07111f]/80 via-[#07111f]/55 to-[#07111f]/90" />
        </div>

        <div className="relative z-10 max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20 pt-10 pb-28">
          <nav aria-label="Morzsamenü" className="mb-8 text-sm font-medium text-white/70">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Főoldal</Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
              <li>
                <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-white transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Utazások
                </button>
              </li>
              {trip.country ? (
                <>
                  <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
                  <li>{trip.country}</li>
                </>
              ) : null}
              <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
              <li aria-current="page" className="text-white">{trip.title}</li>
            </ol>
          </nav>

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

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mt-10 max-w-6xl">
            <HeroInfoCard
              icon={<Calendar />}
              label="Indulás"
              value={selectedDate.label}
              note={
                dateOptions.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById(DATE_PICKER_ID)?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className="text-[#5eead4] hover:text-white transition-colors"
                  >
                    +{dateOptions.length - 1} további időpont
                  </button>
                ) : null
              }
            />
            <HeroInfoCard icon={<Clock />} label="Időtartam" value={trip.duration} />
            <HeroInfoCard
              icon={trip.transport === "plane" ? <Plane /> : <Bus />}
              label="Utazás"
              value={trip.transport === "plane" ? "Repülős út" : "Autóbuszos út"}
            />
            <HeroInfoCard icon={<Utensils />} label="Ellátás" value={trip.meals} info={trip.mealsInfo} />
            <HeroInfoCard icon={<Hotel />} label="Szállás" value={trip.hotel} info={trip.hotelInfo} />
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-12">
        <div className="max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
          <div className="bg-white rounded-[36px] border border-gray-100 shadow-[0_20px_70px_rgba(15,23,42,0.08)] p-6 md:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7 lg:gap-10 items-center">
              <SelectedDepartureSummary
                dateLabel={selectedDate.label}
                status={selectedDate.status}
                bookable={selectedDate.bookable}
                seats={selectedSeats}
                duration={trip.duration}
                depositPercent={selectedDate.depositPercent ?? null}
                otherDates={dateOptions.length - 1}
                onShowDates={() =>
                  document.getElementById(DATE_PICKER_ID)?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              />

              <PriceBox
                priceBox={priceBox}
                bookLabel={bookLabel}
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
                  document.getElementById(bookingSectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                footer={
                  canBook ? (
                    <GroupInquiryLink tone="dark" onClick={() => openGroupInquiry("hero_pricebox")} />
                  ) : null
                }
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

              <OfferContentSection title="Kedvcsináló" content={trip.teaser} className="xl:hidden" />

              <OfferProgramTimeline
                programDays={trip.programDays}
                intro={trip.programBefore}
              />

              <OfferContentSection title="Fakultatív programok" content={trip.optionalPrograms} />

              <OfferContentSection title="Belépőjegyek" content={trip.tickets} />

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

              <DeparturePlacesSection places={offeredDeparturePlaces} />

              {canBook ? (
                <BookingSection
                  selectedDate={selectedDate}
                  trip={trip}
                  priceBox={priceBox}
                />
              ) : trip.hasBookableDates ? (
                <div className="rounded-[28px] border border-red-100 bg-red-50 p-6 text-[#0f172a]">
                  <div className="font-bold mb-1">
                    A {selectedDate.label} időpont {selectedDate.status === "Törölve" ? "elmarad" : "betelt"}.
                  </div>
                  <p className="text-gray-600 text-sm">
                    Válassz egy másik időpontot, vagy kérj ajánlatot alább.
                  </p>
                </div>
              ) : null}

              <GroupInquirySection
                trip={trip}
                requestOnly={!canBook}
                opened={groupInquiryOpened}
                onOpen={() => openGroupInquiry("section")}
              />

              <BookingHowItWorks />

              <SimilarTrips currentTrip={trip} relatedTrips={relatedTrips} />
            </div>

            <aside className="space-y-6">
              <div className="sticky top-[92px] rounded-[34px] bg-white border border-gray-100 shadow-[0_16px_50px_rgba(15,23,42,0.08)] p-6 xl:max-h-[calc(100vh-110px)] xl:overflow-y-auto">
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

                <OfferTeaserCard content={trip.teaser} className="hidden xl:block" />

                <div id={DATE_PICKER_ID} className="mb-6 scroll-mt-28">
                  <div className="text-[#0f172a] font-bold mb-3">
                    Válassz időpontot
                  </div>

                  <div className="space-y-3">
                    {dateOptions.map((date) => {
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
                                {date.priceBox?.originalDisplayedPrice ? (
                                  <s className="mr-1.5 font-semibold text-gray-400">
                                    {date.priceBox.originalDisplayedPrice}
                                  </s>
                                ) : null}
                                {date.displayedPrice || date.priceBox?.displayedPrice}
                              </span>
                            ) : null}
                            {date.priceBox?.label ? (
                              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-bold">
                                {date.priceBox.label}
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
                        .getElementById(bookingSectionId)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="group/cta flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] font-bold text-white shadow-[0_14px_34px_rgba(0,195,137,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(0,195,137,0.4)]"
                  >
                    {bookLabel}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                  </button>
                ) : null}

                {canBook ? (
                  <GroupInquiryLink tone="light" onClick={() => openGroupInquiry("sidebar")} />
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

function Pill({ children, active = false }: { children: ReactNode; active?: boolean }) {
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
  bookLabel,
  onBookClick,
  footer,
}: {
  priceBox?: PortfolioPriceBox | null;
  bookLabel: string;
  onBookClick: () => void;
  footer?: ReactNode;
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
  // A percentage badge discounts the price here; a promotion stored with its
  // pre-promotion price ("Előfoglalási akció") already has the lower price.
  const struckPrice = discountedDisplayedPrice
    ? priceBox.displayedPrice
    : priceBox.originalDisplayedPrice;
  const badge = discountedDisplayedPrice ? priceBox.discountBadge : priceBox.label;
  const hasDiscount = Boolean(struckPrice);
  const priceLabel = hasDiscount ? "Akciós ár" : "Ár";

  return (
    <div className="rounded-[30px] bg-gradient-to-br from-[#07111f] to-[#0d2240] p-6 text-white shadow-[0_24px_60px_rgba(7,17,31,0.24)]">
      <div className="text-white/50 text-sm mb-2">{priceLabel}</div>

      {hasDiscount || badge ? (
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {hasDiscount ? (
            <div className="relative text-white/35 text-3xl font-bold">
              {struckPrice}
              <div className="absolute left-0 right-0 top-1/2 h-[3px] rounded-full bg-red-500" />
            </div>
          ) : null}
          {badge ? (
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-xs font-bold">
              {badge}
            </div>
          ) : null}
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
        {bookLabel}
        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/cta:translate-x-1" />
      </a>

      {footer}
    </div>
  );
}

/** Opens the group quote request form, offered next to every booking button. */
function GroupInquiryLink({ tone, onClick }: { tone: "dark" | "light"; onClick: () => void }) {
  const toneClassName =
    tone === "dark"
      ? "border-white/15 text-white hover:bg-white/10"
      : "border-[#00c389]/30 text-[#0f172a] hover:bg-[#00c389]/5";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${toneClassName}`}
    >
      <Users className="h-5 w-5 shrink-0 text-[#00c389]" />
      <span>
        <span className="block font-bold">Egyedi ajánlatot kérek</span>
        <span className={`block text-xs ${tone === "dark" ? "text-white/60" : "text-gray-500"}`}>
          Csoportoknak, egyedi időpontra (min.&nbsp;{GROUP_INQUIRY_MIN_PASSENGERS}&nbsp;fő)
        </span>
      </span>
    </button>
  );
}

function HeroInfoCard({
  icon,
  label,
  value,
  note,
  info,
}: IconLabelValueProps & { note?: ReactNode; info?: string | null }) {
  return (
    <div className="relative rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/10 p-5">
      <div className="text-[#00c389] mb-3">{icon}</div>
      <div className="text-white/60 text-sm mb-1">{label}</div>
      <div className="flex items-start gap-2">
        <div className="text-white font-bold">{value}</div>
        {info ? <InfoPopover label={`${label}: információ`} text={info} /> : null}
      </div>
      {note ? <div className="mt-1 text-sm font-semibold">{note}</div> : null}
    </div>
  );
}

/**
 * The ⓘ next to a trip fact: opens a small box with the details above the card
 * (its nearest positioned ancestor), as on the legacy site.
 */
function InfoPopover({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00c389]/20 text-[#5eead4] transition-colors hover:bg-[#00c389] hover:text-white"
      >
        <Info className="h-4 w-4" />
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute inset-x-0 bottom-full z-30 mb-3 rounded-2xl bg-white p-4 text-left text-sm font-medium leading-relaxed text-[#334155] shadow-[0_20px_50px_rgba(15,23,42,0.25)]"
        >
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-[#00a878]">Információ</span>
          <span className="whitespace-pre-line">{text}</span>
        </span>
      ) : null}
    </span>
  );
}

/** The chosen departure at a glance, next to the price: availability and how booking works. */
function SelectedDepartureSummary({
  dateLabel,
  status,
  bookable,
  seats,
  duration,
  depositPercent,
  otherDates,
  onShowDates,
}: {
  dateLabel: string;
  status: string;
  bookable: boolean;
  seats: number | null;
  duration: string;
  depositPercent: number | null;
  otherDates: number;
  onShowDates: () => void;
}) {
  // A full date takes no payment, so its rules are beside the point.
  const payment =
    !bookable || depositPercent === null
      ? null
      : depositPercent < 100
        ? { title: `Foglaláskor csak ${depositPercent}% előleg`, text: "A többit részletekben, az indulás előtt fizeted." }
        : { title: "Egyösszegű fizetés", text: "Közeli indulás: a teljes díjat a foglalás után fizeted." };
  const benefits = [
    ...(payment ? [{ icon: <CreditCard />, ...payment }] : []),
    { icon: <Mail />, title: "Azonnali visszaigazolás", text: "Emailben, a teljes utazási könyvvel." },
    { icon: <ShieldCheck />, title: "23 éve szervezünk utakat", text: "Tapasztalt csapat, megbízható szervezés." },
  ];

  return (
    <div className="flex flex-col justify-between gap-6 py-1 md:pl-2">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Kiválasztott indulás</div>
        <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-3">
          <div className="text-3xl md:text-4xl font-bold tracking-tight text-[#0f172a]">{dateLabel}</div>
          {otherDates > 0 ? (
            <button
              type="button"
              onClick={onShowDates}
              className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[#00c389]/30 px-3.5 py-1.5 text-sm font-semibold text-[#00a878] transition-colors hover:bg-[#00c389]/10"
            >
              <Calendar className="h-4 w-4" />
              Másik időpont (+{otherDates})
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 ${
              bookable ? "bg-[#e6faf3] text-[#00875f]" : "bg-red-50 text-red-600"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${bookable ? "bg-[#00c389]" : "bg-red-500"}`} />
            {status}
          </span>
          {bookable && seats !== null ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f9fc] px-3.5 py-1.5 text-[#334155]">
              <Users className="h-4 w-4 text-[#00a878]" />
              Még {seats} szabad hely
            </span>
          ) : null}
          {duration ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f9fc] px-3.5 py-1.5 text-[#334155]">
              <Clock className="h-4 w-4 text-[#00a878]" />
              {duration}
            </span>
          ) : null}
        </div>

        {!bookable ? (
          <p className="mt-3 text-sm text-gray-500">
            Erre az időpontra már nincs hely – válassz másik időpontot, vagy kérj egyedi ajánlatot.
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="rounded-[22px] bg-[#f5f9fc] p-4">
            <div className="mb-2 text-[#00c389] [&_svg]:h-5 [&_svg]:w-5">{benefit.icon}</div>
            <div className="font-bold leading-snug text-[#0f172a]">{benefit.title}</div>
            <div className="mt-1 text-sm leading-snug text-gray-500">{benefit.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionEyebrow({ title }: { title: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[#00a878] text-sm font-bold mb-4">
      <TrendingUp className="w-4 h-4" />
      {title}
    </div>
  );
}

function SidebarInfo({ icon, text }: { icon: ReactNode; text: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f5f9fc] p-4">
      <div className="text-[#00c389]">{icon}</div>
      <div className="text-sm font-semibold text-[#0f172a]">{text}</div>
    </div>
  );
}

/** Where the coach picks travellers up for the chosen date ("Felszállási lehetőség" on the legacy site). */
function DeparturePlacesSection({ places }: { places: TripDetail["departurePlaces"] }) {
  if (places.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] md:p-8">
      <SectionEyebrow title="Felszállás" />
      <h2 className="text-2xl font-bold tracking-tight text-[#0f172a]">Felszállási lehetőségek</h2>
      <ul className="mt-5 flex flex-wrap gap-2">
        {places.map((place) => (
          <li
            key={place.id}
            className="inline-flex items-center gap-2 rounded-full bg-[#f5f9fc] px-4 py-2 text-sm font-semibold text-[#334155]"
          >
            <MapPin className="h-4 w-4 text-[#00a878]" />
            {place.name}
            {place.fee > 0 ? <span className="font-normal text-gray-500">+{place.fee.toLocaleString("hu-HU")} Ft/fő</span> : null}
          </li>
        ))}
      </ul>
    </section>
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

function SimilarTrips({
  currentTrip,
  relatedTrips,
}: {
  currentTrip: TripDetail;
  relatedTrips: PortfolioFeaturedTour[];
}) {
  const items = relatedTrips
    .filter((offer) => offer.seoName !== currentTrip.slug)
    .slice(0, 3)
    .map((offer) => toUnifiedOfferCardModel(offer));

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-24">
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
