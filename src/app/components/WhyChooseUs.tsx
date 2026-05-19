import { motion } from "motion/react";
import Lottie from "lottie-react";
import {
  Users,
  MapPin,
  Bus,
  Shield,
  Calendar,
  Award,
  Heart,
  Star,
  Camera,
  ArrowRight,
} from "lucide-react";

import worldMapAnimation from "../../imports/world map animation.json";

const features = [
  {
    icon: <Award className="w-5 h-5" strokeWidth={2} />,
    title: "Saját szervezésű utak",
    description: "Minden utazást gondosan megtervezünk.",
  },
  {
    icon: <Bus className="w-5 h-5" strokeWidth={2} />,
    title: "Kényelmes buszok",
    description: "Modern, klimatizált járművek, kényelmes utazás.",
  },
  {
    icon: <Users className="w-5 h-5" strokeWidth={2} />,
    title: "Magyar idegenvezetők",
    description: "Tapasztalt kísérők segítenek az út során.",
  },
  {
    icon: <MapPin className="w-5 h-5" strokeWidth={2} />,
    title: "Több felszállási pont",
    description: "Budapestről és vidékről is indulunk.",
  },
  {
    icon: <Shield className="w-5 h-5" strokeWidth={2} />,
    title: "Garantált indulások",
    description: "Biztonságos, kiszámítható utazások.",
  },
  {
    icon: <Calendar className="w-5 h-5" strokeWidth={2} />,
    title: "15 év tapasztalat",
    description: "Megbízható háttér és szakértelem.",
  },
];

const bottomValues = [
  {
    icon: <Heart className="w-5 h-5" strokeWidth={2} />,
    title: "Utazás szívvel-lélekkel",
    text: "Mert mi magunk is szeretünk utazni",
  },
  {
    icon: <Star className="w-5 h-5" strokeWidth={2} />,
    title: "Több mint egy utazás",
    text: "Élmények, barátságok, emlékek",
  },
  {
    icon: <Users className="w-5 h-5" strokeWidth={2} />,
    title: "Közösség és gondoskodás",
    text: "Velünk nem vagy egyedül",
  },
  {
    icon: <Camera className="w-5 h-5" strokeWidth={2} />,
    title: "A pillanatok, amik megmaradnak",
    text: "Ezért utazunk",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative pt-12 pb-14 bg-white overflow-hidden">
      <div className="absolute top-0 left-[8%] w-[420px] h-[420px] bg-gradient-to-br from-[#00c389]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-[8%] w-[420px] h-[420px] bg-gradient-to-tl from-[#16b8ff]/10 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-[1450px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1fr] gap-10 lg:gap-14 items-start">
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#00c389]/8 text-[#00a878] font-semibold text-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-[#00c389]" />
              MIÉRT AZ ADRIA HOLIDAY
            </div>

            <h2
              className="text-[#0f172a] mb-4"
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
                fontWeight: 750,
                letterSpacing: "-0.045em",
                lineHeight: 1.02,
              }}
            >
              Miért{" "}
              <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
                utazz velünk?
              </span>
            </h2>

            <p className="text-gray-600 text-[1.02rem] leading-relaxed max-w-2xl mb-6">
              Kényelmes buszok, gondos szervezés és olyan élmények, amelyekre
              évekkel később is emlékezni fogsz.
            </p>

            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-[#00c389]/25 via-[#00c389]/10 to-transparent" />

              <div className="space-y-2.5">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="relative grid grid-cols-[52px_1fr] gap-4 items-center"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="relative z-10 w-12 h-12 rounded-full bg-white border border-gray-100 shadow-[0_8px_24px_rgba(15,23,42,0.06)] flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00c389] to-[#16b8ff] flex items-center justify-center text-white text-[11px] font-bold">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>

                    <motion.div
                      className="group bg-white rounded-[20px] border border-gray-100 p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.045)] hover:shadow-[0_14px_36px_rgba(0,195,137,0.12)] transition-all duration-500"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-[15px] bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 text-[#00c389] flex items-center justify-center shrink-0">
                            {feature.icon}
                          </div>

                          <div>
                            <h3 className="text-[#0f172a] text-base font-bold mb-0.5">
                              {feature.title}
                            </h3>

                            <p className="text-gray-600 text-sm leading-snug">
                              {feature.description}
                            </p>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-[#00c389] opacity-35 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT VISUAL */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative h-[520px] rounded-[34px] overflow-hidden border border-white/70 bg-gradient-to-br from-[#f7fffc] via-white to-[#f3faff] shadow-[0_24px_70px_rgba(15,23,42,0.11)]">
              <div className="absolute top-[-100px] left-[-100px] w-[260px] h-[260px] bg-[#00c389]/10 blur-3xl rounded-full" />
              <div className="absolute bottom-[-100px] right-[-100px] w-[260px] h-[260px] bg-[#16b8ff]/10 blur-3xl rounded-full" />

              <Lottie
                animationData={worldMapAnimation}
                loop
                autoplay
                className="absolute inset-0 w-full h-full"
                style={{
                  transform: "scale(1.18)",
                  opacity: 0.92,
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/32 pointer-events-none" />

              <motion.div
                className="absolute top-7 right-7 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white rounded-[24px] px-6 py-4 shadow-[0_20px_50px_rgba(0,195,137,0.25)]"
                initial={{ opacity: 0, y: -12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              >
                <div className="flex items-center gap-3.5">
                  <Users className="w-7 h-7" />

                  <div>
                    <div className="text-2xl font-bold leading-none">
                      10 000+
                    </div>

                    <div className="text-sm text-white/85 mt-1">
                      elégedett utas
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-7 left-7 bg-white/92 backdrop-blur-xl rounded-[24px] px-6 py-4 border border-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={{ y: [0, 6, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: 1,
                }}
              >
                <div className="flex items-center gap-3.5">
                  <Award className="w-7 h-7 text-[#00c389]" />

                  <div>
                    <div className="text-2xl font-bold text-[#00c389] leading-none">
                      15 év
                    </div>

                    <div className="text-sm text-gray-600 mt-1">
                      tapasztalat
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-7 right-7 px-5 py-3 rounded-full bg-[#0f172a]/92 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <span className="text-sm font-semibold">
                  Európai élmények gondtalanul
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 rounded-[26px] bg-white/92 border border-gray-100 shadow-[0_16px_50px_rgba(15,23,42,0.06)] overflow-hidden"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {bottomValues.map((item) => (
            <div
              key={item.title}
              className="relative p-5 flex items-center gap-4 border-b md:border-b-0 lg:border-r border-gray-100 last:border-r-0"
            >
              <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 text-[#00c389] flex items-center justify-center shrink-0">
                {item.icon}
              </div>

              <div>
                <h4 className="text-[#0f172a] font-bold text-sm mb-1">
                  {item.title}
                </h4>

                <p className="text-gray-500 text-xs leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}