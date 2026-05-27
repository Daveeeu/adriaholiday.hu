import AmbientBackground from "../components/AmbientBackground";
import CinematicHero from "../components/CinematicHero";
import CursorGlow from "../components/CursorGlow";
import EmotionalStory from "../components/EmotionalStory";
import ExperienceSection from "../components/ExperienceSection";
import FAQ from "../components/FAQ";
import FloatingParticles from "../components/FloatingParticles";
import HowItWorks from "../components/HowItWorks";
import Newsletter from "../components/Newsletter";
import ScrollProgress from "../components/ScrollProgress";
import StickyMobileCTA from "../components/StickyMobileCTA";
import TravelBlog from "../components/TravelBlog";
import TravelCategories from "../components/TravelCategories";
import TrustSection from "../components/TrustSection";
import WhyChooseUs from "../components/WhyChooseUs";
import FeaturedOffers from "../components/FeaturedOffers";
import { useNavigate } from "react-router";
import Seo from "../seo/Seo";
import { useEffect } from "react";

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
            name: "Adria Holiday",
            url: "https://adriaholiday.hu/",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Adria Holiday",
            url: "https://adriaholiday.hu/",
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
        <TravelCategories
          onCategorySelect={(categorySlug) => {
            navigate(`/kategoriak/${categorySlug}`);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </section>

      <section className="ah-snap-section">
        <FeaturedOffers />
      </section>
      <section className="ah-snap-section">
        <EmotionalStory />
      </section>
      <section className="ah-snap-section">
        <ExperienceSection />
      </section>
      <section className="ah-snap-section">
        <WhyChooseUs />
      </section>
      <section className="ah-snap-section">
        <TravelBlog />
      </section>
      <section className="ah-snap-section">
        <HowItWorks />
      </section>
      <section className="ah-snap-section">
        <TrustSection />
      </section>
      <section className="ah-snap-section">
        <FAQ />
      </section>
      <section className="ah-snap-section">
        <Newsletter />
      </section>
      <StickyMobileCTA />
    </div>
  );
}
