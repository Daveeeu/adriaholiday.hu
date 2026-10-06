import { motion, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import {
  ArrowRight,
  Award,
  Star,
  Shield,
} from "lucide-react";
import { Link } from "react-router";

import GoogleRatingBadge from "./GoogleRatingBadge";
import TestimonialCarousel from "./TestimonialCarousel";
import { renderContentIcon } from "../content/icon-map";
import { EditablePortfolioHeading } from "../content/PortfolioHeading";
import { usePortfolioContent } from "../content/PortfolioContentProvider";

interface Stat {
  icon: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

const statsFallback: Stat[] = [
  {
    icon: "users",
    value: 10000,
    suffix: "+",
    label: "Elégedett utas",
    description: "Akik már velünk utaztak Európa legszebb helyeire.",
  },
  {
    icon: "award",
    value: 22,
    suffix: "+ év",
    label: "Tapasztalat",
    description: "Több mint 22 éve szervezünk utazásokat.",
  },
  {
    icon: "mapPin",
    value: 100,
    suffix: "+",
    label: "Utazás évente",
    description: "Folyamatos indulások egész évben.",
  },
  {
    icon: "star",
    value: 4.9,
    suffix: "/5",
    label: "Értékelés",
    description: "Valódi utasvélemények alapján kiemelkedő élmény.",
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 1700;
    const steps = 55;
    const increment = value / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;

      if (currentStep >= steps) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(increment * currentStep);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div
      ref={ref}
      className="text-[#0f172a]"
      style={{
        fontSize: "clamp(2.1rem,3.4vw,3.25rem)",
        fontWeight: 760,
        letterSpacing: "-0.045em",
        lineHeight: 1,
      }}
    >
      {value < 10 && value % 1 !== 0
        ? count.toFixed(1)
        : Math.floor(count).toLocaleString("hu-HU")}
      {suffix}
    </div>
  );
}

export default function TrustSection() {
  const { getValue } = usePortfolioContent();
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  const stats = getValue("home.trust.stats", statsFallback) as Stat[];

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-[#f5fffb] via-[#fbfdff] to-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-[8%] w-[440px] h-[440px] bg-gradient-to-br from-[#00c389]/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-6 right-[6%] w-[460px] h-[460px] bg-gradient-to-tl from-[#16b8ff]/8 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1450px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <GoogleRatingBadge />

          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mt-5 rounded-full bg-white/75 border border-gray-100 px-5 py-3 shadow-[0_12px_38px_rgba(15,23,42,0.05)]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-4 h-4 text-[#00c389]" />
              <span className="text-sm font-medium">Biztonságos foglalás</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-600">
              <Star className="w-4 h-4 text-[#00c389]" />
              <span className="text-sm font-medium">Kiváló minősítés</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-600">
              <Award className="w-4 h-4 text-[#00c389]" />
              <span className="text-sm font-medium">22+ év tapasztalat</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-14 items-start"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`group relative bg-white/92 backdrop-blur-xl rounded-[28px] p-6 border border-gray-100 overflow-hidden shadow-[0_12px_42px_rgba(15,23,42,0.06)] hover:shadow-[0_22px_65px_rgba(0,195,137,0.14)] transition-all duration-500 ${
                index % 2 === 1 ? "xl:translate-y-4" : ""
              }`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: index % 2 === 1 ? 8 : -8 }}
              onMouseEnter={() => setHoveredStat(index)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="flex items-start justify-between gap-4 mb-5">
                <motion.div
                  className="relative inline-flex items-center justify-center w-14 h-14 rounded-[20px] bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 border border-[#00c389]/10"
                  animate={{
                    scale: hoveredStat === index ? 1.08 : 1,
                    rotate: hoveredStat === index ? 4 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="text-[#00c389]">{renderContentIcon(stat.icon, "w-6 h-6")}</div>
                </motion.div>

                <span className="text-[11px] font-bold tracking-[0.2em] text-gray-300">
                  0{index + 1}
                </span>
              </div>

              <div className="mb-3">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>

              <h3 className="text-[#0f172a] text-lg font-bold mb-2">
                {stat.label}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed">
                {stat.description}
              </p>

              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#00c389] to-[#16b8ff]" />
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-8 items-center">
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00c389]/8 text-[#00a878] text-sm font-bold mb-5">
              <span className="w-2 h-2 rounded-full bg-[#00c389]" />
              UTASVÉLEMÉNYEK
            </div>

            <div className="mb-4">
              <EditablePortfolioHeading
                fieldKey="home.trust.titleParts"
                fallbackParts={[
                  { text: "Mit mondanak" },
                  { text: "utasaink?", variant: "gradient" },
                ]}
                as="h2"
                mode="inline"
                className="m-0 text-[#0f172a]"
                style={{
                  fontSize: "clamp(2rem,4vw,3rem)",
                  fontWeight: 760,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.08,
                }}
              />
            </div>

            <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
              Valódi élmények valódi utazóktól — a bizalom nálunk nem csak ígéret.
            </p>

            <Link
              to="/rolunk-irtak"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-full bg-white border border-gray-200 text-[#0f172a] font-semibold shadow-sm hover:border-[#00c389]/40 hover:text-[#00a878] transition-colors"
            >
              Összes levél
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <TestimonialCarousel />
        </div>
      </div>
    </section>
  );
}
