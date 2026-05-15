import { motion } from "motion/react";
import { ArrowRight, MapPin, Calendar, Clock, Search } from "lucide-react";
import { useState } from "react";

export default function RefinedHero() {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A1628]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1764956607632-0aeeaae38e1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
          alt="Adriatic Coast"
          className="w-full h-full object-cover opacity-40"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628]/90 via-[#0A1628]/80 to-[#0A1628]/95" />
      </div>

      {/* Subtle floating particles */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none opacity-30">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#00c389]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 12,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Cinematic Bus Scene */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-y-1/2 z-20"
        initial={{ x: -400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 2.8,
          ease: [0.19, 1, 0.22, 1],
          delay: 0.4,
        }}
      >
        <div className="relative">
          {/* Elegant glowing route */}
          <motion.svg
            className="absolute top-1/2 right-full -translate-y-1/2 mr-12"
            width="400"
            height="4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
          >
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#00c389" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#00c389" />
              </linearGradient>
            </defs>
            <motion.line
              x1="0"
              y1="2"
              x2="400"
              y2="2"
              stroke="url(#routeGradient)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.8 }}
            />
          </motion.svg>

          {/* Destination markers */}
          {[120, 240, 360].map((x, idx) => (
            <motion.div
              key={idx}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ right: `calc(100% + ${400 - x}px)` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ delay: 1.2 + idx * 0.15 }}
            >
              <MapPin className="w-4 h-4 text-[#00c389]" strokeWidth={1.5} />
            </motion.div>
          ))}

          {/* Premium Luxury Bus - Larger and more detailed */}
          <motion.svg
            width="220"
            height="110"
            viewBox="0 0 220 110"
            className="drop-shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <defs>
              <linearGradient id="premiumBusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00c389" />
                <stop offset="100%" stopColor="#00a36b" />
              </linearGradient>
              <filter id="subtleGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Bus body - sleek modern design */}
            <path
              d="M 30 40 L 30 35 Q 30 30 35 30 L 180 30 Q 190 30 190 40 L 190 75 L 30 75 Z"
              fill="url(#premiumBusGradient)"
              filter="url(#subtleGlow)"
            />

            {/* Windows - elegant spacing */}
            {[42, 68, 94, 120, 146, 172].map((x, i) => (
              <rect
                key={i}
                x={x}
                y="37"
                width="20"
                height="18"
                rx="2"
                fill="#E8F5F1"
                opacity="0.85"
              />
            ))}

            {/* Front windshield */}
            <path d="M 185 40 L 185 65 L 190 65 L 190 40 Z" fill="#E8F5F1" opacity="0.7" />

            {/* Accent stripe */}
            <line x1="35" y1="60" x2="185" y2="60" stroke="#00e89d" strokeWidth="1.5" opacity="0.4" />

            {/* Front grille */}
            <rect x="188" y="48" width="2" height="20" rx="1" fill="#0A1628" opacity="0.3" />

            {/* Headlights - subtle glow */}
            <motion.circle
              cx="188"
              cy="50"
              r="3"
              fill="#FDE68A"
              opacity="0.7"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle
              cx="188"
              cy="64"
              r="3"
              fill="#FDE68A"
              opacity="0.7"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
            />

            {/* Wheels - smooth rotation */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "60px 85px" }}
            >
              <circle cx="60" cy="85" r="12" fill="#1E293B" stroke="#374151" strokeWidth="1.5" />
              <circle cx="60" cy="85" r="5" fill="#4B5563" />
            </motion.g>
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "160px 85px" }}
            >
              <circle cx="160" cy="85" r="12" fill="#1E293B" stroke="#374151" strokeWidth="1.5" />
              <circle cx="160" cy="85" r="5" fill="#4B5563" />
            </motion.g>
          </motion.svg>
        </div>
      </motion.div>

      {/* Hero Content - Left-aligned, editorial layout */}
      <div className="relative z-30 h-screen flex items-center px-8 md:px-16 lg:px-24">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Handwritten accent */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span
              className="text-[#00c389] opacity-80"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: "1.5rem",
                fontWeight: 500,
              }}
            >
              Induljon az élmény!
            </span>
          </motion.div>

          {/* Premium headline - elegant typography */}
          <motion.h1
            className="mb-6 text-white"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              fontWeight: 300,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <span style={{ fontWeight: 500 }}>Kényelmes buszos utak</span>
            <br />
            <span className="text-[#00c389]" style={{ fontWeight: 300 }}>
              Európa legszebb helyeire
            </span>
          </motion.h1>

          {/* Refined subheadline */}
          <motion.p
            className="mb-12 text-white/70 max-w-lg"
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.7,
              fontWeight: 300,
              letterSpacing: "0.01em",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Tengerparti utak, körutazások és prémium élmények egész Európában.
          </motion.p>

          {/* Elegant CTA Buttons */}
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <motion.button
              className="group relative px-8 py-4 bg-[#00c389]/90 backdrop-blur-sm text-white rounded-xl overflow-hidden border border-[#00c389]/20"
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(0, 195, 128, 1)",
                y: -2
              }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Subtle shine */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.15), transparent)",
                }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />

              <span className="relative flex items-center gap-2" style={{ fontSize: "0.9375rem", fontWeight: 500, letterSpacing: "0.01em" }}>
                Utazások felfedezése
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </span>
            </motion.button>

            <motion.button
              className="group relative px-8 py-4 bg-white/5 backdrop-blur-sm text-white rounded-xl border border-white/10 overflow-hidden"
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderColor: "rgba(0, 195, 128, 0.2)",
                y: -2
              }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="relative flex items-center gap-2" style={{ fontSize: "0.9375rem", fontWeight: 500, letterSpacing: "0.01em" }}>
                <Calendar className="w-4 h-4" strokeWidth={2} />
                Last Minute ajánlatok
              </span>
            </motion.button>
          </motion.div>

          {/* Elegant statistics */}
          <motion.div
            className="flex flex-wrap gap-8 mt-16 pt-12 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {[
              { value: "10 000+", label: "elégedett utas" },
              { value: "15+", label: "év tapasztalat" },
              { value: "150+", label: "úti cél" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + idx * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="text-[#00c389] mb-1" style={{ fontSize: "1.75rem", fontWeight: 300, letterSpacing: "-0.02em" }}>
                  {stat.value}
                </div>
                <div className="text-white/50 text-sm" style={{ fontWeight: 300, letterSpacing: "0.02em" }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Refined Search Bar - Luxury airline style */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-40 pb-8 px-8 md:px-16 lg:px-24"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Destination */}
              <div className="col-span-2 md:col-span-1">
                <motion.div
                  className={`relative rounded-lg border transition-all ${
                    focusedField === "destination"
                      ? "border-[#00c389]/40 bg-white/5"
                      : "border-white/10 bg-transparent"
                  }`}
                  animate={{
                    borderColor: focusedField === "destination" ? "rgba(0, 195, 128, 0.4)" : "rgba(255, 255, 255, 0.1)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    <MapPin className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    placeholder="Úti cél"
                    className="w-full pl-10 pr-3 py-3 bg-transparent text-white text-sm placeholder-white/40 focus:outline-none"
                    style={{ fontWeight: 300, letterSpacing: "0.01em" }}
                    onFocus={() => setFocusedField("destination")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </div>

              {/* Departure */}
              <div className="col-span-2 md:col-span-1">
                <motion.div
                  className={`relative rounded-lg border transition-all ${
                    focusedField === "departure"
                      ? "border-[#00c389]/40 bg-white/5"
                      : "border-white/10 bg-transparent"
                  }`}
                >
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    <MapPin className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    placeholder="Indulás"
                    className="w-full pl-10 pr-3 py-3 bg-transparent text-white text-sm placeholder-white/40 focus:outline-none"
                    style={{ fontWeight: 300, letterSpacing: "0.01em" }}
                    onFocus={() => setFocusedField("departure")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </div>

              {/* Date */}
              <div className="col-span-1">
                <motion.div
                  className={`relative rounded-lg border transition-all ${
                    focusedField === "date"
                      ? "border-[#00c389]/40 bg-white/5"
                      : "border-white/10 bg-transparent"
                  }`}
                >
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    type="date"
                    className="w-full pl-10 pr-3 py-3 bg-transparent text-white text-sm placeholder-white/40 focus:outline-none"
                    style={{ fontWeight: 300, letterSpacing: "0.01em" }}
                    onFocus={() => setFocusedField("date")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </div>

              {/* Duration */}
              <div className="col-span-1">
                <motion.div
                  className={`relative rounded-lg border transition-all ${
                    focusedField === "duration"
                      ? "border-[#00c389]/40 bg-white/5"
                      : "border-white/10 bg-transparent"
                  }`}
                >
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <select
                    className="w-full pl-10 pr-3 py-3 bg-transparent text-white text-sm placeholder-white/40 focus:outline-none appearance-none cursor-pointer"
                    style={{ fontWeight: 300, letterSpacing: "0.01em" }}
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

              {/* Search Button */}
              <motion.button
                className="col-span-2 md:col-span-1 relative rounded-lg bg-[#00c389]/90 backdrop-blur-sm text-white py-3 overflow-hidden border border-[#00c389]/20"
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(0, 195, 128, 1)",
                }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span className="relative flex items-center justify-center gap-2 text-sm" style={{ fontWeight: 500, letterSpacing: "0.01em" }}>
                  <Search className="w-4 h-4" strokeWidth={2} />
                  Keresés
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
