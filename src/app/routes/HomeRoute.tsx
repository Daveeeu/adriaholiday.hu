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

      <CinematicHero />

      <TravelCategories
        onCategorySelect={(categorySlug) => {
          navigate(`/kategoriak/${categorySlug}`);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <FeaturedOffers />
      <EmotionalStory />
      <ExperienceSection />
      <WhyChooseUs />
      <TravelBlog />
      <HowItWorks />
      <TrustSection />
      <FAQ />
      <Newsletter />
      <StickyMobileCTA />
    </div>
  );
}
