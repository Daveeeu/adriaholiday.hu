import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import LoadingScreen from "../components/LoadingScreen";
import StaticPage from "./StaticPage";
import Seo from "../seo/Seo";
import { absoluteUrl } from "../seo/site";
import { fetchPortfolioRegionDetail, type PortfolioRegionCard } from "../content/portfolio-regions-api";
import { fetchPortfolioRegionOffers, type PortfolioOfferCard } from "../content/portfolio-offers-api";
import { toUnifiedOfferCardModel } from "../content/portfolio-offer-card-model";

function OfferCard({
  offer,
  onSelect,
}: {
  offer: PortfolioOfferCard;
  onSelect: (slug: string) => void;
}) {
  const card = toUnifiedOfferCardModel(offer);

  return (
    <button
      type="button"
      onClick={() => onSelect(offer.seoName)}
      className="group overflow-hidden rounded-[28px] border border-gray-100 bg-white text-left shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.1)]"
    >
      <div className="relative h-64 overflow-hidden">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#dff8ef] to-[#e5f4ff]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/78 via-[#071426]/22 to-transparent" />
      </div>
      <div className="space-y-3 p-6">
        <div className="text-sm font-bold tracking-[0.18em] text-[#00a878]">{card.transportLabel ?? "UTAZÁS"}</div>
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#0f172a]">{card.title}</h2>
        <p className="line-clamp-3 text-sm leading-7 text-gray-600">{offer.shortDescription}</p>
        <div className="flex items-center justify-between gap-4 pt-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Induló ár</div>
            <div className="text-lg font-bold text-[#0f172a]">{card.priceText ?? "Érdeklődjön"}</div>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#00a878]">
            Részletek
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </button>
  );
}

export default function RegionRoute() {
  const navigate = useNavigate();
  const { regionSlug } = useParams();
  const [region, setRegion] = useState<PortfolioRegionCard | null>(null);
  const [offers, setOffers] = useState<PortfolioOfferCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!regionSlug) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setNotFound(false);
      setHasError(false);

      const [regionResult, offersResult] = await Promise.allSettled([
        fetchPortfolioRegionDetail(regionSlug),
        fetchPortfolioRegionOffers(regionSlug, { perPage: 24 }),
      ]);

      if (cancelled) {
        return;
      }

      if (regionResult.status === "fulfilled") {
        setRegion(regionResult.value);
      } else {
        setRegion(null);
        setNotFound(regionResult.reason?.status === 404 || regionResult.reason?.status === "404");
        setHasError(regionResult.reason?.status !== 404 && regionResult.reason?.status !== "404");
      }

      if (offersResult.status === "fulfilled") {
        setOffers(offersResult.value.items ?? []);
      } else {
        setOffers([]);
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [regionSlug]);

  const canonicalPath = regionSlug ? `/regiok/${regionSlug}` : "/utazasok";
  const breadcrumbJsonLd = useMemo(() => {
    if (!region) {
      return null;
    }

    return [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: region.name,
        description: region.description ?? `${region.name} ajánlatok és régiós inspirációk.`,
        url: absoluteUrl(canonicalPath),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Főoldal", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Régiók", item: absoluteUrl("/utazasok") },
          { "@type": "ListItem", position: 3, name: region.name, item: absoluteUrl(canonicalPath) },
        ],
      },
    ];
  }, [canonicalPath, region]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (notFound || !region) {
    return (
      <StaticPage title="A régió nem található" noIndex canonicalPath={canonicalPath}>
        <p>A keresett régió nem elérhető vagy már nem publikus.</p>
      </StaticPage>
    );
  }

  if (hasError) {
    return (
      <StaticPage title="Nem sikerült betölteni a régiót" noIndex canonicalPath={canonicalPath}>
        <p>A régió adatainak betöltése közben hiba történt.</p>
      </StaticPage>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f9fc]">
      <Seo
        title={region.name}
        description={region.description ?? `${region.name} utazási ajánlatok és régiós inspirációk.`}
        canonicalPath={canonicalPath}
        ogImageUrl={region.image ?? undefined}
        jsonLd={breadcrumbJsonLd ?? undefined}
      />

      <section className="relative h-[480px] overflow-hidden">
        {region.image ? (
          <img src={region.image} alt={region.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/90 via-[#07111f]/56 to-[#07111f]/22" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] items-end px-8 pb-16 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            <button
              type="button"
              onClick={() => navigate("/utazasok")}
              className="mb-8 flex items-center gap-2 text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              <span className="text-sm font-medium">Vissza az utazásokhoz</span>
            </button>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-bold text-[#7ff2ca] backdrop-blur-md">
              <MapPin className="size-4" />
              RÉGIÓ
            </div>

            <h1 className="text-white" style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", fontWeight: 760, lineHeight: 1.02, letterSpacing: "-0.05em" }}>
              {region.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/74">
              {region.description || "Fedezd fel az adott régió elérhető ajánlatait és inspirációit."}
            </p>
          </div>
        </div>
      </section>

      <section className="-mt-10 pb-20">
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 lg:px-20">
          <div className="mb-8 rounded-[32px] border border-white/70 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 text-sm font-bold tracking-[0.18em] text-[#00a878]">AJÁNLATOK</div>
                <h2 className="text-4xl font-bold tracking-[-0.04em] text-[#0f172a]">{region.name} utazások</h2>
              </div>
              <div className="rounded-full bg-[#f3fbff] px-4 py-2 text-sm font-medium text-gray-500 shadow-sm">
                {offers.length} elérhető ajánlat
              </div>
            </div>

            {region.fullDescription ? (
              <p className="mt-5 max-w-4xl text-base leading-8 text-[#475569]">{region.fullDescription}</p>
            ) : null}
          </div>

          {offers.length === 0 ? (
            <div className="rounded-[30px] border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
              Jelenleg nincs publikus, aktív ajánlat ehhez a régióhoz.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onSelect={(slug) => {
                    navigate(`/ajanlat/${slug}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          )}

          <div className="mt-12">
            <Link
              to="/utazasok"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#d9e7f0] bg-white px-6 py-3 font-semibold text-[#0f172a]"
            >
              <ArrowLeft className="size-4" />
              Vissza az utazásokhoz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
