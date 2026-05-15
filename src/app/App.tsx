import CinematicHero from "./components/CinematicHero";
import TrustSection from "./components/TrustSection";
import Footer from "./components/Footer";
import MobileNav from "./components/MobileNav";
import CursorGlow from "./components/CursorGlow";
import FAQ from "./components/FAQ";
import Newsletter from "./components/Newsletter";
import ScrollProgress from "./components/ScrollProgress";
import TravelCategories from "./components/TravelCategories";
import FeaturedOffers from "./components/FeaturedOffers";
import TravelBlog from "./components/TravelBlog";
import ExperienceSection from "./components/ExperienceSection";
import WhyChooseUs from "./components/WhyChooseUs";
import HowItWorks from "./components/HowItWorks";
import LiveActivity from "./components/LiveActivity";
import StickyMobileCTA from "./components/StickyMobileCTA";
import FloatingParticles from "./components/FloatingParticles";
import EmotionalStory from "./components/EmotionalStory";
import SectionDivider from "./components/SectionDivider";
import AmbientBackground from "./components/AmbientBackground";

export default function App() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <AmbientBackground />
      <FloatingParticles />
      <ScrollProgress />
      <CursorGlow />
      <MobileNav />
      <CinematicHero />
      <SectionDivider variant="subtle" />
      <TravelCategories />
      <SectionDivider variant="subtle" />
      <FeaturedOffers />
      <EmotionalStory />
      <SectionDivider variant="subtle" />
      <ExperienceSection />
      <SectionDivider variant="subtle" />
      <WhyChooseUs />
      <SectionDivider variant="subtle" />
      <TravelBlog />
      <SectionDivider variant="gradient" />
      <HowItWorks />
      <SectionDivider variant="subtle" />
      <TrustSection />
      <SectionDivider variant="subtle" />
      <FAQ />
      <Newsletter />
      <Footer />
      <LiveActivity />
      <StickyMobileCTA />
    </div>
  );
}