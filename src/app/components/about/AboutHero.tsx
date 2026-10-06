import { motion, useScroll, useTransform } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

import { EditableFrame, EditableOptionalImage } from "../../content/EditableFields";
import { usePortfolioContent } from "../../content/PortfolioContentProvider";
import AboutSectionHeader from "./AboutSectionHeader";
import { aboutFallback, useContentList, type AboutStat } from "./about-content";

const STATS_KEY = "about.hero.stats";
const IMAGE_KEY = "about.hero.image";

/**
 * Full-height dark opening: the headline over the (optional, admin-uploaded) hero
 * photo with a slow parallax, and the key numbers.
 */
export default function AboutHero() {
  const ref = useRef<HTMLElement>(null);
  const { getValue, isEditorEnabled } = usePortfolioContent();
  const stats = useContentList<AboutStat>(STATS_KEY, aboutFallback.hero.stats);
  const image = getValue(IMAGE_KEY, null) as { url?: string; alt?: string } | null;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#071321] pb-16 pt-32">
      {image?.url ? (
        <motion.img
          src={image.url}
          alt={image.alt ?? ""}
          style={{ y: imageY }}
          className="absolute inset-0 h-[118%] w-full object-cover opacity-45"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071321]/70 via-[#071321]/55 to-[#071321]" />
      <div className="absolute -left-40 top-10 h-[520px] w-[520px] rounded-full bg-[#00c389]/20 blur-[120px]" />
      <div className="absolute -right-32 bottom-0 h-[460px] w-[460px] rounded-full bg-[#16b8ff]/20 blur-[120px]" />

      {isEditorEnabled ? (
        <div className="absolute right-6 top-28 z-10 w-56">
          <EditableOptionalImage
            fieldKey={IMAGE_KEY}
            placeholderLabel="Háttérkép feltöltése"
            imgClassName="h-32 w-full rounded-2xl object-cover"
          />
        </div>
      ) : null}

      <motion.div style={{ opacity: contentOpacity }} className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <AboutSectionHeader
            as="h1"
            tone="dark"
            eyebrow={{ fieldKey: "about.hero.eyebrow", fallback: aboutFallback.hero.eyebrow }}
            title={{ fieldKey: "about.hero.titleParts", fallbackParts: aboutFallback.hero.titleParts }}
            description={{ fieldKey: "about.hero.lead", fallback: aboutFallback.hero.lead }}
          />
        </motion.div>

        <EditableFrame target={{ kind: "field", fieldKey: STATS_KEY }} className="mt-14 rounded-[28px]">
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 backdrop-blur-md sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={`${stat.label}-${index}`}
                className="flex flex-col gap-1 bg-[#071321]/60 px-7 py-7"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <dt className="order-2 text-sm text-slate-300">{stat.label}</dt>
                <dd className="order-1 bg-gradient-to-r from-[#34d399] to-[#38bdf8] bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </EditableFrame>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="h-7 w-7" />
      </motion.div>
    </section>
  );
}
