import { motion, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { Users, Award, MapPin, Star, Quote, Shield } from "lucide-react";
import GoogleRatingBadge from "./GoogleRatingBadge";

interface Stat {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  {
    icon: <Users className="w-7 h-7" />,
    value: 10000,
    suffix: "+",
    label: "Elégedett utas",
  },
  {
    icon: <Award className="w-7 h-7" />,
    value: 15,
    suffix: " év",
    label: "Tapasztalat",
  },
  {
    icon: <MapPin className="w-7 h-7" />,
    value: 100,
    suffix: "+",
    label: "Utazás évente",
  },
  {
    icon: <Star className="w-7 h-7" />,
    value: 4.9,
    suffix: "/5",
    label: "Értékelés",
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
    text: "Fantasztikus élmény volt! A szervezés tökéletes, az útvonal gyönyörű, és az utazás kényelmes. Mindenképpen ajánlom mindenkinek!",
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "Nagy Péter",
    location: "Debrecen",
    rating: 5,
    text: "Profi csapat, kiváló programok. A horvát tengerpart csodálatos volt, és minden percét élveztük. Köszönjük!",
    image: "https://i.pravatar.cc/150?img=13",
  },
  {
    id: "3",
    name: "Szabó Mária",
    location: "Szeged",
    rating: 5,
    text: "Már harmadszor utazunk velük, és minden alkalommal ugyanolyan kiváló élményben volt részünk. Csak ajánlani tudom!",
    image: "https://i.pravatar.cc/150?img=5",
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
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
        setCount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-gray-900" style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
      {value < 10 && value % 1 !== 0 ? count.toFixed(1) : count.toLocaleString("hu-HU")}
      {suffix}
    </div>
  );
}

export default function TrustSection() {
  const [currentReview, setCurrentReview] = useState(0);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-40 bg-gradient-to-b from-white via-[#f8fafc] to-white overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-20 left-[10%] w-96 h-96 bg-gradient-to-br from-[#00c389]/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-gradient-to-tl from-blue-500/5 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
        {/* Trust Header with Google Badge */}
        <motion.div
          className="flex flex-col items-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GoogleRatingBadge />

          {/* Trust indicators */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 mt-8"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-4 h-4 text-[#00c389]" strokeWidth={2} />
              <span className="text-sm font-medium">Biztonságos foglalás</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-600">
              <Star className="w-4 h-4 text-[#00c389]" strokeWidth={2} />
              <span className="text-sm font-medium">Kiváló minősítés</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-600">
              <Award className="w-4 h-4 text-[#00c389]" strokeWidth={2} />
              <span className="text-sm font-medium">15 év tapasztalat</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="relative bg-white/80 backdrop-blur-sm rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,195,128,0.12)] transition-all duration-500 border border-gray-100/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              onMouseEnter={() => setHoveredStat(index)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              {/* Icon with subtle animation */}
              <motion.div
                className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 mb-4 overflow-hidden border border-[#00c389]/10"
                animate={{
                  scale: hoveredStat === index ? 1.08 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="text-[#00c389] relative z-10">{stat.icon}</div>
              </motion.div>

              {/* Counter */}
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />

              {/* Label */}
              <p className="text-gray-600 mt-2" style={{ fontSize: "0.9375rem", fontWeight: 500 }}>
                {stat.label}
              </p>

              {/* Subtle divider */}
              <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#00c389]/20 to-transparent" />

              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 rounded-[24px] pointer-events-none"
                animate={{
                  boxShadow:
                    hoveredStat === index
                      ? "inset 0 0 0 1.5px rgba(0, 195, 128, 0.12)"
                      : "inset 0 0 0 0px rgba(0, 195, 128, 0)",
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          className="text-center mb-12"
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
            Mit mondanak{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              utasaink
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Valódi vélemények elégedett utazóinktól
          </p>
        </motion.div>

        {/* Review Slider */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `-${currentReview * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="min-w-full px-4">
                  <motion.div
                    className="relative bg-white/90 backdrop-blur-sm rounded-[24px] p-10 md:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-100/70"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {/* Floating quote icon */}
                    <motion.div
                      className="absolute top-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 flex items-center justify-center"
                      animate={{
                        rotate: [0, 5, 0, -5, 0],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Quote className="w-7 h-7 text-[#00c389]" strokeWidth={2} />
                    </motion.div>

                    {/* Profile */}
                    <div className="flex items-center gap-5 mb-6">
                      <motion.img
                        src={review.image}
                        alt={review.name}
                        className="w-16 h-16 rounded-full border-4 border-[#00c389]/20 shadow-md"
                        whileHover={{ scale: 1.1 }}
                      />
                      <div className="text-left">
                        <h4
                          className="text-gray-900"
                          style={{ fontSize: "1.125rem", fontWeight: 700 }}
                        >
                          {review.name}
                        </h4>
                        <p className="text-gray-500 text-sm">{review.location}</p>
                      </div>

                      {/* Star ratings */}
                      <div className="ml-auto flex gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <Star className="w-5 h-5 fill-[#00c389] text-[#00c389]" />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Subtle divider */}
                    <div className="w-16 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent mb-6 opacity-40" />

                    {/* Review text */}
                    <p className="text-gray-700 text-lg leading-relaxed">
                      "{review.text}"
                    </p>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Animated slider dots */}
          <div className="flex justify-center gap-2 mt-10">
            {reviews.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentReview(index)}
                className={`h-2 rounded-full transition-all ${
                  currentReview === index
                    ? "w-8 bg-gradient-to-r from-[#00c389] to-[#16b8ff]"
                    : "w-2 bg-gray-300"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: currentReview === index ? [1, 1.1, 1] : 1,
                }}
                transition={
                  currentReview === index
                    ? { duration: 0.5, repeat: Infinity, repeatDelay: 4 }
                    : {}
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
