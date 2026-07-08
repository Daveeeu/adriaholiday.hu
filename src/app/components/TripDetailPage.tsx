// TripDetailPage.tsx

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
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
  Phone,
  Mail,
  Flame,
} from "lucide-react";
import OfferGallerySection from "./OfferGallerySection";
import OfferProgramTimeline from "./OfferProgramTimeline";
import OfferContentSection from "./OfferContentSection";
import { useAnalytics } from "../analytics/useAnalytics";
import type { PortfolioPriceBox } from "../content/portfolio-offer-detail-api";
import { toUnifiedOfferCardModel } from "../content/portfolio-offer-card-model";
import OfferCard from "./OfferCard";
import {
  submitBooking,
  BookingApiError,
  BookingValidationError,
} from "../booking/bookings-api";

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

function hasText(value?: string | null) {
  return typeof value === "string" && value.trim() !== "";
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

              <BottomBookingSection
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

                {(priceBox?.ctaPrimaryLabel ?? priceBox?.ctaSecondaryLabel) ? (
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
                    className="w-full h-14 rounded-2xl bg-[#f5f9fc] text-[#0f172a] font-bold border border-gray-200 hover:border-[#00c389]/40 transition-all"
                  >
                    {priceBox?.ctaPrimaryLabel ?? priceBox?.ctaSecondaryLabel}
                  </button>
                ) : null}

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

      {(priceBox.ctaPrimaryLabel ?? priceBox.ctaSecondaryLabel) ? (
        <a
          href="#foglalas"
          onClick={(event) => {
            event.preventDefault();
            onBookClick();
          }}
          className="w-full mt-6 h-14 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-bold text-lg shadow-[0_20px_40px_rgba(0,195,137,0.25)] flex items-center justify-center"
        >
          {priceBox.ctaPrimaryLabel ?? priceBox.ctaSecondaryLabel}
        </a>
      ) : null}
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

type BookingFieldVisibility = "required" | "optional" | "hidden";

type BookingTemplateField = {
  key: string;
  label: string;
  fieldType: string;
  inputGroup: "contact" | "passenger";
  visibility: BookingFieldVisibility;
  sortOrder: number;
  options?: string[] | null;
};

const DEFAULT_BOOKING_FIELDS: BookingTemplateField[] = [
  { key: "contact_name", label: "Teljes név", fieldType: "text", inputGroup: "contact", visibility: "required", sortOrder: 1 },
  { key: "contact_email", label: "E-mail", fieldType: "email", inputGroup: "contact", visibility: "required", sortOrder: 2 },
  { key: "contact_phone", label: "Telefonszám", fieldType: "tel", inputGroup: "contact", visibility: "required", sortOrder: 3 },
  { key: "contact_city", label: "Város", fieldType: "text", inputGroup: "contact", visibility: "optional", sortOrder: 4 },
  { key: "passenger_name", label: "Utas neve", fieldType: "text", inputGroup: "passenger", visibility: "required", sortOrder: 5 },
  { key: "passenger_birth_date", label: "Születési dátum", fieldType: "date", inputGroup: "passenger", visibility: "required", sortOrder: 6 },
  { key: "passenger_nationality", label: "Állampolgárság", fieldType: "text", inputGroup: "passenger", visibility: "optional", sortOrder: 7 },
];

function resolveBookingFields(trip: any): BookingTemplateField[] {
  const templateFields = trip?.bookingFormTemplate?.fields as BookingTemplateField[] | undefined;

  if (templateFields && templateFields.length > 0) {
    return templateFields
      .filter((field) => field.visibility !== "hidden")
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return DEFAULT_BOOKING_FIELDS;
}

function emptyPassenger(passengerFields: BookingTemplateField[]): Record<string, string> {
  return passengerFields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.key] = "";
    return accumulator;
  }, {});
}

function computeBookingErrors(
  contactFields: BookingTemplateField[],
  passengerFields: BookingTemplateField[],
  contactValues: Record<string, string>,
  passengers: Record<string, string>[],
): { contact: Record<string, string>; passengers: Record<number, Record<string, string>> } {
  const contactErrors: Record<string, string> = {};
  const passengerErrors: Record<number, Record<string, string>> = {};

  contactFields.forEach((field) => {
    if (field.visibility === "required" && !(contactValues[field.key] ?? "").trim()) {
      contactErrors[field.key] = `A(z) "${field.label}" mező megadása kötelező.`;
    }
  });

  passengers.forEach((passenger, index) => {
    passengerFields.forEach((field) => {
      if (field.visibility === "required" && !(passenger[field.key] ?? "").trim()) {
        passengerErrors[index] = {
          ...passengerErrors[index],
          [field.key]: `A(z) "${field.label}" mező megadása kötelező.`,
        };
      }
    });
  });

  return { contact: contactErrors, passengers: passengerErrors };
}

function BottomBookingSection({ selectedDate, trip, priceBox }: any) {
  const { trackEvent } = useAnalytics();
  const [step, setStep] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [contactValues, setContactValues] = useState<Record<string, string>>({});
  const [passengers, setPassengers] = useState<Record<string, string>[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<{
    contact: Record<string, string>;
    passengers: Record<number, Record<string, string>>;
  }>({ contact: {}, passengers: {} });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | number | null>(null);

  const fields = useMemo(() => resolveBookingFields(trip), [trip]);
  const contactFields = useMemo(() => fields.filter((field) => field.inputGroup === "contact"), [fields]);
  const passengerFields = useMemo(() => fields.filter((field) => field.inputGroup === "passenger"), [fields]);

  useEffect(() => {
    setPassengers((current) => (current.length > 0 ? current : [emptyPassenger(passengerFields)]));
  }, [passengerFields]);

  const steps = [
    { id: 1, title: "Utazás" },
    { id: 2, title: "Kapcsolat" },
    { id: 3, title: "Utasok" },
    { id: 4, title: "Véglegesítés" },
  ];

  function markStarted() {
    if (hasStarted) {
      return;
    }

    setHasStarted(true);
    trackEvent("booking_start", {
      entity: { type: "tour", slug: trip.slug },
      metadata: { transport: trip.transport },
    });
  }

  function setContactValue(key: string, value: string) {
    markStarted();
    setContactValues((current) => ({ ...current, [key]: value }));
  }

  function setPassengerValue(index: number, key: string, value: string) {
    markStarted();
    setPassengers((current) =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, [key]: value } : passenger,
      ),
    );
  }

  function addPassenger() {
    setPassengers((current) => {
      const next = [...current, emptyPassenger(passengerFields)];
      trackEvent("participants_change", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { participants: next.length },
      });
      return next;
    });
  }

  function removePassenger(index: number) {
    setPassengers((current) => {
      if (current.length <= 1) {
        return current;
      }

      const next = current.filter((_, passengerIndex) => passengerIndex !== index);
      trackEvent("participants_change", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { participants: next.length },
      });
      return next;
    });
  }

  function nextStep() {
    if (step === 2) {
      const errors = computeBookingErrors(contactFields, passengerFields, contactValues, passengers);
      setFieldErrors((current) => ({ ...current, contact: errors.contact }));
      if (Object.keys(errors.contact).length > 0) {
        return;
      }
    }

    if (step === 3) {
      const errors = computeBookingErrors(contactFields, passengerFields, contactValues, passengers);
      setFieldErrors(errors);
      if (Object.keys(errors.passengers).length > 0) {
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 4));
  }

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  async function handleSubmit() {
    const errors = computeBookingErrors(contactFields, passengerFields, contactValues, passengers);
    setFieldErrors(errors);

    if (Object.keys(errors.contact).length > 0) {
      setStep(2);
      return;
    }

    if (Object.keys(errors.passengers).length > 0) {
      setStep(3);
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const tourDateId = selectedDate?.id && selectedDate.id !== "default" ? selectedDate.id : null;

    try {
      const response = await submitBooking({
        tourId: trip.id,
        tourDateId,
        participants: passengers.length,
        formData: contactValues,
        passengers,
        note: contactValues.note,
        type: "tour_booking",
      });

      setBookingId(response.id);
      setStatus("success");
      trackEvent("lead_submit", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { booking_id: response.id, participants: passengers.length },
      });
    } catch (submitError) {
      setStatus("error");

      if (submitError instanceof BookingValidationError) {
        const contactErrors: Record<string, string> = {};
        const passengerErrors: Record<number, Record<string, string>> = {};

        Object.entries(submitError.errors).forEach(([key, messages]) => {
          const message = messages[0] ?? "Érvénytelen mező.";
          const passengerMatch = key.match(/^passengers\.(\d+)\.(.+)$/);
          const contactMatch = key.match(/^formData\.(.+)$/);

          if (passengerMatch) {
            const index = Number(passengerMatch[1]);
            passengerErrors[index] = { ...passengerErrors[index], [passengerMatch[2]]: message };
          } else if (contactMatch) {
            contactErrors[contactMatch[1]] = message;
          }
        });

        setFieldErrors({ contact: contactErrors, passengers: passengerErrors });
        setErrorMessage(submitError.message);

        if (Object.keys(contactErrors).length > 0) {
          setStep(2);
        } else if (Object.keys(passengerErrors).length > 0) {
          setStep(3);
        }
      } else if (submitError instanceof BookingApiError) {
        setErrorMessage(submitError.message);
      } else {
        setErrorMessage("Váratlan hiba történt a foglalás elküldése közben.");
      }

      trackEvent("booking_error", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { message: submitError instanceof Error ? submitError.message : "unknown_error" },
      });
    }
  }

  if (status === "success") {
    return (
      <section id="foglalas" className="scroll-mt-[92px]">
        <div className="rounded-[40px] bg-[#07111f] p-8 md:p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00c389]/15 text-[#00c389]">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Köszönjük a foglalást!
          </h2>
          <p className="text-white/65 text-lg max-w-xl mx-auto">
            Foglalásod azonosítója: <span className="font-bold text-white">#{bookingId}</span>.
            Munkatársunk hamarosan felveszi veled a kapcsolatot a visszaigazolás érdekében.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="foglalas" className="scroll-mt-[92px]">
      <div className="relative overflow-hidden rounded-[40px] bg-[#07111f] p-5 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,195,137,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(22,184,255,0.15),transparent_30%)]" />

        <div className="relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 mb-5">
              <ShieldCheck className="w-4 h-4 text-[#00c389]" />
              Biztonságos online foglalás
            </div>

            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
              Foglalás
            </h2>

            <p className="max-w-2xl text-white/65 text-lg leading-relaxed">
              Válaszd ki az adatokat pár egyszerű lépésben.
            </p>
          </div>

          <div className="rounded-[30px] bg-white/8 border border-white/10 backdrop-blur-xl p-4 md:p-6">
            <div className="grid grid-cols-4 gap-3 mb-6">
              {steps.map((item) => {
                const active = step === item.id;
                const done = step > item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setStep(item.id)}
                    className={`h-12 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      active
                        ? "bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white"
                        : done
                        ? "bg-white/15 text-white"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold">
                      {done ? <Check className="w-4 h-4" /> : item.id}
                    </div>

                    <span className="hidden md:block text-sm font-bold">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[28px] bg-white p-5 md:p-7">
              {step === 1 && (
                <StepPanel
                  title="Utazás adatai"
                  text="Ellenőrizd a kiválasztott adatokat."
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <FormReadonly label="Utazás" value={trip.title} />
                    <FormReadonly label="Dátum" value={selectedDate.label} />
                    <FormReadonly
                      label="Utazás módja"
                      value={trip.transport === "bus" ? "Buszos út" : "Repülős út"}
                    />
                    <FormReadonly label="Ellátás" value={trip.meals || "-"} />
                    <FormReadonly label="Szállás" value={trip.hotel || "-"} />
                    <FormReadonly
                      label="Részvételi díj"
                      value={priceBox?.displayedPrice ?? ""}
                    />
                  </div>
                </StepPanel>
              )}

              {step === 2 && (
                <StepPanel
                  title="Kapcsolattartó"
                  text="Kapcsolati adatok megadása."
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contactFields.map((field) => (
                      <FormInput
                        key={field.key}
                        label={`${field.label}${field.visibility === "required" ? "*" : ""}`}
                        type={field.fieldType}
                        value={contactValues[field.key] ?? ""}
                        onChange={(value) => setContactValue(field.key, value)}
                        error={fieldErrors.contact[field.key]}
                      />
                    ))}
                  </div>
                </StepPanel>
              )}

              {step === 3 && (
                <StepPanel
                  title="Utas adatai"
                  text="Add meg az utasok alapadatait."
                >
                  <div className="space-y-5">
                    {passengers.map((passenger, index) => (
                      <div key={index} className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-bold text-[#0f172a]">{index + 1}. utas</div>
                          {passengers.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removePassenger(index)}
                              className="text-sm text-gray-400 hover:text-red-500"
                            >
                              Eltávolítás
                            </button>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {passengerFields.map((field) => (
                            <FormInput
                              key={field.key}
                              label={`${field.label}${field.visibility === "required" ? "*" : ""}`}
                              type={field.fieldType}
                              value={passenger[field.key] ?? ""}
                              onChange={(value) => setPassengerValue(index, field.key, value)}
                              error={fieldErrors.passengers[index]?.[field.key]}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addPassenger}
                      className="text-sm font-bold text-[#00a878] hover:text-[#00c389]"
                    >
                      + Újabb utas hozzáadása
                    </button>
                  </div>
                </StepPanel>
              )}

              {step === 4 && (
                <StepPanel title="Véglegesítés" text="Extra opciók és megjegyzés.">
                  <div className="space-y-4">
                    <CheckboxCard
                      title="Egyágyas felár"
                      text="Külön szoba igénylése."
                      price="+122.000 Ft"
                    />

                    <CheckboxCard
                      title="Útlemondási biztosítás"
                      text="Biztosítás lemondás esetére."
                      price="+ díj alapján"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    <PaymentOption title="Banki befizetés" />
                    <PaymentOption title="Átutalás" />
                  </div>

                  {errorMessage ? (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                      {errorMessage}
                    </div>
                  ) : null}
                </StepPanel>
              )}

              <div className="mt-8 border-t border-gray-100 pt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Összesen</div>
                  {priceBox?.displayedPrice ? (
                    <div className="text-3xl font-extrabold text-[#00a878]">
                      {priceBox.displayedPrice}
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className="h-12 px-6 rounded-xl bg-gray-100 text-[#0f172a] font-bold disabled:opacity-40"
                  >
                    Vissza
                  </button>

                  <button
                    onClick={step < 4 ? nextStep : handleSubmit}
                    disabled={status === "submitting"}
                    className="h-12 px-7 rounded-xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-bold disabled:opacity-60"
                  >
                    {status === "submitting" ? "Küldés..." : step < 4 ? "Következő" : "Foglalás elküldése"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[30px] bg-white/10 border border-white/10 backdrop-blur-xl p-5 md:p-6">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
    <div className="min-w-0">
      <div className="text-white/50 text-sm mb-1">Kiválasztott utazás</div>

      <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
        {trip.title}
      </h3>

      <div className="flex flex-wrap gap-2 mt-4">
        <SummaryChip label="Időpont" value={selectedDate.label} />
        <SummaryChip label="Státusz" value={selectedDate.status} />
        <SummaryChip
          label="Szabad hely"
          value={
            priceBox?.availableSeats !== null &&
            priceBox?.availableSeats !== undefined
              ? `Még ${priceBox.availableSeats} szabad hely`
              : selectedDate.seatsLeft !== null &&
                  selectedDate.seatsLeft !== undefined
                ? `Még ${selectedDate.seatsLeft} szabad hely`
                : null
          }
        />
        <SummaryChip label="Ellátás" value={trip.meals || null} />
        <SummaryChip label="Szállás" value={trip.hotel || null} />
      </div>
    </div>

    <div className="lg:text-right shrink-0">
      <div className="text-white/50 text-sm mb-1">Teljes összeg</div>

      <div className="text-4xl md:text-5xl font-extrabold text-[#00c389] whitespace-nowrap">
        {priceBox?.displayedPrice}
      </div>
    </div>
  </div>
</div>
        </div>
      </div>
    </section>
  );
}

function SummaryMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
      <div className="text-white/45 text-xs mb-1">{label}</div>

      <div className="text-white font-bold text-sm leading-tight">{value}</div>
    </div>
  );
}

function StepPanel({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5">
        <h3 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-gray-500 text-base leading-relaxed">{text}</p>
      </div>

      {children}
    </div>
  );
}

function StepTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-8">
      <h3 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-gray-500 text-lg leading-relaxed">{text}</p>
    </div>
  );
}

function FormInput({
  label,
  type = "text",
  value,
  onChange,
  error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const fieldClassName = `w-full rounded-2xl border px-5 outline-none focus:ring-4 transition-all ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#00c389] focus:ring-[#00c389]/10"
  }`;

  return (
    <label className="block">
      <span className="block text-sm font-bold text-[#0f172a] mb-2">{label}</span>

      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className={`${fieldClassName} py-3`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldClassName} h-14`}
        />
      )}

      {error ? <span className="mt-1.5 block text-sm font-medium text-red-500">{error}</span> : null}
    </label>
  );
}

function FormReadonly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f5f9fc] p-5 border border-gray-100">
      <div className="text-gray-500 text-sm mb-1">{label}</div>
      <div className="text-[#0f172a] font-bold leading-tight">{value}</div>
    </div>
  );
}

function CheckboxCard({
  title,
  text,
  price,
}: {
  title: string;
  text: string;
  price: string;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 p-5 cursor-pointer hover:border-[#00c389]/40 hover:bg-[#00c389]/5 transition-all">
      <div className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 accent-[#00c389]" />

        <div>
          <div className="font-bold text-[#0f172a] mb-1">{title}</div>
          <div className="text-gray-500 text-sm">{text}</div>
        </div>
      </div>

      <div className="text-[#00a878] font-bold whitespace-nowrap">{price}</div>
    </label>
  );
}

function PaymentOption({ title }: { title: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-gray-200 p-5 cursor-pointer hover:border-[#00c389]/40 hover:bg-[#00c389]/5 transition-all">
      <input type="radio" name="payment" className="accent-[#00c389]" />
      <span className="font-bold text-[#0f172a]">{title}</span>
    </label>
  );
}

function SummaryChip({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!hasText(value)) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/10 px-4 py-2">
      <span className="text-white/45 text-xs">{label}</span>
      <span className="text-white text-sm font-bold">{value}</span>
    </div>
  );
}
