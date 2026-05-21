import { useState } from "react";

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
import StickyMobileCTA from "./components/StickyMobileCTA";
import FloatingParticles from "./components/FloatingParticles";
import EmotionalStory from "./components/EmotionalStory";
import AmbientBackground from "./components/AmbientBackground";

import CategoryOffersPage from "./components/CategoryOffersPage";
import TripDetailPage from "./components/TripDetailPage";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);

  if (selectedTrip) {
    return (
      <TripDetailPage
        trip={selectedTrip}
        onBack={() => {
          setSelectedTrip(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  if (selectedCategory) {
    return (
      <CategoryOffersPage
        category={selectedCategory}
        onBack={() => {
          setSelectedCategory(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOfferSelect={(offer) => {
          setSelectedTrip(offer);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <AmbientBackground />
      <FloatingParticles />
      <ScrollProgress />
      <CursorGlow />

      <MobileNav />
      <CinematicHero />

      <TravelCategories
        onCategorySelect={(category) => {
          setSelectedCategory(category);
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
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}