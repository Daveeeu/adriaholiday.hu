import { motion } from "motion/react";
import { MapPin, CheckCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import Lottie from "lottie-react";

import worldMapAnimation from "../../imports/World_map_pinging_and_searching.json";
import loadingAnimation from "../../imports/loading.json";
import earthPlaneAnimation from "../../imports/Rotating_earth_and_paper_plane.json";
import onlinePlaneAnimation from "../../imports/earth.json";

const steps = [
  {
    number: "01",
    lottieAnimation: loadingAnimation,
    iconAccent: <MapPin className="w-4 h-4" strokeWidth={2} />,
    title: "Válassz utat",
    description:
      "Böngéssz gondosan összeállított utazásaink között, és találd meg a hozzád illő úti célt.",
    color: "from-[#00c389] to-[#16b8ff]",
  },
  {
    number: "02",
    lottieAnimation: onlinePlaneAnimation,
    iconAccent: <CheckCircle className="w-4 h-4" strokeWidth={2} />,
    title: "Foglalj online",
    description:
      "Foglalj gyorsan, átláthatóan és biztonságosan néhány kattintással.",
    color: "from-[#16b8ff] to-[#0ea5e9]",
  },
  {
    number: "03",
    lottieAnimation: earthPlaneAnimation,
    iconAccent: <Sparkles className="w-4 h-4" strokeWidth={2} />,
    title: "Indulj velünk",
    description:
      "Dőlj hátra, mi intézzük a részleteket — neked csak az élmény marad.",
    color: "from-[#0ea5e9] to-[#00c389]",
  },
];

export default function HowItWorks() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <section className="relative py-28 overflow-hidden bg-gradient-to-b from-white via-[#f8fafc] to-white">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-[340px] h-[340px] bg-[#00c389]/8 blur-3xl rounded-full" />
        <div className="absolute bottom-10 right-10 w-[340px] h-[340px] bg-[#16b8ff]/8 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-[1250px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="text-gray-900 mb-4"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 4rem)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            Hogyan{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              zajlik?
            </span>
          </h2>

          <p
            className="text-gray-900 mb-3"
            style={{
              fontSize: "1.35rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            3 egyszerű lépés a következő élményedig
          </p>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Gyors foglalás, gondos szervezés és felejthetetlen utazások.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-[145px] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-[#00c389]/20 via-[#16b8ff]/30 to-[#00c389]/20" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.15,
                }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <motion.div
                  className="group relative min-h-[390px] rounded-[34px] bg-white border border-gray-100 shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-9 overflow-hidden"
                  whileHover={{
                    y: -8,
                    scale: 1.015,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 24,
                  }}
                >
                  {/* Gradient hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${step.color}`}
                    animate={{
                      opacity: hoveredStep === index ? 0.05 : 0,
                    }}
                    transition={{ duration: 0.35 }}
                  />

                  {/* Large background number */}
                  <div
                    className={`absolute top-2 right-2 text-[150px] font-black leading-none bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-[0.05] pointer-events-none select-none`}
                  >
                    {step.number}
                  </div>

                  <div className="relative z-10">
                    {/* Lottie block */}
                    <motion.div
                      className="relative mb-8"
                      animate={{
                        y: hoveredStep === index ? -4 : 0,
                        scale: hoveredStep === index ? 1.04 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <div className="relative w-[145px] h-[145px] rounded-[30px] bg-gradient-to-br from-[#f4fffb] to-[#eef8ff] border border-white shadow-[0_15px_40px_rgba(15,23,42,0.08)] flex items-center justify-center overflow-hidden">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-[0.08]`}
                        />

                        {/* Bigger animation */}
                        <div className="relative w-28 h-28">
                          <Lottie
                            animationData={step.lottieAnimation}
                            loop
                            autoplay
                          />
                        </div>

                        {/* Floating accent */}
                        <motion.div
                          className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-lg`}
                          animate={{
                            rotate: hoveredStep === index ? [0, 8, -8, 0] : 0,
                          }}
                          transition={{
                            duration: 2,
                            repeat: hoveredStep === index ? Infinity : 0,
                          }}
                        >
                          {step.iconAccent}
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Number badge */}
                    <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-[#f8fafc] shadow-sm mb-6">
                      <span
                        className={`bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                        style={{
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {step.number}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-gray-900 mb-5"
                      style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                        lineHeight: 1.1,
                      }}
                    >
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-gray-600"
                      style={{
                        fontSize: "1.06rem",
                        lineHeight: 1.8,
                      }}
                    >
                      {step.description}
                    </p>

                    {/* Bottom accent */}
                    <motion.div
                      className={`absolute bottom-0 left-9 right-9 h-[4px] rounded-full bg-gradient-to-r ${step.color}`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.9,
                        delay: index * 0.15 + 0.4,
                      }}
                      style={{
                        transformOrigin: "left",
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="group relative px-10 py-5 rounded-[24px] bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white shadow-[0_15px_45px_rgba(0,195,137,0.28)] overflow-hidden"
            whileHover={{
              scale: 1.03,
              y: -2,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "200%" }}
              transition={{ duration: 0.9 }}
            />

            <span className="relative flex items-center gap-2 text-lg font-semibold">
              Kezdjük el
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}