import { motion } from "motion/react";
import { Mail, Send, Gift, Zap, Globe } from "lucide-react";
import { useState } from "react";
import Lottie from "lottie-react";
import worldMapAnimation from "../../imports/World_map_pinging_and_searching.json";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const benefits = [
    {
      icon: <Gift className="w-5 h-5" strokeWidth={2} />,
      title: "Last Minute ajánlatok",
      description: "Exkluzív kedvezmények elsőként",
    },
    {
      icon: <Zap className="w-5 h-5" strokeWidth={2} />,
      title: "Exkluzív kedvezmények",
      description: "Csak feliratkozóknak",
    },
    {
      icon: <Globe className="w-5 h-5" strokeWidth={2} />,
      title: "Új úti célok",
      description: "Friss utazási lehetőségek",
    },
  ];

  return (
    <section className="relative py-40 bg-gradient-to-b from-white via-[#f8fafc] to-white overflow-hidden">
      {/* World Map Pinging Animation - Cinematic Background */}
      <motion.div
        className="absolute top-0 right-0 w-[700px] h-[700px] opacity-15 blur-[2px]"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 0.15, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-[#00c389]/8 to-transparent rounded-full blur-3xl" />
        <Lottie
          animationData={worldMapAnimation}
          loop={true}
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 0 60px rgba(0, 195, 137, 0.1))" }}
        />
      </motion.div>

      {/* Mediterranean background texture */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #00c389 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Soft Mediterranean light */}
      <div className="absolute top-0 left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-[#00c389]/6 via-[#16b8ff]/4 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-[10%] w-[600px] h-[600px] bg-gradient-to-tl from-[#16b8ff]/6 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-8 md:px-12 lg:px-20">
        <motion.div
          className="relative bg-white/95 backdrop-blur-3xl rounded-[32px] p-12 md:p-16 border border-white/70 shadow-[0_12px_48px_rgba(15,23,42,0.08)] overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Floating warm Mediterranean light inside card */}
          <motion.div
            className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-[#00c389]/12 to-[#16b8ff]/8 rounded-full blur-3xl"
            animate={{
              x: [0, 25, 0],
              y: [0, 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="relative text-center">
            {/* Icon */}
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00c389] to-[#16b8ff] rounded-2xl mb-6 shadow-lg"
              animate={{
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Mail className="w-7 h-7 text-white" strokeWidth={2} />
            </motion.div>

            {/* Heading */}
            <motion.h2
              className="text-gray-900 mb-4"
              style={{
                fontSize: "clamp(1.875rem, 4vw, 2.5rem)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Ne maradj le a{" "}
              <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
                következő élményről!
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Exkluzív utak, last minute ajánlatok és inspiráló úti célok elsőként
            </motion.p>

            {/* Email Input */}
            <motion.div
              className="relative max-w-xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className={`relative rounded-2xl border-2 bg-white shadow-md transition-all ${
                  isFocused
                    ? "border-[#00c389] shadow-[0_4px_20px_rgba(0,195,128,0.15)]"
                    : "border-gray-200"
                }`}
                animate={{
                  scale: isFocused ? 1.01 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="Add meg az email címed"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full pl-14 pr-36 py-4 bg-transparent text-gray-900 placeholder-gray-400 rounded-2xl focus:outline-none"
                  style={{ fontSize: "1rem" }}
                />
                <motion.button
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white rounded-xl flex items-center gap-2 shadow-md"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 4px 20px rgba(0, 195, 128, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Feliratkozás</span>
                  <Send className="w-4 h-4" />
                </motion.button>
              </motion.div>

              {/* Privacy note */}
              <motion.p
                className="mt-4 text-gray-500 text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                Az email címed biztonságban van nálunk. Spam-mentes tartalom!
              </motion.p>
            </motion.div>

            {/* Benefits Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="relative bg-white/80 backdrop-blur-sm rounded-[24px] p-6 border border-gray-100/70 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_28px_rgba(0,195,128,0.12)] transition-all duration-500"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6 }}
                >
                  {/* Icon */}
                  <motion.div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <div className="text-[#00c389]">{benefit.icon}</div>
                  </motion.div>

                  {/* Title */}
                  <h4
                    className="text-gray-900 mb-2"
                    style={{ fontWeight: 700, fontSize: "1rem" }}
                  >
                    {benefit.title}
                  </h4>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Subtle bottom accent */}
                  <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#00c389]/30 to-transparent" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
