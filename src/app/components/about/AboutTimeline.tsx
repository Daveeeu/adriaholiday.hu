import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

import { EditableFrame } from "../../content/EditableFields";
import AboutSectionHeader from "./AboutSectionHeader";
import { aboutFallback, useContentList, type AboutMilestone } from "./about-content";

const ITEMS_KEY = "about.timeline.items";

/** The agency's story as milestones along a line that fills up while scrolling. */
export default function AboutTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const milestones = useContentList<AboutMilestone>(ITEMS_KEY, aboutFallback.timeline.items);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section className="relative overflow-hidden bg-[#071321] py-24 md:py-32">
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#00c389]/10 blur-[140px]" />

      <div className="relative mx-auto max-w-5xl px-6 md:px-10">
        <AboutSectionHeader
          align="center"
          tone="dark"
          eyebrow={{ fieldKey: "about.timeline.eyebrow", fallback: aboutFallback.timeline.eyebrow }}
          title={{ fieldKey: "about.timeline.titleParts", fallbackParts: aboutFallback.timeline.titleParts }}
        />

        <EditableFrame target={{ kind: "field", fieldKey: ITEMS_KEY }} className="mt-16 rounded-[28px]">
          <div ref={ref} className="relative">
            <div className="absolute bottom-0 left-[19px] top-0 w-px bg-white/10 md:left-1/2" />
            <motion.div
              style={{ scaleY: progress }}
              className="absolute bottom-0 left-[19px] top-0 w-px origin-top bg-gradient-to-b from-[#34d399] to-[#38bdf8] md:left-1/2"
            />

            <ol className="space-y-14 md:space-y-20">
              {milestones.map((milestone, index) => {
                const isRight = index % 2 === 1;

                return (
                  <motion.li
                    key={`${milestone.year}-${index}`}
                    className="relative grid grid-cols-[40px_1fr] gap-6 md:grid-cols-2 md:gap-16"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="absolute left-[11px] top-2 h-4 w-4 rounded-full border-4 border-[#071321] bg-gradient-to-br from-[#34d399] to-[#38bdf8] shadow-[0_0_24px_rgba(52,211,153,0.6)] md:left-1/2 md:-translate-x-1/2" />

                    <div className={`col-start-2 ${isRight ? "md:col-start-2" : "md:col-start-1 md:text-right"}`}>
                      <p className="bg-gradient-to-r from-[#34d399] to-[#38bdf8] bg-clip-text text-sm font-bold uppercase tracking-[0.2em] text-transparent">
                        {milestone.year}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">{milestone.title}</h3>
                      <p className="mt-3 leading-relaxed text-slate-300">{milestone.description}</p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </EditableFrame>
      </div>
    </section>
  );
}
