import { motion } from "motion/react";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import FloatingParticles from "./FloatingParticles";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Floating Particles */}
      <FloatingParticles count={30} />

      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A1628]/80 z-10" />
        <img
          src="https://images.unsplash.com/photo-1764956607632-0aeeaae38e1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxhZHJpYXRpYyUyMGNvYXN0JTIwY3JvYXRpYSUyMGJsdWUlMjBzZWElMjBzdW5zZXR8ZW58MXx8fHwxNzc4Nzc5NzYyfDA&ixlib=rb-4.1.0&q=80&w=1920"
          alt="Adriatic Coast"
          className="w-full h-full object-cover"
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl" />
        </motion.div>
      </div>

      {/* Animated Bus */}
      <motion.div
        className="absolute top-1/3 left-0 z-20"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: "40vw", opacity: 1 }}
        transition={{
          duration: 2.5,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.5,
        }}
      >
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <svg
            width="120"
            height="60"
            viewBox="0 0 120 60"
            className="drop-shadow-2xl"
          >
            <defs>
              <linearGradient id="busGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#16b8ff" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Bus body */}
            <rect x="10" y="15" width="100" height="30" rx="4" fill="url(#busGradient)" filter="url(#glow)" />

            {/* Windows */}
            <rect x="20" y="20" width="15" height="12" rx="2" fill="#E0F2FE" opacity="0.9" />
            <rect x="40" y="20" width="15" height="12" rx="2" fill="#E0F2FE" opacity="0.9" />
            <rect x="60" y="20" width="15" height="12" rx="2" fill="#E0F2FE" opacity="0.9" />
            <rect x="80" y="20" width="15" height="12" rx="2" fill="#E0F2FE" opacity="0.9" />

            {/* Headlights */}
            <motion.circle
              cx="105"
              cy="25"
              r="3"
              fill="#FCD34D"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.circle
              cx="105"
              cy="35"
              r="3"
              fill="#FCD34D"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />

            {/* Wheels */}
            <motion.circle
              cx="30"
              cy="50"
              r="8"
              fill="#1E293B"
              stroke="#64748B"
              strokeWidth="2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle
              cx="90"
              cy="50"
              r="8"
              fill="#1E293B"
              stroke="#64748B"
              strokeWidth="2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Travel trail */}
          <motion.div
            className="absolute top-1/2 right-full mr-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: "150px" }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-30 h-full flex flex-col items-center justify-center px-4 md:px-8">
        <motion.div
          className="text-center max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.h1
            className="mb-6 text-white"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Fedezd fel Európát kényelmes
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              buszos utazásokkal
            </span>
          </motion.h1>

          <motion.p
            className="mb-10 text-white/90"
            style={{
              fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Prémium élmények, tengerparti utak, gondtalan szervezés
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <motion.button
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl overflow-hidden shadow-xl"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)" }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative flex items-center gap-2">
                Utazások megtekintése
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              className="group px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Last Minute ajánlatok
              </span>
              <motion.div
                className="mt-1 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 2 },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-2 bg-white rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
