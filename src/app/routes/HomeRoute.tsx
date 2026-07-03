import AmbientBackground from "../components/AmbientBackground";
import CinematicHero from "../components/CinematicHero";
import CursorGlow from "../components/CursorGlow";
import FloatingParticles from "../components/FloatingParticles";
import ScrollProgress from "../components/ScrollProgress";
import StickyMobileCTA from "../components/StickyMobileCTA";
import { useNavigate } from "react-router";
import Seo from "../seo/Seo";
import { Suspense, lazy, useEffect } from "react";
import { resolveCategorySlugFromOfferLink } from "../content/portfolio-offer-routing";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";
import { absoluteUrl } from "../seo/site";

const EmotionalStory = lazy(() => import("../components/EmotionalStory"));
const ExperienceSection = lazy(() => import("../components/ExperienceSection"));
const FAQ = lazy(() => import("../components/FAQ"));
const HowItWorks = lazy(() => import("../components/HowItWorks"));
const Newsletter = lazy(() => import("../components/Newsletter"));
const TravelBlog = lazy(() => import("../components/TravelBlog"));
const TravelCategories = lazy(() => import("../components/TravelCategories"));
const TrustSection = lazy(() => import("../components/TrustSection"));
const WhyChooseUs = lazy(() => import("../components/WhyChooseUs"));
const FeaturedOffers = lazy(() => import("../components/FeaturedOffers"));

function SectionFallback({ minHeight = "min-h-[320px]" }: { minHeight?: string }) {
  return (
    <div className={`flex ${minHeight} items-center justify-center`}>
      <div className="h-14 w-14 rounded-full border border-[#00c389]/20 border-t-[#00c389] border-r-[#16b8ff] animate-spin" />
    </div>
  );
}

export default function HomeRoute({
  canonicalPath = "/",
  title = "Prémium utazások",
  description = "Prémium buszos és repülős utazások Európa legszebb úti céljaihoz.",
}: {
  canonicalPath?: string;
  title?: string;
  description?: string;
}) {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  useEffect(() => {
    document.documentElement.classList.add("ah-snap");
    document.body.classList.add("ah-snap");
    return () => {
      document.documentElement.classList.remove("ah-snap");
      document.body.classList.remove("ah-snap");
    };
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Seo
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: settings.siteName || "Adria Holiday",
            url: absoluteUrl("/"),
            email: settings.email || undefined,
            telephone: settings.phone || undefined,
            address: settings.address || undefined,
            sameAs: [settings.facebook, settings.instagram, settings.tiktok].filter(Boolean),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: settings.siteName || "Adria Holiday",
            url: absoluteUrl("/"),
          },
        ]}
      />
      <h1 className="sr-only">
        Adria Holiday – Prémium buszos és repülős utazások
      </h1>
      <AmbientBackground />
      <FloatingParticles />
      <ScrollProgress />
      <CursorGlow />

      <section className="ah-snap-section">
        <CinematicHero />
      </section>

      <section className="ah-snap-section">
        <Suspense fallback={<SectionFallback />}>
          <TravelCategories
            onCategorySelect={(categorySlug) => {
              navigate(`/kategoriak/${resolveCategorySlugFromOfferLink(categorySlug)}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </Suspense>
      </section>

      <section className="ah-snap-section">
        <Suspense fallback={<SectionFallback />}>
          <FeaturedOffers />
        </Suspense>
      </section>
      <section className="ah-snap-section">
        <Suspense fallback={<SectionFallback />}>
          <EmotionalStory />
        </Suspense>
      </section>
      <section className="ah-snap-section">
        <Suspense fallback={<SectionFallback />}>
          <ExperienceSection />
        </Suspense>
      </section>
      <section className="ah-snap-section">
        <Suspense fallback={<SectionFallback />}>
          <WhyChooseUs />
        </Suspense>
      </section>
      <section className="ah-snap-section">
        <Suspense fallback={<SectionFallback />}>
          <TravelBlog />
        </Suspense>
      </section>
      <section className="ah-snap-section">
        <Suspense fallback={<SectionFallback />}>
          <HowItWorks />
        </Suspense>
      </section>
      <section className="ah-snap-section">
        <Suspense fallback={<SectionFallback />}>
          <TrustSection />
        </Suspense>
      </section>
      <section className="ah-snap-section">
        <Suspense fallback={<SectionFallback minHeight="min-h-[240px]" />}>
          <FAQ />
        </Suspense>
      </section>
      <section className="ah-snap-section">
        <Suspense fallback={<SectionFallback minHeight="min-h-[280px]" />}>
          <Newsletter />
        </Suspense>
      </section>
      <StickyMobileCTA />
    </div>
  );
}
