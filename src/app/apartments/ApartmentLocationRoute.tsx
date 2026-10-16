import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router";

import { isRichTextEmpty, sanitizeRichTextHtml } from "@/lib/rich-text";

import LoadingScreen from "../components/LoadingScreen";
import RichTextContent from "../components/RichTextContent";
import { usePortfolioResource } from "../hooks/usePortfolioResource";
import StaticPage from "../routes/StaticPage";
import Seo from "../seo/Seo";
import { absoluteUrl } from "../seo/site";
import ApartmentCard from "./ApartmentCard";
import ApartmentSearchPanel from "./ApartmentSearchPanel";
import { readSearch, readStay, toSearchParams } from "./apartment-search-params";
import { fetchApartmentLocation, fetchApartments } from "./apartments-api";

/** In-page anchors of the guide land below the sticky header. */
const GUIDE_CLASSES = "[&_[id]]:scroll-mt-28 prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl";

/**
 * A location's apartments (/apartmanok/veneto/bibione): its introduction,
 * the apartment search and the apartments found, then the location guide.
 */
export default function ApartmentLocationRoute() {
  const { areaSlug = "", locationSlug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const stay = useMemo(() => readStay(searchParams), [searchParams]);
  const search = useMemo(() => readSearch(searchParams), [searchParams]);
  const searchKey = searchParams.toString();

  const location = usePortfolioResource(`${areaSlug}/${locationSlug}`, () => fetchApartmentLocation(areaSlug, locationSlug));
  const apartments = usePortfolioResource(`${areaSlug}/${locationSlug}?${searchKey}`, () =>
    fetchApartments(areaSlug, locationSlug, search),
  );

  const canonicalPath = `/apartmanok/${areaSlug}/${locationSlug}`;

  if (location.status === "loading" && location.data === null) {
    return <LoadingScreen />;
  }

  if (location.status === "notFound" || location.status === "error" || location.data === null) {
    return (
      <StaticPage title="A helyszín nem található" noIndex canonicalPath={canonicalPath}>
        <p>A keresett helyszín apartmanjai jelenleg nem elérhetők.</p>
      </StaticPage>
    );
  }

  const place = location.data;
  const title = `${place.name} apartmanok`;
  const list = apartments.data;
  const totalPages = list ? Math.max(1, Math.ceil(list.totalCount / list.perPage)) : 1;
  const intro = isRichTextEmpty(place.description) ? "" : sanitizeRichTextHtml(place.description);
  const guide = isRichTextEmpty(place.guide) ? "" : sanitizeRichTextHtml(place.guide);

  function goToPage(page: number) {
    setSearchParams(toSearchParams(stay, { ...search, page }));
    document.getElementById("apartman-lista")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-[#f5f9fc]">
      <Seo
        title={place.seoTitle || title}
        description={place.seoDescription ?? `${title}: szálláshelyek és apartmanok az Adria Holiday kínálatában.`}
        canonicalPath={canonicalPath}
        robots={place.robots}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Főoldal", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: title, item: absoluteUrl(canonicalPath) },
          ],
        }}
      />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(0,195,137,0.28),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(22,184,255,0.24),transparent_30%),linear-gradient(145deg,#07111f,#0d2240_58%,#12315d)]">
        <div className="relative z-10 mx-auto max-w-[1400px] px-8 pb-28 pt-16 md:px-12 lg:px-20">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-white/75 transition-colors hover:text-white">
            <ArrowLeft className="size-4" />
            <span className="text-sm font-medium">Főoldal</span>
          </Link>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#7ff2ca] backdrop-blur-md">
            <MapPin className="size-4" />
            {[place.areaName, place.regionName].filter(Boolean).join(" · ")}
          </div>

          <h1 className="text-white" style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", fontWeight: 760, lineHeight: 1.02, letterSpacing: "-0.05em" }}>
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/74">
            Válogass {place.name} apartmanjai közül: add meg az időpontot és a létszámot, a foglalásodat kollégáink visszaigazolják.
          </p>
        </div>
      </section>

      <section className="relative z-10 -mt-16 pb-20">
        <div className="mx-auto max-w-[1400px] space-y-10 px-8 md:px-12 lg:px-20">
          <ApartmentSearchPanel
            key={searchKey}
            filters={place.filters}
            stay={stay}
            search={search}
            onSearch={(nextStay, nextSearch) => setSearchParams(toSearchParams(nextStay, nextSearch))}
          />

          {intro ? (
            <div className="rounded-[32px] border border-[#e7eef5] bg-white p-6 shadow-[0_12px_42px_rgba(15,23,42,0.05)] md:p-9">
              <RichTextContent html={intro} className="prose-h2:text-2xl" />
            </div>
          ) : null}

          <div id="apartman-lista" className="scroll-mt-28">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 text-sm font-bold tracking-[0.18em] text-[#00a878]">SZÁLLÁSOK</div>
                <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#0f172a] md:text-4xl">{title}</h2>
              </div>
              {list ? (
                <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm">
                  {list.totalCount} apartman
                </div>
              ) : null}
            </div>

            {apartments.status === "error" ? (
              <div className="rounded-[30px] border border-red-100 bg-red-50 p-8 text-center text-[#0f172a]">
                Az apartmanok betöltése nem sikerült. Kérjük, próbáld újra később.
              </div>
            ) : list === null ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-[460px] animate-pulse rounded-[28px] bg-white" />
                ))}
              </div>
            ) : list.items.length === 0 ? (
              <div className="rounded-[30px] border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
                Nincs a keresésnek megfelelő apartman. Próbáld kevesebb szűrővel.
              </div>
            ) : (
              <div className={`grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 ${apartments.status === "loading" ? "opacity-60" : ""}`}>
                {list.items.map((apartment) => (
                  <ApartmentCard key={apartment.id} apartment={apartment} stay={stay} />
                ))}
              </div>
            )}

            {list && totalPages > 1 ? (
              <nav aria-label="Oldalak" className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={list.page <= 1}
                  onClick={() => goToPage(list.page - 1)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#d9e7f0] bg-white px-5 py-3 font-semibold text-[#0f172a] disabled:opacity-40"
                >
                  <ArrowLeft className="size-4" />
                  Előző
                </button>
                <span className="px-2 text-sm font-medium text-gray-500">
                  {list.page}. oldal / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={list.page >= totalPages}
                  onClick={() => goToPage(list.page + 1)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#d9e7f0] bg-white px-5 py-3 font-semibold text-[#0f172a] disabled:opacity-40"
                >
                  Következő
                  <ArrowRight className="size-4" />
                </button>
              </nav>
            ) : null}
          </div>

          {guide ? (
            <article className="rounded-[32px] border border-[#e7eef5] bg-white p-6 shadow-[0_12px_42px_rgba(15,23,42,0.05)] md:p-10">
              <div className="mb-2 text-sm font-bold tracking-[0.18em] text-[#00a878]">HELYISMERTETŐ</div>
              <RichTextContent html={guide} className={GUIDE_CLASSES} />
            </article>
          ) : null}
        </div>
      </section>
    </div>
  );
}
