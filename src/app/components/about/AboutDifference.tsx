import AboutItemGrid from "./AboutItemGrid";
import AboutSectionHeader from "./AboutSectionHeader";
import { aboutFallback } from "./about-content";

export default function AboutDifference() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <AboutSectionHeader
          eyebrow={{ fieldKey: "about.difference.eyebrow", fallback: aboutFallback.difference.eyebrow }}
          title={{ fieldKey: "about.difference.titleParts", fallbackParts: aboutFallback.difference.titleParts }}
          description={{ fieldKey: "about.difference.description", fallback: aboutFallback.difference.description }}
        />

        <div className="mt-14">
          <AboutItemGrid fieldKey="about.difference.pillars" fallback={aboutFallback.difference.pillars} numbered />
        </div>
      </div>
    </section>
  );
}
