import AboutItemGrid from "./AboutItemGrid";
import { aboutFallback } from "./about-content";

export default function AboutStory() {
  return (
    <section className="bg-gradient-to-b from-white via-[#f5fffb] to-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <AboutItemGrid fieldKey="about.story.highlights" fallback={aboutFallback.story.highlights} variant="plain" />
      </div>
    </section>
  );
}
