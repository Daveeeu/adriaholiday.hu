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

export default function HomeRoute() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
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

