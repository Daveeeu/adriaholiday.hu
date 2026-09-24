import { motion } from "motion/react";

import { EditableFrame } from "../../content/EditableFields";
import AboutSectionHeader from "./AboutSectionHeader";
import { aboutFallback, useContentList, type AboutStat } from "./about-content";

const STATS_KEY = "about.hero.stats";

export default function AboutHero() {
  const stats = useContentList<AboutStat>(STATS_KEY, aboutFallback.hero.stats);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7fbff] via-white to-white pb-16 pt-16 md:pt-24">
      <div className="absolute left-[6%] top-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#00c389]/12 to-transparent blur-3xl" />
      <div className="absolute right-[6%] top-24 h-[380px] w-[380px] rounded-full bg-gradient-to-bl from-[#16b8ff]/12 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <AboutSectionHeader
            as="h1"
            align="center"
            eyebrow={{ fieldKey: "about.hero.eyebrow", fallback: aboutFallback.hero.eyebrow }}
            title={{ fieldKey: "about.hero.titleParts", fallbackParts: aboutFallback.hero.titleParts }}
            description={{ fieldKey: "about.hero.lead", fallback: aboutFallback.hero.lead }}
          />
        </motion.div>

        <EditableFrame target={{ kind: "field", fieldKey: STATS_KEY }} className="mt-12 rounded-[28px]">
          <dl className="grid grid-cols-1 overflow-hidden rounded-[28px] border border-gray-100 bg-white/90 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={`${stat.label}-${index}`}
                className="flex flex-col items-center gap-1 border-b border-gray-100 px-6 py-7 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <dt className="order-2 text-sm text-gray-500">{stat.label}</dt>
                <dd className="order-1 bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </EditableFrame>
      </div>
    </section>
  );
}
