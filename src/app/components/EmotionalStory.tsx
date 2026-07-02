import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { usePortfolioContent } from "../content/PortfolioContentProvider";
import { EditableMedia } from "../content/EditableFields";
import { EditablePortfolioHeading } from "../content/PortfolioHeading";

export default function EmotionalStory() {
  const { getValue } = usePortfolioContent();
  const sectionRef = useRef<HTMLDivElement>(null);

  const image = getValue("home.story.image", {
    url: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=2200&q=90",
    alt: "Travel memories",
  }) as { url?: string; alt?: string };
  const description = String(
    getValue(
      "home.story.description",
      "Nem csak úti célokat mutatunk meg. Élményeket adunk, amelyek évekkel később is veled maradnak.",
    ),
  );
  const ctaLabel = String(
    getValue("home.story.cta.label", "Fedezd fel az utakat"),
  );
  const quote = String(
    getValue("home.story.quote", "15 éve teremtünk felejthetetlen pillanatokat"),
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-[68vh] min-h-[540px] overflow-hidden"
    >
    

      {/* Background Image */}
      <motion.div
        className="absolute inset-0"
      >
        <EditableMedia
          fieldKey="home.story.image"
          fallback={{
            url: image.url ?? "",
            alt: image.alt ?? "Travel memories",
            title: image.alt ?? "Travel memories",
          }}
          className="w-full h-full"
          mediaClassName="w-full h-full object-cover"
        />

        {/* Main dark cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08111f]/90 via-[#08111f]/55 to-[#08111f]/40" />

        {/* Side vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08111f]/70 via-transparent to-[#08111f]/50" />

        {/* Premium color glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00c389]/10 via-transparent to-[#16b8ff]/8 mix-blend-overlay" />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${5 + Math.random() * 90}%`,
              top: `${10 + Math.random() * 75}%`,
              background:
                i % 2 === 0
                  ? "rgba(0, 195, 137, 0.35)"
                  : "rgba(255,255,255,0.25)",
              boxShadow:
                i % 2 === 0
                  ? "0 0 12px rgba(0,195,137,0.4)"
                  : "0 0 10px rgba(255,255,255,0.2)",
            }}
            animate={{
              y: [0, -40 - Math.random() * 40, 0],
              opacity: [0, 0.8, 0],
              scale: [0.6, 1.2, 0.6],
            }}
            transition={{
              duration: 6 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-30 h-full flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-8 md:px-12 text-center">
          {/* Headline */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <EditablePortfolioHeading
              fieldKey="home.story.titleParts"
              fallbackParts={[
                { text: "Közös naplementék." },
                { text: "Új élmények.", variant: "gradient" },
                { text: "Emlékek egy életre." },
              ]}
              as="h2"
              mode="inline"
              className="m-0 text-white"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 4rem)",
                fontWeight: 700,
                letterSpacing: "-0.035em",
                lineHeight: 1.08,
                textShadow: "0 6px 28px rgba(0,0,0,0.45)",
              }}
            />
          </motion.div>

          {/* Divider */}
          <motion.div
            className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#00c389] to-transparent mx-auto mb-7 opacity-80"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 0.8 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.4 }}
          />

          {/* Description */}
          <motion.p
            className="text-white/85 max-w-3xl mx-auto mb-8"
            style={{
              fontSize: "clamp(1rem, 1.8vw, 1.35rem)",
              lineHeight: 1.7,
              fontWeight: 400,
              textShadow: "0 2px 12px rgba(0,0,0,0.45)",
            }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.9,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {description}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.button
              className="group relative px-9 py-4 bg-white/10 backdrop-blur-2xl text-white rounded-[24px] border border-white/15 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              whileHover={{
                scale: 1.03,
                borderColor: "rgba(0,195,137,0.45)",
                boxShadow: "0 14px 40px rgba(0,195,137,0.25)",
                backgroundColor: "rgba(255,255,255,0.12)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
            >
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#00c389] to-[#16b8ff] opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.35 }}
              />

              {/* Shine */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "200%" }}
                transition={{ duration: 0.8 }}
              />

              <span
                className="relative flex items-center gap-3"
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                {ctaLabel}

                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </motion.div>
              </span>
            </motion.button>
          </motion.div>

          {/* Footer Quote */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-6 relative z-30"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 1,
              delay: 0.7,
            }}
          >
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/30" />

              <p className="text-white/80 italic text-sm tracking-wide">
              {quote}
            </p>

            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/30" />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white via-white/70 to-transparent z-10" />
    </section>
  );
}
