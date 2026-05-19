import { motion, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import {
  Users,
  Award,
  MapPin,
  Star,
  Quote,
  Shield,
} from "lucide-react";
import GoogleRatingBadge from "./GoogleRatingBadge";

interface Stat {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

const stats: Stat[] = [
  {
    icon: <Users className="w-7 h-7" />,
    value: 10000,
    suffix: "+",
    label: "Elégedett utas",
    description:
      "Akik már velünk utaztak Európa legszebb helyeire.",
  },
  {
    icon: <Award className="w-7 h-7" />,
    value: 15,
    suffix: " év",
    label: "Tapasztalat",
    description:
      "Több mint egy évtizede szervezünk prémium utakat.",
  },
  {
    icon: <MapPin className="w-7 h-7" />,
    value: 100,
    suffix: "+",
    label: "Utazás évente",
    description:
      "Folyamatos indulások egész évben.",
  },
  {
    icon: <Star className="w-7 h-7" />,
    value: 4.9,
    suffix: "/5",
    label: "Értékelés",
    description:
      "Valódi utasvélemények alapján kiemelkedő élmény.",
  },
];

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

const reviews: Review[] = [
  {
    id: "1",
    name: "Kovács Anna",
    location: "Budapest",
    rating: 5,
    text: "Fantasztikus élmény volt! A szervezés tökéletes, az útvonal gyönyörű, és az utazás kényelmes.",
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "Nagy Péter",
    location: "Debrecen",
    rating: 5,
    text: "Profi csapat, kiváló programok. A horvát tengerpart csodálatos volt.",
    image: "https://i.pravatar.cc/150?img=13",
  },
  {
    id: "3",
    name: "Szabó Mária",
    location: "Szeged",
    rating: 5,
    text: "Már harmadszor utazunk velük, és minden alkalommal fantasztikus élmény volt.",
    image: "https://i.pravatar.cc/150?img=5",
  },
];

function AnimatedCounter({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
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
        fontSize: "clamp(2.5rem,4vw,3.5rem)",
        fontWeight: 700,
        letterSpacing: "-0.04em",
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
  const [currentReview, setCurrentReview] = useState(0);
  const [hoveredStat, setHoveredStat] = useState<number | null>(
    null
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview(
        (prev) => (prev + 1) % reviews.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-[#f8fafc] to-white overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-20 left-[10%] w-[420px] h-[420px] bg-gradient-to-br from-[#00c389]/6 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-[10%] w-[420px] h-[420px] bg-gradient-to-tl from-[#16b8ff]/6 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <GoogleRatingBadge />

          <motion.div
            className="flex flex-wrap items-center justify-center gap-5 mt-5"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-4 h-4 text-[#00c389]" />
              <span className="text-sm font-medium">
                Biztonságos foglalás
              </span>
            </div>

            <div className="w-px h-4 bg-gray-300" />

            <div className="flex items-center gap-2 text-gray-600">
              <Star className="w-4 h-4 text-[#00c389]" />
              <span className="text-sm font-medium">
                Kiváló minősítés
              </span>
            </div>

            <div className="w-px h-4 bg-gray-300" />

            <div className="flex items-center gap-2 text-gray-600">
              <Award className="w-4 h-4 text-[#00c389]" />
              <span className="text-sm font-medium">
                15 év tapasztalat
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* PREMIUM STATS */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="group relative bg-white/90 backdrop-blur-xl rounded-[28px] p-6 border border-gray-100 overflow-hidden shadow-[0_10px_40px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_60px_rgba(0,195,137,0.14)] transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8 }}
              onMouseEnter={() => setHoveredStat(index)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              {/* Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Icon */}
              <motion.div
                className="relative inline-flex items-center justify-center w-14 h-14 rounded-[20px] bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 mb-5 border border-[#00c389]/10"
                animate={{
                  scale: hoveredStat === index ? 1.08 : 1,
                  rotate: hoveredStat === index ? 4 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <div className="text-[#00c389]">
                  {stat.icon}
                </div>
              </motion.div>

              {/* Counter */}
              <div className="mb-3">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                />
              </div>

              {/* Label */}
              <h3 className="text-[#0f172a] text-lg font-bold mb-2">
                {stat.label}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed">
                {stat.description}
              </p>

              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#00c389] to-[#16b8ff]" />

              {/* Hover border */}
              <motion.div
                className="absolute inset-0 rounded-[30px] pointer-events-none"
                animate={{
                  boxShadow:
                    hoveredStat === index
                      ? "inset 0 0 0 1.5px rgba(0,195,137,0.12)"
                      : "inset 0 0 0 0px rgba(0,195,137,0)",
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2
            className="text-[#0f172a] mb-4"
            style={{
              fontSize: "clamp(2rem,4vw,3rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Mit mondanak{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              utasaink
            </span>
          </h2>

          <p className="text-gray-600 text-lg">
            Valódi élmények valódi utazóktól
          </p>
        </motion.div>

        {/* Reviews */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{
                x: `-${currentReview * 100}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="min-w-full px-4"
                >
                  <motion.div
                    className="relative bg-white/90 backdrop-blur-xl rounded-[32px] p-10 md:p-14 border border-gray-100 shadow-[0_10px_40px_rgba(15,23,42,0.08)]"
                    whileHover={{ y: -4 }}
                  >
                    {/* Quote */}
                    <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 flex items-center justify-center">
                      <Quote className="w-7 h-7 text-[#00c389]" />
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-5 mb-6">
                      <img
                        src={review.image}
                        alt={review.name}
                        className="w-16 h-16 rounded-full border-4 border-[#00c389]/15"
                      />

                      <div>
                        <h4 className="text-[#0f172a] text-lg font-bold">
                          {review.name}
                        </h4>

                        <p className="text-gray-500 text-sm">
                          {review.location}
                        </p>
                      </div>

                      <div className="ml-auto flex gap-1">
                        {[...Array(review.rating)].map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="w-5 h-5 fill-[#00c389] text-[#00c389]"
                            />
                          )
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-20 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent opacity-50 mb-6" />

                    {/* Text */}
                    <p className="text-gray-700 text-xl leading-relaxed">
                      "{review.text}"
                    </p>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-7">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReview(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentReview === index
                    ? "w-8 bg-gradient-to-r from-[#00c389] to-[#16b8ff]"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}