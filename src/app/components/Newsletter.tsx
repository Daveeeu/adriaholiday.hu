import { motion } from "motion/react";
import {
  Mail,
  Send,
  Gift,
  Zap,
  Globe,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import Lottie from "lottie-react";
import worldMapAnimation from "../../imports/World_map_pinging_and_searching.json";

const benefits = [
  {
    icon: <Gift className="w-5 h-5" strokeWidth={2} />,
    title: "Last Minute utak",
    description: "A legjobb ajánlatokat elsőként küldjük.",
  },
  {
    icon: <Zap className="w-5 h-5" strokeWidth={2} />,
    title: "Exkluzív kedvezmények",
    description: "Csak feliratkozóknak elérhető akciók.",
  },
  {
    icon: <Globe className="w-5 h-5" strokeWidth={2} />,
    title: "Új úti célok",
    description: "Friss inspirációk Európa legszebb helyeiről.",
  },
];

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section className="relative py-20 md:py-24 bg-gradient-to-b from-[#f7fbff] via-white to-[#f5fffb] overflow-hidden">
      {/* Soft light background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-[#16b8ff]/7 rounded-full blur-3xl" />
        <div className="absolute bottom-[-180px] right-[8%] w-[560px] h-[560px] bg-[#00c389]/7 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1250px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div
          className="relative rounded-[42px] overflow-hidden border border-white/70 bg-gradient-to-br from-[#132238] via-[#101d31] to-[#0b1628] shadow-[0_30px_100px_rgba(15,23,42,0.22)]"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Inner premium glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-[#16b8ff]/[0.12]" />
          <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] bg-[#00c389]/16 rounded-full blur-3xl" />
          <div className="absolute bottom-[-140px] right-[-120px] w-[480px] h-[480px] bg-[#16b8ff]/16 rounded-full blur-3xl" />

          {/* Subtle dotted texture */}
          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,.7) 1px, transparent 0)",
              backgroundSize: "44px 44px",
            }}
          />

          {/* Background Lottie */}
          <motion.div
            className="absolute -right-44 top-[-120px] w-[650px] h-[650px] opacity-[0.13]"
            initial={{ scale: 0.96 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4 }}
          >
            <Lottie animationData={worldMapAnimation} loop className="w-full h-full" />
          </motion.div>

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center p-7 md:p-10 lg:p-12">
            {/* Left content */}
            <div>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 text-[#60ffd0] border border-white/10 font-semibold text-sm mb-5"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
              >
                <Sparkles className="w-4 h-4" />
                HÍRLEVÉL
              </motion.div>

              <motion.h2
                className="text-white mb-5"
                style={{
                  fontSize: "clamp(2.25rem, 4.6vw, 4rem)",
                  fontWeight: 760,
                  letterSpacing: "-0.05em",
                  lineHeight: 1.04,
                }}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Ne maradj le a{" "}
                <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
                  következő élményről!
                </span>
              </motion.h2>

              <motion.p
                className="text-white/72 text-lg leading-relaxed max-w-2xl mb-7"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.28 }}
              >
                Last minute ajánlatok, exkluzív kedvezmények és új utazási
                inspirációk — elsőként a postaládádban.
              </motion.p>

              {/* Form */}
              <motion.div
                className="relative max-w-2xl mb-4"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.36 }}
              >
                <motion.div
                  className={`relative rounded-[24px] bg-white border shadow-[0_16px_50px_rgba(0,0,0,0.18)] transition-all ${
                    isFocused
                      ? "border-[#00c389] shadow-[0_18px_54px_rgba(0,195,137,0.20)]"
                      : "border-white/40"
                  }`}
                  animate={{ scale: isFocused ? 1.01 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="email"
                    placeholder="Add meg az email címed"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full pl-14 pr-44 py-5 bg-transparent text-gray-900 placeholder-gray-400 rounded-[24px] focus:outline-none"
                  />

                  <motion.button
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-5 md:px-6 py-3.5 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white rounded-[18px] flex items-center gap-2 shadow-[0_8px_24px_rgba(0,195,137,0.25)]"
                    whileHover={{
                      scale: 1.04,
                      boxShadow: "0 12px 32px rgba(0,195,137,0.35)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-semibold hidden sm:inline">
                      Feliratkozás
                    </span>
                    <Send className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex items-start sm:items-center gap-2 text-white/58 text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.48 }}
              >
                <ShieldCheck className="w-4 h-4 text-[#60ffd0] shrink-0 mt-0.5 sm:mt-0" />
                <span>
                  Az email címed biztonságban van. Nincs spam, csak hasznos
                  utazási inspiráció.
                </span>
              </motion.div>
            </div>

            {/* Right benefits */}
            <motion.div
              className="grid grid-cols-1 gap-3"
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.32, duration: 0.7 }}
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className="group relative bg-white/[0.065] backdrop-blur-xl rounded-[24px] p-5 border border-white/[0.08] hover:bg-white/[0.10] shadow-[0_10px_34px_rgba(0,0,0,0.10)] transition-all duration-500 overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45 + index * 0.1 }}
                  whileHover={{ x: -5 }}
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-[#00c389]/12 to-[#16b8ff]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-center justify-between gap-5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[18px] bg-white/[0.08] text-[#60ffd0] flex items-center justify-center shrink-0 border border-white/[0.10]">
                        {benefit.icon}
                      </div>

                      <div>
                        <h4 className="text-white text-lg font-bold mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-white/56 text-sm leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#60ffd0] opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>

                  <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#00c389] to-[#16b8ff] opacity-55" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}