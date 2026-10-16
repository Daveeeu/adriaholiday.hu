import { ArrowLeft, ChevronRight, Hash, MapPin, Users, Waves } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";

import LoadingScreen from "../components/LoadingScreen";
import OfferContentSection from "../components/OfferContentSection";
import OfferGallerySection from "../components/OfferGallerySection";
import TripSectionNav from "../components/TripSectionNav";
import { usePortfolioResource } from "../hooks/usePortfolioResource";
import { responsiveImage } from "../lib/responsiveImage";
import { tripSection } from "../lib/tripSection";
import StaticPage from "../routes/StaticPage";
import Seo from "../seo/Seo";
import ApartmentBookingForm from "./ApartmentBookingForm";
import ApartmentPriceTable from "./ApartmentPriceTable";
import ApartmentStars from "./ApartmentStars";
import { formatDistance } from "./apartment-format";
import { readStay } from "./apartment-search-params";
import { fetchApartment } from "./apartments-api";

const BOOKING_ID = "foglalas";

function scrollToBooking() {
  document.getElementById(BOOKING_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** An apartment's page (/apartman/{slug}) with its booking form. */
export default function ApartmentRoute() {
  const { apartmentSlug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const resource = usePortfolioResource(apartmentSlug, () => fetchApartment(apartmentSlug));
  const canonicalPath = `/apartman/${apartmentSlug}`;

  if (resource.status === "loading") {
    return <LoadingScreen />;
  }

  if (resource.status !== "ready") {
    return (
      <StaticPage title="Az apartman nem található" noIndex canonicalPath={canonicalPath}>
        <p>A keresett apartman jelenleg nem foglalható.</p>
      </StaticPage>
    );
  }

  const apartment = resource.data;
  const cover = apartment.gallery[0]?.image?.url ?? null;
  const facts = [
    { icon: <MapPin />, label: "Cím", value: apartment.address },
    { icon: <MapPin />, label: "Központtól", value: formatDistance(apartment.distanceToCenterM) },
    { icon: <Waves />, label: "Tengerparttól", value: formatDistance(apartment.distanceToSeaM) },
    { icon: <Users />, label: "Férőhely", value: apartment.maxGuests ? `max. ${apartment.maxGuests} fő` : null },
    { icon: <Hash />, label: "Kódszám", value: apartment.code },
  ].filter((fact) => fact.value);
  const information = [apartment.additionalInformation, apartment.allInclusiveDescription, apartment.location?.apartmentInformation]
    .filter(Boolean)
    .join("");

  return (
    <div className="min-h-screen bg-[#f5f9fc]">
      <Seo
        title={apartment.seoTitle || apartment.name}
        description={apartment.seoDescription ?? undefined}
        canonicalPath={apartment.link}
        robots={apartment.robots}
        ogImageUrl={cover ?? undefined}
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {cover ? <img {...responsiveImage(cover)} sizes="100vw" fetchPriority="high" alt={apartment.name} className="h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07111f]/80 via-[#07111f]/60 to-[#07111f]/90" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1500px] px-8 pb-20 pt-10 md:px-12 lg:px-20">
          <nav aria-label="Morzsamenü" className="mb-8 text-sm font-medium text-white/70">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link to="/" className="hover:text-white">Főoldal</Link></li>
              {apartment.location?.link ? (
                <>
                  <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
                  <li>
                    <Link to={apartment.location.link} className="inline-flex items-center gap-1.5 hover:text-white">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      {apartment.location.name} apartmanok
                    </Link>
                  </li>
                </>
              ) : null}
              <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
              <li aria-current="page" className="text-white">{apartment.name}</li>
            </ol>
          </nav>
          <ApartmentStars stars={apartment.stars} className="mb-4 text-[#f5b301]" />
          <h1 className="max-w-4xl text-white" style={{ fontSize: "clamp(2.25rem,4.5vw,4.25rem)", lineHeight: 1, fontWeight: 800, letterSpacing: "-0.05em" }}>
            {apartment.name}
          </h1>
          {apartment.location ? (
            <p className="mt-4 text-lg text-white/75">{[apartment.location.areaName, apartment.location.regionName].filter(Boolean).join(", ")}</p>
          ) : null}
          <div className="mt-10 grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <div className="mb-3 text-[#00c389] [&_svg]:h-5 [&_svg]:w-5">{fact.icon}</div>
                <div className="mb-1 text-sm text-white/60">{fact.label}</div>
                <div className="font-bold text-white">{fact.value}</div>
              </div>
            ))}
          </div>
          <button type="button" onClick={scrollToBooking} className="mt-8 inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-7 font-semibold text-white">
            Foglalás
          </button>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-8 md:px-12 lg:px-20">
          <OfferGallerySection title="Képek" gallery={apartment.gallery} />
          <TripSectionNav>
            <OfferContentSection title="Leírás" content={apartment.description} navLabel="Leírás" />
            <ApartmentPriceTable prices={apartment.prices} onBook={scrollToBooking} />
            <OfferContentSection title="Apartmantípus információk" content={apartment.apartmentTypeContent} navLabel="Típusok" />
            {apartment.services.length > 0 ? (
              <section className="mb-20" {...tripSection("Szolgáltatások")}>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-[#0f172a] md:text-4xl">Szolgáltatások</h2>
                <ul className="flex flex-wrap gap-2">
                  {apartment.services.map((service) => (
                    <li key={service.key} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#047857] shadow-sm">{service.label}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <OfferContentSection title="Információk" content={information} navLabel="Információk" />
            <div id={BOOKING_ID} className="mb-20 scroll-mt-28" {...tripSection("Foglalás")}>
              <ApartmentBookingForm apartment={apartment} stay={readStay(searchParams)} />
            </div>
          </TripSectionNav>
        </div>
      </section>
    </div>
  );
}
