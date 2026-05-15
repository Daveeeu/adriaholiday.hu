import { motion } from "motion/react";
import { MapPin, CheckCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import Lottie from "lottie-react";
import worldMapAnimation from "../../imports/World_map_pinging_and_searching.json";
import loadingAnimation from "../../imports/loading.json";
import earthPlaneAnimation from "../../imports/Rotating_earth_and_paper_plane.json";

const steps = [
  {
    number: "01",
    lottieAnimation: worldMapAnimation,
    iconAccent: <MapPin className="w-4 h-4" strokeWidth={2} />,
    title: "Válassz utat",
    description: "Fedezd fel gondosan összeállított utazásainkat.",
    color: "from-[#00c389] to-[#16b8ff]",
  },
  {
    number: "02",
    lottieAnimation: loadingAnimation,
    iconAccent: <CheckCircle className="w-4 h-4" strokeWidth={2} />,
    title: "Foglalj online",
    description: "Foglalj gyorsan és biztonságosan néhány kattintással.",
    color: "from-[#16b8ff] to-[#0ea5e9]",
  },
  {
    number: "03",
    lottieAnimation: earthPlaneAnimation,
    iconAccent: <Sparkles className="w-4 h-4" strokeWidth={2} />,
    title: "Indulj velünk",
    description: "Dőlj hátra — minden részletet mi intézünk.",
    color: "from-[#0ea5e9] to-[#00c389]",
  },
];

export default function HowItWorks() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <section className="relative py-32 bg-gradient-to-b from-white via-[#f8fafc] to-white overflow-hidden">
      {/* Cinematic Atmospheric Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle world map texture */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #00c389 1px, transparent 0)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Soft gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-[15%] w-[500px] h-[500px] bg-gradient-to-br from-[#00c389]/8 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-1/4 right-[15%] w-[500px] h-[500px] bg-gradient-to-tl from-[#16b8ff]/8 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              background: i % 2 === 0 ? "rgba(0, 195, 137, 0.3)" : "rgba(22, 184, 255, 0.25)",
              boxShadow: i % 2 === 0
                ? "0 0 10px rgba(0, 195, 137, 0.4)"
                : "0 0 10px rgba(22, 184, 255, 0.35)",
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative max-w-[1300px] mx-auto px-8 md:px-12 lg:px-20">
        {/* Premium Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-gray-900 mb-5"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Hogyan{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              zajlik?
            </span>
          </motion.h2>

          <motion.p
            className="text-gray-900 mb-3"
            style={{ fontSize: "1.25rem", fontWeight: 500, letterSpacing: "-0.01em" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            3 egyszerű lépés a következő élményedig
          </motion.p>

          <motion.p
            className="text-gray-600 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Gyors foglalás, gondos szervezés és felejthetetlen utazások.
          </motion.p>
        </motion.div>

        {/* Connected Journey Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Curved Connecting Path - Desktop */}
          <svg
            className="absolute top-0 left-0 w-full h-full hidden lg:block pointer-events-none"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00c389" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#16b8ff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
              </linearGradient>

              <filter id="pathGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Smooth curved path */}
            <motion.path
              d="M 150 100 Q 350 80 500 200 T 850 280"
              stroke="url(#journeyGradient)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="12 8"
              filter="url(#pathGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
            />

            {/* Moving light pulse */}
            <motion.circle
              r="6"
              fill="#00c389"
              filter="url(#pathGlow)"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: 2.5,
              }}
            >
              <animateMotion dur="4s" repeatCount="indefinite" begin="2.5s">
                <mpath href="#journeyPath" />
              </animateMotion>
            </motion.circle>

            <path id="journeyPath" d="M 150 100 Q 350 80 500 200 T 850 280" fill="none" />
          </svg>

          {/* Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Premium Glassmorphism Card */}
                <motion.div
                  className="relative bg-white/70 backdrop-blur-3xl rounded-[32px] p-10 border border-white/50 shadow-[0_12px_48px_rgba(0,0,0,0.08)] overflow-hidden"
                  whileHover={{ y: -10, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {/* Soft gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 transition-opacity duration-500`}
                    style={{
                      opacity: hoveredStep === index ? 0.05 : 0,
                    }}
                  />

                  {/* Inner border glow */}
                  <motion.div
                    className="absolute inset-0 rounded-[32px] pointer-events-none"
                    animate={{
                      boxShadow:
                        hoveredStep === index
                          ? "inset 0 0 0 2px rgba(0, 195, 137, 0.2)"
                          : "inset 0 0 0 0px rgba(0, 195, 137, 0)",
                    }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Large Number Background */}
                  <div
                    className={`absolute -top-6 -right-6 font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-[0.08] pointer-events-none select-none`}
                    style={{ fontSize: "180px", lineHeight: 1, fontWeight: 800 }}
                  >
                    {step.number}
                  </div>

                  <div className="relative">
                    {/* Lottie Animation Container */}
                    <motion.div
                      className="relative mb-8 inline-block"
                      animate={{
                        scale: hoveredStep === index ? 1.08 : 1,
                        y: hoveredStep === index ? -5 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {/* Main Lottie container */}
                      <div
                        className="relative w-32 h-32 rounded-[28px] bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-xl flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white/60 overflow-hidden"
                      >
                        {/* Soft gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-10`} />

                        {/* Lottie Animation */}
                        <div className="relative w-20 h-20">
                          <Lottie
                            animationData={step.lottieAnimation}
                            loop={true}
                            autoplay={true}
                            style={{
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        </div>

                        {/* Floating accent icon */}
                        <motion.div
                          className={`absolute -top-2 -right-2 w-9 h-9 rounded-full bg-gradient-to-br ${step.color} shadow-xl flex items-center justify-center border-2 border-white`}
                          animate={{
                            y: hoveredStep === index ? [-3, 3, -3] : 0,
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <div className="text-white">{step.iconAccent}</div>
                        </motion.div>
                      </div>

                      {/* Pulsing glow ring */}
                      <motion.div
                        className={`absolute inset-0 rounded-[28px] bg-gradient-to-br ${step.color}`}
                        animate={{
                          scale: hoveredStep === index ? [1, 1.25, 1] : 1,
                          opacity: hoveredStep === index ? [0.5, 0, 0.5] : 0,
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: hoveredStep === index ? Infinity : 0,
                        }}
                      />
                    </motion.div>

                    {/* Step Number Badge - Larger and more premium */}
                    <motion.div
                      className="inline-block mb-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.3 }}
                    >
                      <span
                        className={`bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                        style={{ fontSize: "1.125rem", fontWeight: 800, letterSpacing: "0.05em" }}
                      >
                        {step.number}
                      </span>
                    </motion.div>

                    {/* Title - Larger */}
                    <h3
                      className="text-gray-900 mb-5"
                      style={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        letterSpacing: "-0.025em",
                        lineHeight: 1.2,
                      }}
                    >
                      {step.title}
                    </h3>

                    {/* Description - More prominent */}
                    <p className="text-gray-600 leading-relaxed" style={{ fontSize: "1.0625rem", lineHeight: 1.7 }}>
                      {step.description}
                    </p>

                    {/* Bottom accent line - More prominent */}
                    <motion.div
                      className={`absolute bottom-0 left-10 right-10 h-[3px] bg-gradient-to-r ${step.color} rounded-full opacity-60`}
                      initial={{ scaleX: 0, opacity: 0 }}
                      whileInView={{ scaleX: 1, opacity: 0.6 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Premium CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            className="group relative px-10 py-5 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white rounded-[28px] shadow-[0_8px_32px_rgba(0,195,137,0.25)] overflow-hidden"
            whileHover={{
              scale: 1.03,
              boxShadow: "0 12px 48px rgba(0,195,137,0.35)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "200%" }}
              transition={{ duration: 0.8 }}
            />

            <span
              className="relative flex items-center gap-2"
              style={{ fontSize: "1.0625rem", fontWeight: 600 }}
            >
              Kezdjük el!
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
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
