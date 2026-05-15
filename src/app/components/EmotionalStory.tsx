import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

export default function EmotionalStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[85vh] min-h-[700px] overflow-hidden bg-[#0A1628]"
    >
      {/* Full-Width Cinematic Adriatic Sunset Image */}
      <motion.div
        className="absolute inset-0"
        style={{ y }}
      >
        <motion.img
          src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=2000&q=90"
          alt="Adriatic sunset"
          className="w-full h-full object-cover"
          style={{ scale }}
        />

        {/* Cinematic Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/90 via-[#0A1628]/50 to-[#0A1628]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/60 via-transparent to-[#0A1628]/40" />

        {/* Warm Mediterranean Color Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00c389]/8 via-transparent to-[#16b8ff]/6 mix-blend-overlay" />
      </motion.div>

      {/* Subtle Floating Light Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              background: i % 2 === 0
                ? "rgba(255, 200, 100, 0.4)"
                : "rgba(0, 195, 137, 0.3)",
              boxShadow: i % 2 === 0
                ? "0 0 12px rgba(255, 200, 100, 0.5)"
                : "0 0 12px rgba(0, 195, 137, 0.4)",
            }}
            animate={{
              y: [0, -80 - Math.random() * 60, 0],
              x: [0, (Math.random() - 0.5) * 40, 0],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Emotional Content - Centered */}
      <div className="relative h-full flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-8 md:px-12 text-center">
          {/* Main Emotional Headline */}
          <motion.h2
            className="text-white mb-8"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Közös naplementék.{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              Új élmények.
            </span>{" "}
            Emlékek egy életre.
          </motion.h2>

          {/* Elegant Divider */}
          <motion.div
            className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#00c389] to-transparent mx-auto mb-10"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {/* Subheadline */}
          <motion.p
            className="text-white/90 max-w-3xl mx-auto mb-12"
            style={{
              fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
              lineHeight: 1.7,
              fontWeight: 400,
              textShadow: "0 2px 12px rgba(0, 0, 0, 0.4)",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            Nem csak úti célokat mutatunk meg. Élményeket adunk, amelyek évekkel később is veled maradnak.
          </motion.p>

          {/* Premium CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              className="group relative px-10 py-5 bg-white/10 backdrop-blur-2xl text-white rounded-[28px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden"
              whileHover={{
                scale: 1.03,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderColor: "rgba(0, 195, 137, 0.4)",
                boxShadow: "0 12px 48px rgba(0, 195, 137, 0.25)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {/* Animated gradient background on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#00c389] to-[#16b8ff] opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "200%" }}
                transition={{ duration: 0.8 }}
              />

              <span
                className="relative flex items-center gap-3"
                style={{ fontSize: "1.0625rem", fontWeight: 600 }}
              >
                Fedezd fel az utakat
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </motion.div>
              </span>
            </motion.button>
          </motion.div>

          {/* Subtle Quote Attribution */}
          <motion.div
            className="mt-16 flex items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/30" />
            <p
              className="text-white/60 italic"
              style={{ fontSize: "0.875rem", letterSpacing: "0.02em" }}
            >
              15 év óta teremtünk felejthetetlen pillanatokat
            </p>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/30" />
          </motion.div>
        </div>
      </div>

      {/* Soft bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
    </section>
  );
}
