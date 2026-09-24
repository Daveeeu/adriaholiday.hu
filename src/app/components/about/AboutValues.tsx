import { ArrowRight } from "lucide-react";

import { EditableButton } from "../../content/EditableFields";
import { usePortfolioContent } from "../../content/PortfolioContentProvider";
import AboutItemGrid from "./AboutItemGrid";
import AboutSectionHeader from "./AboutSectionHeader";
import { aboutFallback } from "./about-content";

export default function AboutValues() {
  const { getValue } = usePortfolioContent();
  const ctaLabel = String(getValue("about.cta.label", aboutFallback.values.ctaLabel));

  return (
    <section className="bg-gradient-to-b from-white to-[#f7fbff] pb-24 pt-16 md:pt-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <AboutSectionHeader
          align="center"
          title={{ fieldKey: "about.values.titleParts", fallbackParts: aboutFallback.values.titleParts }}
        />

        <div className="mt-10">
          <AboutItemGrid fieldKey="about.values.items" fallback={aboutFallback.values.items} />
        </div>

        <div className="mt-12 flex justify-center">
          <EditableButton
            fieldKey="about.cta.url"
            labelKey="about.cta.label"
            fallback={aboutFallback.values.ctaLabel}
            hrefFallback={aboutFallback.values.ctaUrl}
            className="rounded-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-7 py-3.5 font-semibold text-white shadow-[0_16px_40px_rgba(0,195,137,0.25)] transition-transform hover:scale-[1.02]">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </span>
          </EditableButton>
        </div>
      </div>
    </section>
  );
}
