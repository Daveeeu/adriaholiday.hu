import { motion } from "motion/react";
import { Users, MapPin, Bus, Shield, Calendar, Award } from "lucide-react";

const features = [
  {
    icon: <Award className="w-6 h-6" strokeWidth={2} />,
    title: "Saját szervezésű utak",
    description: "Minden utazást mi tervezünk meg gondosan",
  },
  {
    icon: <Users className="w-6 h-6" strokeWidth={2} />,
    title: "Magyar idegenvezetők",
    description: "Profi kísérők magyarul végig az úton",
  },
  {
    icon: <Bus className="w-6 h-6" strokeWidth={2} />,
    title: "Kényelmes buszok",
    description: "Modern, klimatizált járművek WiFi-vel",
  },
  {
    icon: <Shield className="w-6 h-6" strokeWidth={2} />,
    title: "Garantált indulások",
    description: "Biztosan elutazhatsz, nem kell aggódni",
  },
  {
    icon: <MapPin className="w-6 h-6" strokeWidth={2} />,
    title: "Több felszállási pont",
    description: "Budapestről és vidékről is indulunk",
  },
  {
    icon: <Calendar className="w-6 h-6" strokeWidth={2} />,
    title: "15 év tapasztalat",
    description: "Megbízhatóság és szakértelem",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-40 bg-white overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-[10%] w-96 h-96 bg-gradient-to-br from-[#00c389]/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-[10%] w-96 h-96 bg-gradient-to-tl from-blue-500/5 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2
            className="text-gray-900 mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Miért az{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              Adria Holiday?
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Gondtalan utazás, professzionális szervezés, felejthetetlen élmények
          </p>
        </motion.div>

        {/* Feature Cards - More Spacious */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-white/85 backdrop-blur-sm rounded-[24px] p-8 border border-gray-100/70 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,195,128,0.15)] transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
            >
              {/* Icon with luxury animation */}
              <motion.div
                className="relative inline-flex items-center justify-center w-14 h-14 rounded-[18px] bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 mb-5 overflow-hidden"
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                {/* Subtle shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.8 }}
                />
                <div className="text-[#00c389] relative z-10">{feature.icon}</div>
              </motion.div>

              {/* Title */}
              <h3
                className="text-gray-900 mb-3"
                style={{ fontSize: "1.125rem", fontWeight: 700 }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-[15px]">
                {feature.description}
              </p>

              {/* Subtle bottom accent */}
              <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#00c389]/30 to-transparent" />

              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 rounded-[24px] pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  boxShadow: "inset 0 0 0 1.5px rgba(0, 195, 128, 0.12)",
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
