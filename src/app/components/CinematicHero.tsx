import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, MapPin, Calendar, Clock, DollarSign, Search, Users, Eye } from "lucide-react";
import { useState, useRef } from "react";
import Lottie from "lottie-react";
import earthPlaneAnimation from "../../imports/Rotating_earth_and_paper_plane.json";
import loadingAnimation from "../../imports/loading.json";

export default function CinematicHero() {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden bg-[#0A1628]">
      {/* Background Image with Parallax & Cinematic Zoom */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <motion.img
          src="https://images.unsplash.com/photo-1764956607632-0aeeaae38e1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=90"
          alt="Adriatic Coast"
          className="w-full h-full object-cover"
          animate={{ scale: [1.08, 1.12, 1.08] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Cinematic warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/60 to-[#0A1628]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/40 via-transparent to-[#0A1628]/70" />

        {/* Warm Mediterranean sunlight effect */}
        <motion.div
          className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-bl from-[#00c389]/8 via-[#16b8ff]/6 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </motion.div>

      {/* Subtle floating particles */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 12,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-30 min-h-screen flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-20 lg:gap-32 items-center">

            {/* Left Side - Premium Content with More Breathing Space */}
            <motion.div
              className="max-w-[640px]"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              style={{ opacity }}
            >
              {/* Handwritten Accent - minimal use */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span
                  className="text-[#00c389]"
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "1.5rem",
                    fontWeight: 500,
                    opacity: 0.85,
                  }}
                >
                  Az élmény vár rád
                </span>
              </motion.div>

              {/* Premium Headline - stronger hierarchy */}
              <motion.h1
                className="mb-8"
                style={{
                  fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  color: "#ffffff",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Buszos utak,
                <br />
                <span style={{ fontWeight: 400 }}>amikre </span>
                <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
                  évek múlva is
                </span>
                <br />
                emlékezni fogsz
              </motion.h1>

              {/* Subheadline - cleaner, more whitespace */}
              <motion.p
                className="mb-12 text-white/75 leading-relaxed"
                style={{
                  fontSize: "1.125rem",
                  lineHeight: 1.75,
                  fontWeight: 300,
                  maxWidth: "480px",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                Tengerpartok, városok és felejthetetlen élmények gondtalan szervezéssel.
              </motion.p>

              {/* Premium CTA Buttons */}
              <motion.div
                className="flex flex-wrap gap-4 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                {/* Primary gradient button */}
                <motion.button
                  className="group relative px-9 py-4 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white rounded-[28px] overflow-hidden shadow-[0_4px_24px_rgba(0,195,137,0.25)]"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 6px 32px rgba(0,195,137,0.35)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <span className="relative flex items-center gap-2.5" style={{ fontSize: "1rem", fontWeight: 600 }}>
                    Találd meg az utat
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                  </span>
                </motion.button>

                {/* Secondary glassmorphism outline button */}
                <motion.button
                  className="group relative px-9 py-4 bg-white/5 backdrop-blur-xl text-white rounded-[28px] border-2 border-white/15 overflow-hidden"
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderColor: "rgba(0, 195, 137, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <span className="relative flex items-center gap-2.5" style={{ fontSize: "1rem", fontWeight: 600 }}>
                    Last Minute -20%
                  </span>
                </motion.button>
              </motion.div>

              {/* Trust Stats - cleaner */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                {[
                  { value: "10 000+", label: "boldog utas" },
                  { value: "15", label: "év tapasztalat" },
                  { value: "4.9/5", label: "értékelés" },
                  { value: "100%", label: "gondtalan" },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    className="relative group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + idx * 0.08 }}
                    whileHover={{ y: -3 }}
                  >
                    <div className="text-[#00c389] mb-1.5" style={{ fontSize: "1.625rem", fontWeight: 700 }}>
                      {stat.value}
                    </div>
                    <div className="text-white/45 text-xs uppercase tracking-wide" style={{ fontWeight: 400 }}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side - Luxury Cinematic Globe */}
            <motion.div
              className="relative h-[750px] hidden lg:block overflow-visible"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Premium Atmospheric Depth Layers */}
              <div className="absolute inset-0 overflow-visible">
                {/* Ultra-Subtle Atmospheric Aura */}
                <motion.div
                  className="absolute top-1/2 right-[-12%] -translate-y-1/2 w-[850px] h-[850px] rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(0, 195, 137, 0.04) 0%, rgba(22, 184, 255, 0.02) 30%, transparent 55%)",
                    backdropFilter: "blur(80px)",
                  }}
                  animate={{
                    scale: [1, 1.03, 1],
                    opacity: [0.15, 0.25, 0.15],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Subtle Cinematic Light Particles - Very Fine */}
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      right: `${10 + Math.random() * 50}%`,
                      top: `${15 + Math.random() * 70}%`,
                      width: i % 4 === 0 ? "3px" : "1.5px",
                      height: i % 4 === 0 ? "3px" : "1.5px",
                      background: i % 3 === 0
                        ? "rgba(0, 195, 137, 0.35)"
                        : i % 3 === 1
                        ? "rgba(22, 184, 255, 0.3)"
                        : "rgba(255, 255, 255, 0.2)",
                      boxShadow: i % 3 === 0
                        ? "0 0 16px 2px rgba(0, 195, 137, 0.4)"
                        : i % 3 === 1
                        ? "0 0 16px 2px rgba(22, 184, 255, 0.35)"
                        : "0 0 8px 1px rgba(255, 255, 255, 0.25)",
                      filter: "blur(0.5px)",
                    }}
                    animate={{
                      y: [0, -100 - Math.random() * 120, 0],
                      x: [0, (Math.random() - 0.5) * 40, 0],
                      opacity: [0, 0.7, 0],
                      scale: [0.6, 1.3, 0.6],
                    }}
                    transition={{
                      duration: 10 + Math.random() * 12,
                      repeat: Infinity,
                      delay: Math.random() * 8,
                      ease: "easeInOut",
                    }}
                  />
                ))}

                {/* PREMIUM Cinematic Globe - The Centerpiece */}
                <motion.div
                  className="absolute top-1/2 right-[-18%] -translate-y-1/2 w-[780px] h-[780px]"
                  initial={{ opacity: 0, scale: 0.85, x: 120 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 2.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Cinematic Turquoise Glow System - Stronger */}

                  {/* Outer atmospheric glow */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-[100px]"
                    style={{
                      background: "radial-gradient(circle, rgba(0, 195, 137, 0.5) 0%, rgba(22, 184, 255, 0.3) 35%, transparent 65%)",
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 0.95, 0.7],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Inner sharp turquoise glow */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-[50px]"
                    style={{
                      background: "radial-gradient(circle, rgba(0, 195, 137, 0.6) 0%, rgba(22, 184, 255, 0.4) 45%, transparent 65%)",
                    }}
                    animate={{
                      scale: [1, 1.06, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 9,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Core glow - brightest layer */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-[30px]"
                    style={{
                      background: "radial-gradient(circle, rgba(0, 195, 137, 0.7) 0%, rgba(22, 184, 255, 0.5) 40%, transparent 60%)",
                    }}
                    animate={{
                      opacity: [0.85, 1, 0.85],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Cinematic highlight - premium detail */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.12), transparent 40%)",
                    }}
                  />

                  {/* The Globe - Ultra Slow Luxury Rotation (20-22 sec) */}
                  <motion.div
                    className="relative w-full h-full"
                    animate={{
                      scale: [1, 1.008, 1],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Lottie
                      animationData={earthPlaneAnimation}
                      loop={true}
                      speed={0.06}
                      className="w-full h-full opacity-85"
                      style={{
                        filter: "drop-shadow(0 0 140px rgba(0, 195, 137, 0.6)) drop-shadow(0 0 80px rgba(22, 184, 255, 0.5)) drop-shadow(0 35px 70px rgba(0, 0, 0, 0.2)) contrast(1.15) brightness(1.08)",
                        mixBlendMode: "normal",
                      }}
                    />
                  </motion.div>

                  {/* Cinematic rotating light rays - very subtle */}
                  <motion.div
                    className="absolute inset-0 rounded-full opacity-30"
                    style={{
                      background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0, 195, 137, 0.15) 45deg, transparent 100deg, rgba(22, 184, 255, 0.12) 170deg, transparent 230deg)",
                    }}
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 60,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>

                {/* Ultra-Subtle Paper Plane - Minimal Accent */}
                <motion.div
                  className="absolute top-1/2 right-[24%] w-5 h-5"
                  animate={{
                    x: [0, -40, -12, 25, 0],
                    y: [0, -60, -85, -42, 0],
                    rotate: [0, -10, -18, -6, 0],
                    opacity: [0.2, 0.4, 0.45, 0.35, 0.2],
                  }}
                  transition={{
                    duration: 24,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.6, 1],
                  }}
                >
                  <motion.div
                    className="w-full h-full relative"
                    style={{
                      filter: "drop-shadow(0 0 5px rgba(0, 195, 137, 0.4)) blur(0.15px)",
                    }}
                  >
                    <div className="w-1 h-1 bg-gradient-to-r from-[#00c389] to-[#16b8ff] rounded-full" />
                    {/* Minimal soft trail */}
                    <motion.div
                      className="absolute top-0 left-0 w-2.5 h-0.5 bg-gradient-to-r from-[#00c389]/30 to-transparent blur-[0.8px]"
                      style={{ transformOrigin: "left center" }}
                      animate={{ scaleX: [0.7, 1.1, 0.7], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  </motion.div>
                </motion.div>

                {/* Luxury Glassmorphism Badges - Apple/Airbnb Style */}

                {/* Badge 1: "Már csak 4 hely!" */}
                <motion.div
                  className="absolute top-[18%] right-[8%]"
                  initial={{ opacity: 0, scale: 0.9, y: -15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 2.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="px-4 py-3 bg-white/8 backdrop-blur-[40px] border border-white/15 rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.2),0_0_20px_rgba(0,195,137,0.1)]"
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Premium gradient overlay */}
                    <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-[#00c389]/12 via-transparent to-[#16b8ff]/8 opacity-70" />

                    {/* Soft inner border with glow */}
                    <div className="absolute inset-0 rounded-[20px] border border-white/8 shadow-[inset_0_0_20px_rgba(0,195,137,0.05)]" />

                    <div className="relative flex items-center gap-3">
                      {/* Minimal icon */}
                      <motion.div
                        className="flex-shrink-0 w-7 h-7 rounded-[12px] bg-gradient-to-br from-[#00c389]/15 to-[#16b8ff]/10 flex items-center justify-center"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(0, 195, 137, 0)",
                            "0 0 0 6px rgba(0, 195, 137, 0.06)",
                            "0 0 0 0 rgba(0, 195, 137, 0)",
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                      >
                        <Users className="w-3.5 h-3.5 text-white/90" strokeWidth={2} />
                      </motion.div>

                      {/* Premium text */}
                      <span
                        className="text-white/95 whitespace-nowrap"
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Már csak 4 hely!
                      </span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Badge 2: "12 ember nézi most" */}
                <motion.div
                  className="absolute bottom-[28%] right-[38%]"
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 2.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="px-4 py-3 bg-white/8 backdrop-blur-[40px] border border-white/15 rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.2),0_0_20px_rgba(22,184,255,0.1)]"
                    animate={{
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 5.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  >
                    {/* Premium gradient overlay */}
                    <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-[#16b8ff]/12 via-transparent to-[#00c389]/8 opacity-70" />

                    {/* Soft inner border with glow */}
                    <div className="absolute inset-0 rounded-[20px] border border-white/8 shadow-[inset_0_0_20px_rgba(22,184,255,0.05)]" />

                    <div className="relative flex items-center gap-3">
                      {/* Minimal icon */}
                      <motion.div
                        className="flex-shrink-0 w-7 h-7 rounded-[12px] bg-gradient-to-br from-[#16b8ff]/15 to-[#00c389]/10 flex items-center justify-center"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(22, 184, 255, 0)",
                            "0 0 0 6px rgba(22, 184, 255, 0.06)",
                            "0 0 0 0 rgba(22, 184, 255, 0)",
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: 0.6,
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 text-white/90" strokeWidth={2} />
                      </motion.div>

                      {/* Premium text */}
                      <span
                        className="text-white/95 whitespace-nowrap"
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        12 ember nézi most
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Premium Search Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-40 pb-10 px-8 md:px-12 lg:px-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="max-w-[1300px] mx-auto">
          <div className="bg-white/12 backdrop-blur-3xl border border-white/15 rounded-[28px] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35),0_0_40px_rgba(0,195,137,0.08)]">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {/* Destination */}
              <div className="col-span-2 md:col-span-1">
                <motion.div
                  className={`relative rounded-[20px] border transition-all ${
                    focusedField === "destination"
                      ? "border-[#00c389]/40 bg-white/12 shadow-[0_0_20px_rgba(0,195,137,0.15)]"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <MapPin className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <input
                    type="text"
                    placeholder="Úti cél"
                    className="w-full pl-11 pr-4 py-4 bg-transparent text-white text-sm placeholder-white/40 focus:outline-none"
                    onFocus={() => setFocusedField("destination")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </div>

              {/* Departure */}
              <div className="col-span-2 md:col-span-1">
                <motion.div
                  className={`relative rounded-[20px] border transition-all ${
                    focusedField === "departure"
                      ? "border-[#00c389]/40 bg-white/12"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <MapPin className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <input
                    type="text"
                    placeholder="Indulás helye"
                    className="w-full pl-11 pr-4 py-4 bg-transparent text-white text-sm placeholder-white/40 focus:outline-none"
                    onFocus={() => setFocusedField("departure")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </div>

              {/* Date */}
              <div className="col-span-1">
                <motion.div
                  className={`relative rounded-[20px] border transition-all ${
                    focusedField === "date"
                      ? "border-[#00c389]/40 bg-white/12"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <input
                    type="date"
                    className="w-full pl-11 pr-4 py-4 bg-transparent text-white text-sm focus:outline-none"
                    onFocus={() => setFocusedField("date")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </div>

              {/* Duration */}
              <div className="col-span-1">
                <motion.div
                  className={`relative rounded-[20px] border transition-all ${
                    focusedField === "duration"
                      ? "border-[#00c389]/40 bg-white/12"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Clock className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <select
                    className="w-full pl-11 pr-4 py-4 bg-transparent text-white text-sm focus:outline-none appearance-none cursor-pointer"
                    onFocus={() => setFocusedField("duration")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="" className="bg-[#0A1628]">Időtartam</option>
                    <option value="2-3" className="bg-[#0A1628]">2-3 nap</option>
                    <option value="4-5" className="bg-[#0A1628]">4-5 nap</option>
                    <option value="6-7" className="bg-[#0A1628]">6-7 nap</option>
                    <option value="8+" className="bg-[#0A1628]">8+ nap</option>
                  </select>
                </motion.div>
              </div>

              {/* Budget */}
              <div className="col-span-1">
                <motion.div
                  className={`relative rounded-[20px] border transition-all ${
                    focusedField === "budget"
                      ? "border-[#00c389]/40 bg-white/12"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <DollarSign className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <select
                    className="w-full pl-11 pr-4 py-4 bg-transparent text-white text-sm focus:outline-none appearance-none cursor-pointer"
                    onFocus={() => setFocusedField("budget")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="" className="bg-[#0A1628]">Költségkeret</option>
                    <option value="0-150" className="bg-[#0A1628]">0 - 150k Ft</option>
                    <option value="150-250" className="bg-[#0A1628]">150 - 250k Ft</option>
                    <option value="250+" className="bg-[#0A1628]">250k+ Ft</option>
                  </select>
                </motion.div>
              </div>

              {/* Search Button with Loading Animation */}
              <motion.button
                className="col-span-2 md:col-span-1 relative rounded-[20px] bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white py-4 overflow-hidden shadow-[0_4px_20px_rgba(0,195,137,0.3)]"
                onClick={() => {
                  setIsSearching(true);
                  setTimeout(() => setIsSearching(false), 2000);
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 6px 28px rgba(0,195,137,0.4)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Animated glow on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{
                    x: isSearching ? ["-100%", "200%"] : "-100%",
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isSearching ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                />

                <span className="relative flex items-center justify-center gap-2" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4">
                        <Lottie
                          animationData={loadingAnimation}
                          loop={true}
                          className="w-full h-full"
                        />
                      </div>
                      Keresés...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" strokeWidth={2.5} />
                      Keresés
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
