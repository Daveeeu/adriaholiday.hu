import { motion } from "motion/react";
import { ArrowRight, MapPin, Calendar, Clock, DollarSign, Search, Sparkles } from "lucide-react";
import { useState } from "react";

export default function PremiumHero() {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1764956607632-0aeeaae38e1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
          alt="Adriatic Coast"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/70 via-[#0A1628]/60 to-[#0A1628]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/50 to-transparent" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: i % 3 === 0 ? "#00c389" : i % 3 === 1 ? "#16b8ff" : "#ffffff",
              opacity: 0.3,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Animated Bus Scene */}
      <motion.div
        className="absolute top-1/2 left-0 z-20 -translate-y-1/2"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: "45vw", opacity: 1 }}
        transition={{
          duration: 2.5,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.5,
        }}
      >
        <div className="relative">
          {/* Glowing trail */}
          <motion.div
            className="absolute top-1/2 right-full mr-6 h-1 bg-gradient-to-r from-transparent via-[#00c389] to-[#00c389] shadow-[0_0_20px_rgba(0,195,128,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 1.5, delay: 0.8 }}
          >
            {/* Arrow transformation */}
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 }}
            >
              <svg width="30" height="30" viewBox="0 0 30 30">
                <defs>
                  <filter id="arrowGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M 5 15 L 20 15 M 15 10 L 20 15 L 15 20"
                  stroke="#00c389"
                  strokeWidth="3"
                  fill="none"
                  filter="url(#arrowGlow)"
                />
              </svg>
            </motion.div>

            {/* Destination pins */}
            {[0.3, 0.6, 0.9].map((position, idx) => (
              <motion.div
                key={idx}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${position * 100}%` }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + idx * 0.2 }}
              >
                <div className="relative">
                  <MapPin className="w-5 h-5 text-[#00c389] drop-shadow-[0_0_8px_rgba(0,195,128,0.8)]" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#00c389]/30"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Modern Luxury Bus SVG */}
          <motion.svg
            width="160"
            height="80"
            viewBox="0 0 160 80"
            className="drop-shadow-2xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <defs>
              <linearGradient id="busGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00c389" />
                <stop offset="100%" stopColor="#16b8ff" />
              </linearGradient>
              <filter id="busGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Bus body */}
            <rect x="20" y="25" width="120" height="35" rx="5" fill="url(#busGradient)" filter="url(#busGlow)" />

            {/* Windows */}
            <rect x="30" y="30" width="18" height="15" rx="2" fill="#E0F2FE" opacity="0.9" />
            <rect x="52" y="30" width="18" height="15" rx="2" fill="#E0F2FE" opacity="0.9" />
            <rect x="74" y="30" width="18" height="15" rx="2" fill="#E0F2FE" opacity="0.9" />
            <rect x="96" y="30" width="18" height="15" rx="2" fill="#E0F2FE" opacity="0.9" />
            <rect x="118" y="30" width="18" height="15" rx="2" fill="#E0F2FE" opacity="0.9" />

            {/* Front details */}
            <rect x="135" y="35" width="5" height="20" rx="2" fill="#1E293B" />

            {/* Headlights */}
            <motion.circle
              cx="135"
              cy="38"
              r="4"
              fill="#FCD34D"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.circle
              cx="135"
              cy="50"
              r="4"
              fill="#FCD34D"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />

            {/* Wheels */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "45px 65px" }}
            >
              <circle cx="45" cy="65" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
              <circle cx="45" cy="65" r="4" fill="#64748B" />
            </motion.g>
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "115px 65px" }}
            >
              <circle cx="115" cy="65" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
              <circle cx="115" cy="65" r="4" fill="#64748B" />
            </motion.g>

            {/* Premium stripe */}
            <line x1="25" y1="47" x2="130" y2="47" stroke="#00c389" strokeWidth="2" opacity="0.6" />
          </motion.svg>

          {/* Floating info badge */}
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-xl whitespace-nowrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
          >
            <div className="flex items-center gap-2 text-white text-sm">
              <Sparkles className="w-4 h-4 text-[#00c389]" />
              <span style={{ fontWeight: 600 }}>Kiváló ajánlatok • Már csak pár hely!</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-30 h-screen flex flex-col items-center justify-center px-4 md:px-8">
        <motion.div
          className="text-center max-w-5xl mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.h1
            className="mb-6 text-white"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 6rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Fedezd fel Európa{" "}
            <span className="bg-gradient-to-r from-[#00c389] via-[#00e89d] to-[#16b8ff] bg-clip-text text-transparent">
              legszebb tájait!
            </span>
          </motion.h1>

          <motion.p
            className="mb-10 text-white/90 max-w-3xl mx-auto"
            style={{
              fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              fontWeight: 400,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Tengerparti utak, körutazások és prémium élmények egész Európában.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <motion.button
              className="group relative px-10 py-5 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,195,128,0.3)]"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 60px rgba(0,195,128,0.5)",
                y: -4
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />

              <span className="relative flex items-center gap-3" style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                Utazások felfedezése
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              className="group relative px-10 py-5 bg-white/10 backdrop-blur-md text-white rounded-2xl border-2 border-white/30 overflow-hidden shadow-xl"
              whileHover={{
                scale: 1.05,
                borderColor: "rgba(0,195,128,0.5)",
                backgroundColor: "rgba(0,195,128,0.1)",
                y: -4
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#00c389]/20 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              <span className="relative flex items-center gap-3" style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Calendar className="w-6 h-6" />
                </motion.div>
                Last Minute ajánlatok
              </span>

              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00c389] to-[#16b8ff] rounded-full"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: "left" }}
              />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          {[
            { value: "10 000+", label: "elégedett utas" },
            { value: "15+", label: "év tapasztalat" },
            { value: "150+", label: "úti cél" },
            { value: "100%", label: "kényelmes utazás" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="relative p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + idx * 0.1 }}
              whileHover={{
                y: -4,
                backgroundColor: "rgba(0,195,128,0.1)",
                borderColor: "rgba(0,195,128,0.3)",
              }}
            >
              <motion.div
                className="text-[#00c389] mb-2"
                style={{ fontSize: "2rem", fontWeight: 800 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 + idx * 0.1, type: "spring" }}
              >
                {stat.value}
              </motion.div>
              <div className="text-white/80 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modern Search Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-40 pb-8 px-4 md:px-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {/* Destination */}
              <div className="col-span-2 md:col-span-1">
                <motion.div
                  className={`relative rounded-xl border-2 transition-all ${
                    focusedField === "destination"
                      ? "border-[#00c389] shadow-[0_0_20px_rgba(0,195,128,0.3)]"
                      : "border-white/20"
                  }`}
                  animate={{ scale: focusedField === "destination" ? 1.02 : 1 }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Úti cél"
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none"
                    onFocus={() => setFocusedField("destination")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </div>

              {/* Departure */}
              <div className="col-span-2 md:col-span-1">
                <motion.div
                  className={`relative rounded-xl border-2 transition-all ${
                    focusedField === "departure"
                      ? "border-[#00c389] shadow-[0_0_20px_rgba(0,195,128,0.3)]"
                      : "border-white/20"
                  }`}
                  animate={{ scale: focusedField === "departure" ? 1.02 : 1 }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Indulás"
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none"
                    onFocus={() => setFocusedField("departure")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </div>

              {/* Date */}
              <div className="col-span-1">
                <motion.div
                  className={`relative rounded-xl border-2 transition-all ${
                    focusedField === "date"
                      ? "border-[#00c389] shadow-[0_0_20px_rgba(0,195,128,0.3)]"
                      : "border-white/20"
                  }`}
                  animate={{ scale: focusedField === "date" ? 1.02 : 1 }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="date"
                    placeholder="Dátum"
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none"
                    onFocus={() => setFocusedField("date")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </div>

              {/* Duration */}
              <div className="col-span-1">
                <motion.div
                  className={`relative rounded-xl border-2 transition-all ${
                    focusedField === "duration"
                      ? "border-[#00c389] shadow-[0_0_20px_rgba(0,195,128,0.3)]"
                      : "border-white/20"
                  }`}
                  animate={{ scale: focusedField === "duration" ? 1.02 : 1 }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
                    <Clock className="w-5 h-5" />
                  </div>
                  <select
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none appearance-none cursor-pointer"
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
                  className={`relative rounded-xl border-2 transition-all ${
                    focusedField === "budget"
                      ? "border-[#00c389] shadow-[0_0_20px_rgba(0,195,128,0.3)]"
                      : "border-white/20"
                  }`}
                  animate={{ scale: focusedField === "budget" ? 1.02 : 1 }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <select
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none appearance-none cursor-pointer"
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

              {/* Search Button */}
              <motion.button
                className="col-span-2 md:col-span-1 relative rounded-xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white py-4 overflow-hidden shadow-[0_0_30px_rgba(0,195,128,0.4)]"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 50px rgba(0,195,128,0.6)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative flex items-center justify-center gap-2" style={{ fontWeight: 700 }}>
                  <Search className="w-5 h-5" />
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
