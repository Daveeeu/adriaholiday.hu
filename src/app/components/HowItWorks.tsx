import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import Lottie from "lottie-react";

import loadingAnimation from "../../imports/loading.json";
import earthPlaneAnimation from "../../imports/Rotating_earth_and_paper_plane.json";
import onlinePlaneAnimation from "../../imports/earth.json";
import { EditableText } from "../content/EditableFields";
import { renderContentIcon } from "../content/icon-map";
import { EditablePortfolioHeading } from "../content/PortfolioHeading";
import { usePortfolioContent } from "../content/PortfolioContentProvider";

const stepsFallback = [
  {
    number: "01",
    lottieAnimation: loadingAnimation,
    icon: "compass",
    eyebrow: "Felfedezés",
    title: "Válassz utat",
    description:
      "Böngéssz gondosan összeállított utazásaink között, és találd meg a hozzád illő úti célt.",
    color: "from-[#00c389] to-[#16b8ff]",
  },
  {
    number: "02",
    lottieAnimation: onlinePlaneAnimation,
    icon: "calendar",
    eyebrow: "Foglalás",
    title: "Foglalj online",
    description:
      "Foglalj gyorsan, átláthatóan és biztonságosan néhány kattintással.",
    color: "from-[#16b8ff] to-[#0ea5e9]",
  },
  {
    number: "03",
    lottieAnimation: earthPlaneAnimation,
    icon: "bus",
    eyebrow: "Utazás",
    title: "Indulj velünk",
    description:
      "Dőlj hátra, mi intézzük a részleteket — neked csak az élmény marad.",
    color: "from-[#0ea5e9] to-[#00c389]",
  },
];

export default function HowItWorks() {
  const { getValue } = usePortfolioContent();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const steps = getValue("home.howItWorks.steps", stepsFallback) as typeof stepsFallback;

  return (
    <section className="relative py-20 md:py-24 overflow-hidden bg-gradient-to-b from-white via-[#f3fbff] to-[#f5fffb]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-[#00c389]/6 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-[-120px] w-[520px] h-[520px] bg-[#16b8ff]/7 blur-3xl rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,195,137,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(22,184,255,.45) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div
          className="text-center mb-12 md:mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#00c389]/15 text-[#00a878] text-sm font-bold mb-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <span className="w-2 h-2 rounded-full bg-[#00c389]" />
            <EditableText
              fieldKey="home.howItWorks.eyebrow"
              fallback="EGYSZERŰ FOLYAMAT"
              as="span"
            />
          </div>

          <div className="mb-4">
            <EditablePortfolioHeading
              fieldKey="home.howItWorks.titleParts"
              fallbackParts={[
                { text: "Hogyan" },
                { text: "zajlik?", variant: "gradient" },
              ]}
              as="h2"
              mode="inline"
              className="m-0 text-[#0f172a]"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.7rem)",
                fontWeight: 760,
                letterSpacing: "-0.045em",
                lineHeight: 1.05,
              }}
            />
          </div>

          <EditableText
            fieldKey="home.howItWorks.subtitle"
            fallback="3 egyszerű lépés a következő élményedig"
            as="p"
            className="text-gray-900 mb-2 text-lg md:text-xl font-semibold tracking-[-0.02em]"
          />

          <EditableText
            fieldKey="home.howItWorks.description"
            fallback="Gyors foglalás, gondos szervezés és felejthetetlen utazások."
            as="p"
            className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          />
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[98px] left-[17%] right-[17%] h-px bg-gradient-to-r from-transparent via-[#16b8ff]/35 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {steps.map((step, index) => {
              const isHovered = hoveredStep === index;

              return (
                <motion.article
                  key={step.number}
                  className="group relative min-h-[405px] rounded-[34px] bg-white/86 backdrop-blur-xl border border-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] p-7 md:p-8 overflow-hidden"
                  initial={{ opacity: 0, y: 34 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.65,
                    delay: index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -6 }}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-[0.045] transition-opacity duration-500`}
                  />

                  <div
                    className={`absolute top-4 right-5 text-[118px] font-black leading-none bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-[0.055] pointer-events-none select-none`}
                  >
                    {step.number}
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <motion.div
                      className="relative mb-7"
                      animate={{
                        y: isHovered ? -4 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 360, damping: 26 }}
                    >
                      <div className="relative w-[138px] h-[138px] rounded-[30px] bg-gradient-to-br from-[#f4fffb] to-[#eef8ff] border border-white shadow-[0_15px_42px_rgba(15,23,42,0.08)] flex items-center justify-center overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-[0.08]`} />

                        <div className="relative w-28 h-28">
                          <Lottie animationData={step.lottieAnimation} loop autoplay />
                        </div>

                        <motion.div
                          className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-lg`}
                          animate={{ rotate: isHovered ? [0, 6, -6, 0] : 0 }}
                          transition={{
                            duration: 2.2,
                            repeat: isHovered ? Infinity : 0,
                            ease: "easeInOut",
                          }}
                        >
                          {renderContentIcon(step.icon, "w-4 h-4")}
                        </motion.div>
                      </div>
                    </motion.div>

                    <div className="flex items-center gap-3 mb-5">
                      <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-[#f8fafc] shadow-sm">
                        <span className={`bg-gradient-to-r ${step.color} bg-clip-text text-transparent text-base font-black tracking-[0.08em]`}>
                          {step.number}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-gray-500">
                        {step.eyebrow}
                      </span>
                    </div>

                    <h3 className="text-[#0f172a] text-[1.8rem] font-bold tracking-[-0.035em] leading-tight mb-4">
                      {step.title}
                    </h3>

                    <p className="text-gray-600 text-base leading-relaxed mb-8">
                      {step.description}
                    </p>

                    <div className="mt-auto">
                      <div className={`h-[4px] w-full rounded-full bg-gradient-to-r ${step.color} opacity-75`} />
                    </div>
                  </div>

                  <motion.div
                    className="absolute inset-0 rounded-[34px] pointer-events-none"
                    animate={{
                      boxShadow: isHovered
                        ? "inset 0 0 0 1.5px rgba(0,195,137,0.16)"
                        : "inset 0 0 0 0px rgba(0,195,137,0)",
                    }}
                    transition={{ duration: 0.25 }}
                  />
                </motion.article>
              );
            })}
          </div>
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
              <motion.button
                className="group relative px-8 py-4 rounded-[24px] bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white shadow-[0_14px_42px_rgba(0,195,137,0.27)] overflow-hidden"
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "200%" }}
              transition={{ duration: 0.8 }}
            />

            <span className="relative flex items-center gap-2 text-base font-semibold">
              <EditableText
                fieldKey="home.howItWorks.cta.label"
                fallback="Kezdjük el"
                as="span"
              />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
