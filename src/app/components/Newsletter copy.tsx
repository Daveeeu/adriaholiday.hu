import { motion } from "motion/react";
import { Mail, Send, Gift, Zap, Globe, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import Lottie from "lottie-react";
import worldMapAnimation from "../../imports/World_map_pinging_and_searching.json";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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

  return (
    <section className="relative py-18 md:py-20 bg-gradient-to-b from-white via-[#f8fafc] to-white overflow-hidden">
      <div className="absolute top-0 left-[8%] w-[520px] h-[520px] bg-gradient-to-br from-[#00c389]/8 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-[8%] w-[520px] h-[520px] bg-gradient-to-tl from-[#16b8ff]/8 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-[1250px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div
          className="relative rounded-[40px] overflow-hidden border border-white/80 bg-white/90 backdrop-blur-3xl shadow-[0_24px_90px_rgba(15,23,42,0.10)]"
          initial={{ opacity: 1, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#eefcff]" />

          <motion.div
            className="absolute -right-32 top-[-80px] w-[620px] h-[620px] opacity-[0.16]"
            initial={{ opacity: 1, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          >
            <Lottie animationData={worldMapAnimation} loop className="w-full h-full" />
          </motion.div>

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center p-7 md:p-10 lg:p-12">
            <div>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00c389]/8 text-[#00a878] font-semibold text-sm mb-4"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
              >
                <Sparkles className="w-4 h-4" />
                HÍRLEVÉL
              </motion.div>

              <motion.h2
                className="text-[#0f172a] mb-4"
                style={{
                  fontSize: "clamp(2.25rem, 4.5vw, 4rem)",
                  fontWeight: 750,
                  letterSpacing: "-0.045em",
                  lineHeight: 1.06,
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
                className="text-gray-600 text-lg leading-relaxed max-w-2xl mb-6"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.28 }}
              >
                Last minute ajánlatok, exkluzív kedvezmények és új utazási
                inspirációk — elsőként a postaládádban.
              </motion.p>

              <motion.div
                className="relative max-w-2xl mb-4"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.36 }}
              >
                <motion.div
                  className={`relative rounded-[24px] bg-white border shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-all ${
                    isFocused
                      ? "border-[#00c389] shadow-[0_16px_48px_rgba(0,195,137,0.16)]"
                      : "border-gray-200"
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3.5 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white rounded-[18px] flex items-center gap-2 shadow-[0_8px_24px_rgba(0,195,137,0.25)]"
                    whileHover={{
                      scale: 1.04,
                      boxShadow: "0 12px 32px rgba(0,195,137,0.35)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-semibold">Feliratkozás</span>
                    <Send className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 text-gray-500 text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.48 }}
              >
                <ShieldCheck className="w-4 h-4 text-[#00c389]" />
                Az email címed biztonságban van. Nincs spam, csak hasznos utazási inspiráció.
              </motion.div>
            </div>

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
                  className="group relative bg-white/85 backdrop-blur-xl rounded-[24px] p-5 border border-gray-100 shadow-[0_10px_34px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_48px_rgba(0,195,137,0.13)] transition-all duration-500 overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45 + index * 0.1 }}
                  whileHover={{ x: -6 }}
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 text-[#00c389] flex items-center justify-center shrink-0">
                      {benefit.icon}
                    </div>

                    <div>
                      <h4 className="text-[#0f172a] text-lg font-bold mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#00c389] to-[#16b8ff] opacity-70" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}