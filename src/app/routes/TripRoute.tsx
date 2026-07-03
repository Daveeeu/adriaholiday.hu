import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import LoadingScreen from "../components/LoadingScreen";
import TripDetailPage from "../components/TripDetailPage";
import StaticPage from "./StaticPage";
import Seo from "../seo/Seo";
import {
  fetchPortfolioFeaturedTours,
  type PortfolioFeaturedTour,
} from "../content/portfolio-featured-tours-api";
import {
  fetchPortfolioOfferDetail,
  type PortfolioOfferDetail,
  type PortfolioOfferDetailDate,
} from "../content/portfolio-offer-detail-api";
import { useAnalytics } from "../analytics/useAnalytics";
import { absoluteUrl } from "../seo/site";

function formatCalendarDate(value?: string | null) {
  if (!value) {
    return "Érdeklődjön";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${year}.${month}.${day}.`;
}

function formatDateLabel(date: PortfolioOfferDetailDate) {
  if (!date.startDate) {
    return "Érdeklődjön";
  }

  if (!date.endDate) {
    return formatCalendarDate(date.startDate);
  }

  return `${formatCalendarDate(date.startDate)} - ${formatCalendarDate(date.endDate).slice(5)}`;
}

function mapOfferToTrip(offer: PortfolioOfferDetail) {
  const primaryImage = offer.image?.url || offer.sliderImage?.url || "";
  const priceBox = offer.priceBox ?? null;
  const dates = offer.dates.length > 0
    ? offer.dates.map((date, index) => ({
        id: String(date.id ?? `${offer.seoName}-date-${index + 1}`),
        label:
          date.startDate && date.endDate
            ? formatDateLabel(date)
            : offer.departureDateLabel || "Érdeklődjön",
        status:
          date.status === "available"
            ? "Elérhető"
            : date.status === "sold_out"
              ? "Betelt"
              : date.status === "cancelled"
                ? "Törölve"
                : "Tervezett",
        seatsLeft: offer.seatsLeft ?? null,
        price: date.priceBox?.price ?? date.price ?? offer.priceBox?.price ?? offer.price ?? null,
        displayedPrice: date.priceBox?.displayedPrice ?? null,
        priceBox: date.priceBox ?? null,
      }))
    : [
        {
          id: "default",
          label: offer.departureDateLabel || "Érdeklődjön",
          status: "Elérhető",
          seatsLeft: offer.seatsLeft ?? null,
          price: offer.priceBox?.price ?? offer.price ?? null,
          displayedPrice: priceBox?.displayedPrice ?? null,
          priceBox,
        },
      ];

  return {
    slug: offer.seoName,
    title: offer.name,
    country: offer.country ?? offer.region?.name ?? "Utazás",
    departure: offer.departureDateLabel || dates[0]?.label || "Érdeklődjön",
    transport: offer.transport === "plane" ? "plane" : "bus",
    hotel: offer.accommodation || "Információ később",
    meals: offer.meals || "Információ később",
    price: priceBox?.displayedPrice ?? null,
    priceNumber: priceBox?.price ?? offer.price ?? null,
    tags: [],
    image: primaryImage,
    badge: offer.badge || undefined,
    duration: offer.duration || "Többnapos út",
    seatsLeft: offer.seatsLeft ?? undefined,
    guaranteed: dates[0]?.status === "Elérhető",
    additionalDates: offer.additionalDates,
    shortDescription: offer.shortDescription,
    dateOptions: dates,
    programBefore: offer.programBefore,
    program: offer.program,
    inclusions: offer.inclusions,
    paymentProgram: offer.paymentProgram,
    prices: offer.prices,
    discounts: offer.discounts,
    notes: offer.notes,
    programDays: offer.programDays ?? [],
    galleryTitle: offer.galleryTitle ?? null,
    gallerySubtitle: offer.gallerySubtitle ?? null,
    gallery: offer.gallery ?? [],
    priceInformation: offer.priceInformation,
    priceBox,
  };
}

export default function TripRoute() {
  const navigate = useNavigate();
  const { offerSlug } = useParams();
  const { trackEvent } = useAnalytics();
  const [offer, setOffer] = useState<ReturnType<typeof mapOfferToTrip> | null>(null);
  const [relatedTrips, setRelatedTrips] = useState<PortfolioFeaturedTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!offerSlug) {
        setOffer(null);
        setRelatedTrips([]);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(false);
      setNotFound(false);

      const [offerResult, relatedResult] = await Promise.allSettled([
        fetchPortfolioOfferDetail(offerSlug),
        fetchPortfolioFeaturedTours(6),
      ]);

      if (cancelled) {
        return;
      }

      if (offerResult.status === "fulfilled") {
        setOffer(mapOfferToTrip(offerResult.value));
      } else {
        setOffer(null);
        setNotFound(
          offerResult.reason?.status === 404 ||
            offerResult.reason?.status === "404",
        );
        setError(offerResult.reason?.status !== 404 && offerResult.reason?.status !== "404");
      }

      if (relatedResult.status === "fulfilled") {
        setRelatedTrips(
          (relatedResult.value.items ?? []).filter(
            (item) => item.seoName !== offerSlug,
          ),
        );
      } else {
        setRelatedTrips([]);
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [offerSlug]);

  useEffect(() => {
    if (!offer) {
      return;
    }

    trackEvent("offer_view", {
      entity: {
        type: "tour",
        slug: offer.slug,
      },
      metadata: {
        title: offer.title,
        country: offer.country,
        price: offer.priceNumber,
      },
    });
  }, [offer, trackEvent]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (notFound || !offer) {
    return (
      <StaticPage title="Az ajánlat nem található" noIndex canonicalPath={`/ajanlat/${offerSlug ?? ""}`}>
        <p>A keresett ajánlat nem létezik vagy már nem elérhető.</p>
      </StaticPage>
    );
  }

  if (error) {
    return (
      <StaticPage title="Nem sikerült betölteni az ajánlatot" noIndex canonicalPath={`/ajanlat/${offerSlug ?? ""}`}>
        <p>Az ajánlat adatainak betöltése közben hiba történt.</p>
      </StaticPage>
    );
  }

  return (
    <>
      <Seo
        title={offer.title}
        description={
          offer.shortDescription ??
          `${offer.country} | ${offer.duration ?? "Utazás"} | ${offer.price}`
        }
        canonicalPath={`/ajanlat/${offer.slug}`}
        ogImageUrl={offer.image}
        ogType="product"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Főoldal", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Utazások", item: absoluteUrl("/utazasok") },
              { "@type": "ListItem", position: 3, name: offer.title, item: absoluteUrl(`/ajanlat/${offer.slug}`) },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: offer.title,
            image: offer.image ? [offer.image] : [],
            description:
              offer.shortDescription ??
              `${offer.country} | ${offer.duration ?? "Utazás"} | ${offer.price}`,
            touristType: offer.transport ?? undefined,
            itinerary: offer.program ?? undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "HUF",
              price: offer.priceNumber ?? undefined,
              availability: "https://schema.org/InStock",
              url: absoluteUrl(`/ajanlat/${offer.slug}`),
            },
          },
        ]}
      />
      <TripDetailPage
        trip={offer}
        relatedTrips={relatedTrips}
        onBack={() => {
          trackEvent("cta_click", {
            entity: {
              type: "tour",
              slug: offer.slug,
            },
            metadata: {
              cta_name: "back_to_offers",
              placement: "offer_header",
            },
          });
          navigate(-1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </>
  );
}
