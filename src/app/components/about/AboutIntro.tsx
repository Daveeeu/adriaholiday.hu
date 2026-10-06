import { motion } from "motion/react";

import { EditableText } from "../../content/EditableFields";
import { aboutFallback } from "./about-content";

/** The agency's principle in one big sentence, then what it means in practice. */
export default function AboutIntro() {
  return (
    <section className="relative bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.3fr_1fr] md:items-end md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span aria-hidden="true" className="block text-[7rem] font-black leading-[0.6] text-[#00c389]/20">
            „
          </span>
          <EditableText
            fieldKey="about.intro.statement"
            fallback={aboutFallback.intro.statement}
            as="p"
            className="text-[clamp(2rem,4.2vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#0f172a]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="border-l-2 border-[#00c389] pl-6"
        >
          <EditableText
            fieldKey="about.intro.text"
            fallback={aboutFallback.intro.text}
            as="p"
            className="text-lg leading-relaxed text-gray-600"
          />
        </motion.div>
      </div>
    </section>
  );
}
