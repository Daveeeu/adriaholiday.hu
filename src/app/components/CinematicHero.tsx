import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import Lottie from "lottie-react";

import HeroSearchForm from "./HeroSearchForm";
import { useLottieAnimation } from "../hooks/useLottieAnimation";
import { EditableButton, EditableList, EditableMedia, EditableText } from "../content/EditableFields";
import { renderContentIcon } from "../content/icon-map";
import { EditablePortfolioHeading } from "../content/PortfolioHeading";
import { usePortfolioContent } from "../content/PortfolioContentProvider";

export default function CinematicHero() {
  const { getValue } = usePortfolioContent();
  const heroRef = useRef<HTMLDivElement>(null);
  const earthPlaneAnimation = useLottieAnimation("rotating-earth-and-paper-plane.json");

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const heroVideo = getValue("home.hero.video", null) as { url?: string; mimeType?: string | null } | null;
  const primaryCtaLabel = String(
    getValue("home.hero.cta.primary.label", "Utazások keresése"),
  );
  const secondaryCtaLabel = String(
    getValue("home.hero.cta.secondary.label", "Last Minute ajánlatok"),
  );
  const heroStats = getValue("home.hero.stats", [
    { value: "10 000+", label: "elégedett utas" },
    { value: "22+", label: "év tapasztalat" },
    { value: "4.9/5", label: "értékelés" },
    { value: "100%", label: "kényelmes utazás" },
  ]) as Array<{ value: string; label: string }>;
  const heroBadges = getValue("home.hero.badges", [
    { icon: "users", text: "Már csak 4 hely!" },
    { icon: "eye", text: "12 ember nézi most" },
  ]) as Array<{ icon: string; text: string }>;

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-[#0A1628]"
    >
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        {heroVideo?.url ? (
          <EditableMedia
            fieldKey="home.hero.video"
            fallback={{ url: heroVideo.url, mimeType: heroVideo.mimeType ?? null }}
            kind="video"
            className="h-full w-full"
            mediaClassName="h-full w-full object-cover"
          />
        ) : (
          <EditableMedia
            fieldKey="home.hero.image"
            fallback={{
              url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?rect=900,400,3721,2325&flip=h&cs=tinysrgb&fm=jpg&w=1920&q=90",
              alt: "Napsütötte homokos tengerpart türkizkék vízzel",
              title: "Napsütötte homokos tengerpart türkizkék vízzel",
            }}
            kind="image"
            className="h-full w-full"
            mediaClassName="w-full h-full object-cover object-[85%_center]"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/70 via-[#0A1628]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/20 via-transparent to-[#0A1628]/45" />

        <motion.div
          className="absolute top-0 right-0 w-[900px] h-[900px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(0,195,137,0.10) 0%, rgba(22,184,255,0.06) 35%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -120, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: Math.random() * 25 + 20,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-30 min-h-screen flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-20 items-center">
            <motion.div
              className="max-w-[650px]"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              style={{ opacity }}
            >
              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <EditableText
                    fieldKey="home.hero.accent"
                    fallback="Az élmény rád vár"
                    as="span"
                    className="text-[#00c389]"
                    style={{
                      fontFamily: "'Dancing Script', cursive",
                      fontSize: "1.5rem",
                    }}
                  />
                </motion.div>
              </motion.div>

              <motion.h1
                className="mb-6"
                style={{
                  fontSize: "clamp(2.8rem, 5vw, 4.8rem)",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                  color: "#ffffff",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <EditablePortfolioHeading
                  fieldKey="home.hero.titleParts"
                  fallbackParts={[
                    { text: "Utazások, amikre" },
                    { text: "emlékezni fogsz", variant: "gradient" },
                  ]}
                  as="span"
                  mode="multiline"
                />
              </motion.h1>

              <motion.p
                className="mb-12 text-white/72 leading-relaxed"
                style={{
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                  fontWeight: 300,
                  maxWidth: "540px",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <EditableText
                  fieldKey="home.hero.subtitle"
                  fallback="Tengerparti utak, városlátogatások és körutazások tapasztalt szervezéssel, kényelmes autóbuszokkal vagy épp repülővel."
                  as="span"
                />
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4 mb-14"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <EditableButton
                  fieldKey="home.hero.cta.primary.url"
                  labelKey="home.hero.cta.primary.label"
                  fallback="Utazások keresése"
                  hrefFallback="/utazasok"
                  className="group"
                >
                  <motion.span
                    className="group inline-flex items-center gap-2.5 rounded-[28px] px-9 py-4 font-semibold text-white bg-gradient-to-r from-[#00c389] to-[#16b8ff] shadow-[0_4px_24px_rgba(0,195,137,0.25)]"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 6px 32px rgba(0,195,137,0.35)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {primaryCtaLabel}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.span>
                </EditableButton>

                <EditableButton
                  fieldKey="home.hero.cta.secondary.url"
                  labelKey="home.hero.cta.secondary.label"
                  fallback="Last Minute ajánlatok"
                  hrefFallback="/utazasok"
                  className="group"
                >
                  <motion.span
                    className="group inline-flex rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/12 px-9 py-4 font-semibold text-white"
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      borderColor: "rgba(0,195,137,0.25)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {secondaryCtaLabel}
                  </motion.span>
                </EditableButton>
              </motion.div>

              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 lg:mb-36"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <EditableList
                  fieldKey="home.hero.stats"
                  fallback={heroStats}
                  className="contents"
                  renderItem={(stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + idx * 0.08 }}
                    >
                      <div
                        className="text-[#00c389] mb-1"
                        style={{
                          fontSize: "1.7rem",
                          fontWeight: 700,
                        }}
                      >
                        {stat.value}
                      </div>

                      <div className="text-white/45 text-xs uppercase tracking-[0.15em]">
                        {stat.label}
                      </div>
                    </motion.div>
                  )}
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="relative h-[720px] hidden lg:block"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full blur-[80px]"
                style={{
                  background:
                    "radial-gradient(circle, rgba(0,195,137,0.22) 0%, rgba(22,184,255,0.12) 35%, transparent 70%)",
                }}
                animate={{
                  scale: [1, 1.04, 1],
                  opacity: [0.45, 0.6, 0.45],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[700px] h-[700px]"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {earthPlaneAnimation ? (
                  <Lottie
                    animationData={earthPlaneAnimation}
                    loop
                    speed={0.025}
                    className="w-full h-full"
                    style={{
                      filter: "drop-shadow(0 0 120px rgba(0,195,137,0.35))",
                    }}
                  />
                ) : null}
              </motion.div>

              {heroBadges[0] ? (
                <EditableList
                  fieldKey="home.hero.badges"
                  fallback={heroBadges}
                  className="contents"
                  renderItem={(badge, index) =>
                    index === 0 ? (
                      <motion.div
                        className="absolute top-[18%] right-[5%]"
                        animate={{
                          y: [0, -4, 0],
                        }}
                        transition={{
                          duration: 9,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-4 shadow-xl">
                          <div className="flex items-center gap-3 text-white">
                            {renderContentIcon(badge.icon, "w-4 h-4")}
                            <span className="text-sm font-medium">{badge.text}</span>
                          </div>
                        </div>
                      </motion.div>
                    ) : null
                  }
                />
              ) : null}

              {heroBadges[1] ? (
                <EditableList
                  fieldKey="home.hero.badges"
                  fallback={heroBadges}
                  className="contents"
                  renderItem={(badge, index) =>
                    index === 1 ? (
                      <motion.div
                        className="absolute bottom-[28%] right-[32%]"
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-4 shadow-xl">
                          <div className="flex items-center gap-3 text-white">
                            {renderContentIcon(badge.icon, "w-4 h-4")}
                            <span className="text-sm font-medium">{badge.text}</span>
                          </div>
                        </div>
                      </motion.div>
                    ) : null
                  }
                />
              ) : null}
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 z-40 pb-10 px-8 md:px-12 lg:px-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="max-w-[1300px] mx-auto">
          <HeroSearchForm />
        </div>
      </motion.div>
    </div>
  );
}
