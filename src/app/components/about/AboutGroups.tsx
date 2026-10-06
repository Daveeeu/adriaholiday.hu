import { motion } from "motion/react";
import { ArrowRight, Building2 } from "lucide-react";

import { EditableButton } from "../../content/EditableFields";
import { usePortfolioContent } from "../../content/PortfolioContentProvider";
import AboutSectionHeader from "./AboutSectionHeader";
import { aboutFallback } from "./about-content";

/** Corporate and group trips, with a quote request button. */
export default function AboutGroups() {
  const { getValue } = usePortfolioContent();
  const ctaLabel = String(getValue("about.groups.cta.label", aboutFallback.groups.ctaLabel));

  return (
    <section className="bg-white px-4 py-16 md:px-8 md:py-24">
      <motion.div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-[#071321] px-8 py-14 md:px-16 md:py-20"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#00c389]/25 blur-[100px]" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-[#16b8ff]/20 blur-[100px]" />
        <Building2 aria-hidden="true" className="absolute -right-6 -top-6 h-64 w-64 text-white/5" />

        <div className="relative grid gap-10 md:grid-cols-[1.4fr_auto] md:items-end">
          <AboutSectionHeader
              tone="dark"
              eyebrow={{ fieldKey: "about.groups.eyebrow", fallback: aboutFallback.groups.eyebrow }}
              title={{ fieldKey: "about.groups.titleParts", fallbackParts: aboutFallback.groups.titleParts }}
              description={{ fieldKey: "about.groups.description", fallback: aboutFallback.groups.description }}
            />

          <EditableButton
            fieldKey="about.groups.cta.url"
            labelKey="about.groups.cta.label"
            fallback={aboutFallback.groups.ctaLabel}
            hrefFallback={aboutFallback.groups.ctaUrl}
            className="rounded-2xl"
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-7 py-4 font-semibold text-white shadow-[0_16px_40px_rgba(0,195,137,0.3)] transition-transform hover:scale-[1.03]">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </span>
          </EditableButton>
        </div>
      </motion.div>
    </section>
  );
}
