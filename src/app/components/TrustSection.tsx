import { motion, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import {
  Award,
  Star,
  Quote,
  Shield,
} from "lucide-react";

import GoogleRatingBadge from "./GoogleRatingBadge";
import { EditableMedia } from "../content/EditableFields";
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
    value: 15,
    suffix: " év",
    label: "Tapasztalat",
    description: "Több mint egy évtizede szervezünk utazásokat.",
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

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

const reviewsFallback: Review[] = [
  {
    id: "1",
    name: "B. Angéla",
    location: "Ausztria körutazás",
    rating: 5,
    text: "Őszinte köszönetemet fejezem ki az ausztriai 4 napos utazásunk megszervezéséért. Minden részlet gördülékenyen volt megszervezve, az idegenvezető fantasztikus volt, a sofőrök pedig végig biztonságos és kényelmes utazást biztosítottak.",
    image: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "2",
    name: "B. Istvánné",
    location: "Bosznia körutazás",
    rating: 5,
    text: "Felejthetetlen csodás napokat töltöttünk el az Önök jóvoltából. A programok, a szállások és az étkezések is kiválóak voltak. Az idegenvezető rendkívül felkészült és segítőkész volt.",
    image: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "3",
    name: "Annamária",
    location: "London repülős út",
    rating: 5,
    text: "Szuperül éreztük magunkat, gyönyörű időt kaptunk és az idegenvezetőnk egy főnyeremény volt. Kedves, türelmes és figyelmes embert ismertünk meg benne. Biztosan nem ez volt az utolsó közös utunk.",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "4",
    name: "H. Katalin",
    location: "Cseh kastélyok",
    rating: 5,
    text: "Rendkívül jól éreztem magam. Az utazás teljesen zökkenőmentes volt, a sofőrök segítőkészek voltak, az idegenvezető pedig óriási tudással és kedvességgel vezette végig az utat.",
    image: "https://i.pravatar.cc/150?img=24",
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
  const [currentReview, setCurrentReview] = useState(0);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  const stats = getValue("home.trust.stats", statsFallback) as Stat[];
  const reviews = getValue("home.trust.reviews", reviewsFallback) as Review[];
  const reviewMedia = reviewsFallback.map((review, index) =>
    getValue(`home.trust.review.${index + 1}.image`, {
      url: review.image,
      alt: review.name,
      title: review.name,
    }) as { url?: string; alt?: string; title?: string },
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews.length]);

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
              <span className="text-sm font-medium">15 év tapasztalat</span>
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
          </motion.div>

          <div className="relative overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `-${currentReview * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {reviews.map((review, index) => (
                <div key={`${review.name}-${index}`} className="min-w-full px-1 md:px-4">
                  <motion.div
                    className="relative bg-white/92 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_12px_44px_rgba(15,23,42,0.08)]"
                    whileHover={{ y: -4 }}
                  >
                    <div className="absolute top-7 right-7 w-14 h-14 rounded-full bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 flex items-center justify-center">
                      <Quote className="w-6 h-6 text-[#00c389]" />
                    </div>

                    <div className="flex items-center gap-5 mb-6 pr-16">
                      <EditableMedia
                        fieldKey={`home.trust.review.${index + 1}.image`}
                        fallback={{
                          url: reviewMedia[index]?.url ?? review.image,
                          alt: reviewMedia[index]?.alt ?? review.name,
                          title: reviewMedia[index]?.title ?? review.name,
                        }}
                        className="shrink-0"
                        mediaClassName="w-16 h-16 rounded-full border-4 border-[#00c389]/15 object-cover"
                      />

                      <div>
                        <h4 className="text-[#0f172a] text-lg font-bold">
                          {review.name}
                        </h4>
                        <p className="text-gray-500 text-sm">{review.location}</p>
                      </div>

                      <div className="ml-auto hidden sm:flex gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-[#00c389] text-[#00c389]"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="w-20 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent opacity-50 mb-6" />

                    <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                      "{review.text}"
                    </p>
                  </motion.div>
                </div>
              ))}
            </motion.div>

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
      </div>
    </section>
  );
}
