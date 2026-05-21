// TravelCategories.tsx

import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { categories } from "../data/categories";

interface TravelCategoriesProps {
  onCategorySelect: (category: string) => void;
}

export default function TravelCategories({
  onCategorySelect,
}: TravelCategoriesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getBadgeColor = (badge: string | undefined) => {
    switch (badge) {
      case "Népszerű":
        return "from-[#00c389] to-[#16b8ff]";
      case "Új":
        return "from-[#16b8ff] to-[#00c389]";
      case "Legkedveltebb":
        return "from-[#00c389] to-[#0ea5e9]";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <section className="relative pt-14 pb-20 bg-gradient-to-b from-white via-[#fbfdff] to-[#f7fbff] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8fafc] to-white opacity-60" />

      <div className="relative max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
        {/* HEADER */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="mb-6"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "#0f172a",
              lineHeight: 1.2,
            }}
          >
            Fedezd fel{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              kedvenc úti célod
            </span>
          </h2>

          <p className="text-[#64748b] text-lg max-w-2xl mx-auto leading-relaxed">
            Valós Adria Holiday kategóriák, aktuális utazási kínálattal.
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => onCategorySelect(category.slug)}
              className="group block text-left"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.div
                className="relative bg-white/90 backdrop-blur-sm rounded-[24px] overflow-hidden border border-gray-100/50 shadow-[0_2px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_48px_rgba(0,195,137,0.15)] transition-all duration-500"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              >
                <div className="relative h-72 overflow-hidden">
                  <motion.img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover"
                    animate={{
                      scale: hoveredId === category.id ? 1.08 : 1,
                    }}
                    transition={{
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/75 via-[#0f172a]/25 to-transparent" />

                  {/* BADGE */}
                  {category.badge && (
                    <motion.div
                      className={`absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r ${getBadgeColor(
                        category.badge
                      )} rounded-full shadow-lg backdrop-blur-sm`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 + 0.2 }}
                    >
                      <span className="text-white text-xs font-semibold">
                        {category.badge}
                      </span>
                    </motion.div>
                  )}

                  {/* CONTENT */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3
                      className="text-white mb-2"
                      style={{
                        fontSize: "1.45rem",
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                      }}
                    >
                      {category.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="text-white/80 text-sm font-medium">
                        {category.tripsCount} elérhető ajánlat
                      </div>

                      <motion.div
                        className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center"
                        animate={{
                          x: hoveredId === category.id ? 4 : 0,
                          backgroundColor:
                            hoveredId === category.id
                              ? "rgba(0, 195, 137, 0.9)"
                              : "rgba(255, 255, 255, 0.15)",
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight
                          className="w-4 h-4 text-white"
                          strokeWidth={2.5}
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* GLOW */}
                <motion.div
                  className="absolute inset-0 rounded-[24px] pointer-events-none"
                  animate={{
                    boxShadow:
                      hoveredId === category.id
                        ? "inset 0 0 0 2px rgba(0, 195, 137, 0.2)"
                        : "inset 0 0 0 0px rgba(0, 195, 137, 0)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
