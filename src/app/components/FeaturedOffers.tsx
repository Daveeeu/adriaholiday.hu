import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Bus, Plane, Hotel, Calendar, Users, MapPin, Sun, Heart, Baby } from "lucide-react";

interface TravelOffer {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  departureDate: string;
  additionalDates?: boolean;
  transport: ("bus" | "plane")[];
  accommodation: string;
  meals: string;
  price: string;
  originalPrice?: string;
  badge?: "Legnépszerűbb" | "Új" | "Last Minute" | "Már csak pár hely";
  featured?: boolean;
  seatsLeft?: number;
  weather?: string;
  tripType?: string;
  tripTypeIcon?: React.ReactNode;
}

const offers: TravelOffer[] = [
  {
    id: "1",
    title: "Horvátország - Dalmácia",
    subtitle: "Kristálytiszta tenger és mediterrán élmények",
    image: "https://images.unsplash.com/photo-1764956607632-0aeeaae38e1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=90",
    departureDate: "június 15",
    additionalDates: true,
    transport: ["bus"],
    accommodation: "3* szálloda",
    meals: "Félpanzió",
    price: "189.900 Ft",
    badge: "Legnépszerűbb",
    featured: true,
    seatsLeft: 8,
    weather: "☀️ 28°C",
    tripType: "Kristálytiszta tenger",
    tripTypeIcon: <Sun className="w-3.5 h-3.5" strokeWidth={2} />,
  },
  {
    id: "2",
    title: "Velence & Verona",
    subtitle: "Romantikus olasz városok hangulata",
    image: "https://images.unsplash.com/photo-1551801319-ca06060f3fcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=90",
    departureDate: "május 24",
    additionalDates: true,
    transport: ["bus"],
    accommodation: "3* szálloda",
    meals: "Reggelivel",
    price: "149.900 Ft",
    badge: "Last Minute",
    originalPrice: "179.900 Ft",
    seatsLeft: 4,
    weather: "☀️ 22°C",
    tripType: "Pároknak ajánlott",
    tripTypeIcon: <Heart className="w-3.5 h-3.5" strokeWidth={2} />,
  },
  {
    id: "3",
    title: "Bled-tó & Ljubljana",
    subtitle: "Alpesi csodák és természeti szépség",
    image: "https://images.unsplash.com/photo-1478088913771-e3a36f50bb63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=90",
    departureDate: "június 8",
    transport: ["bus"],
    accommodation: "3* szálloda",
    meals: "Félpanzió",
    price: "119.900 Ft",
    badge: "Új",
    weather: "🌤️ 24°C",
    tripType: "Családbarát",
    tripTypeIcon: <Baby className="w-3.5 h-3.5" strokeWidth={2} />,
  },
  {
    id: "4",
    title: "Görögország - Chalkidiki",
    subtitle: "Smaragdzöld tenger és fehér homok",
    image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=90",
    departureDate: "július 5",
    additionalDates: true,
    transport: ["plane", "bus"],
    accommodation: "4* szálloda",
    meals: "Félpanzió",
    price: "249.900 Ft",
    badge: "Már csak pár hely",
    seatsLeft: 6,
    weather: "☀️ 32°C",
    tripType: "Naplemente élmény",
    tripTypeIcon: <Sun className="w-3.5 h-3.5" strokeWidth={2} />,
  },
  {
    id: "5",
    title: "Amalfi-part",
    subtitle: "Dél-Olaszország gyöngyszeme",
    image: "https://images.unsplash.com/photo-1681844931449-e0992a27d157?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=90",
    departureDate: "június 22",
    transport: ["bus"],
    accommodation: "4* szálloda",
    meals: "Reggeli + vacsora",
    price: "219.900 Ft",
    badge: "Legnépszerűbb",
    weather: "☀️ 29°C",
    tripType: "Pároknak ajánlott",
    tripTypeIcon: <Heart className="w-3.5 h-3.5" strokeWidth={2} />,
  },
  {
    id: "6",
    title: "Horvátország - Isztria",
    subtitle: "Tengerparti pihenés a Kék Adrián",
    image: "https://images.unsplash.com/photo-1766744406414-cd34a1512eea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=90",
    departureDate: "július 12",
    additionalDates: true,
    transport: ["bus"],
    accommodation: "Apartman",
    meals: "Önellátó",
    price: "159.900 Ft",
    weather: "☀️ 27°C",
    tripType: "Családbarát",
    tripTypeIcon: <Baby className="w-3.5 h-3.5" strokeWidth={2} />,
  },
];

const filters = [
  "Összes ajánlat",
  "Buszos utak",
  "Tengerpart",
  "Körutazások",
  "Last Minute",
  "Országok",
];

export default function FeaturedOffers() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("Összes ajánlat");

  const getBadgeColor = (badge: string | undefined) => {
    switch (badge) {
      case "Legnépszerűbb":
        return "from-[#00c389] to-[#16b8ff]";
      case "Új":
        return "from-blue-500 to-blue-600";
      case "Last Minute":
        return "from-orange-500 to-red-500";
      case "Már csak pár hely":
        return "from-purple-500 to-pink-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <section className="relative py-40 bg-white overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#00c389]/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c389]/5 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-gray-900 mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Kiemelt{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              ajánlataink
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Válassz a legfrissebb utazási lehetőségek közül
          </p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {filters.map((filter) => (
            <motion.button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-5 py-2.5 rounded-full transition-all ${
                selectedFilter === filter
                  ? "bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#00c389]/40 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              style={{ fontSize: "0.875rem", fontWeight: 500 }}
            >
              {filter}
            </motion.button>
          ))}
        </motion.div>

        {/* Masonry Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-min">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              className={`group ${offer.featured ? "md:col-span-2" : ""}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onMouseEnter={() => setHoveredId(offer.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.div
                className="relative bg-white rounded-[32px] overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,195,128,0.15)] transition-all duration-700"
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Luxury hover glow border */}
                <motion.div
                  className="absolute inset-0 rounded-[32px] pointer-events-none"
                  animate={{
                    boxShadow: hoveredId === offer.id
                      ? "inset 0 0 0 2px rgba(0, 195, 137, 0.15)"
                      : "inset 0 0 0 0px rgba(0, 195, 137, 0)",
                  }}
                  transition={{ duration: 0.4 }}
                />
                {/* Image - more immersive height */}
                <div className={`relative overflow-hidden ${offer.featured ? "h-[480px]" : "h-80"}`}>
                  <motion.img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                    animate={{
                      scale: hoveredId === offer.id ? 1.08 : 1,
                    }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />

                  {/* Cinematic gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent" />

                  {/* Subtle animated shimmer on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                      x: hoveredId === offer.id ? ["-100%", "200%"] : "-100%",
                    }}
                    transition={{
                      duration: 1.2,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Small floating map pin accent */}
                  <motion.div
                    className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                  >
                    <MapPin className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </motion.div>

                  {/* Badge - smaller and more elegant */}
                  {offer.badge && (
                    <motion.div
                      className={`absolute top-3 left-3 px-3 py-1 bg-gradient-to-r ${getBadgeColor(
                        offer.badge
                      )} rounded-lg shadow-md`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      animate={
                        offer.badge === "Már csak pár hely"
                          ? { scale: [1, 1.05, 1] }
                          : { opacity: 1, x: 0 }
                      }
                      transition={
                        offer.badge === "Már csak pár hely"
                          ? { duration: 2, repeat: Infinity, delay: index * 0.08 + 0.2 }
                          : { delay: index * 0.08 + 0.2 }
                      }
                    >
                      <span className="text-white text-xs" style={{ fontWeight: 600 }}>
                        {offer.badge}
                      </span>
                    </motion.div>
                  )}

                  {/* Price Badge - elegant and minimal */}
                  <motion.div
                    className="absolute top-3 right-3 px-2.5 py-1.5 bg-gradient-to-br from-[#00c389] to-[#16b8ff] rounded-lg shadow-md"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 + 0.2 }}
                  >
                    {offer.originalPrice && (
                      <p className="text-white/70 text-[9px] line-through">
                        {offer.originalPrice}
                      </p>
                    )}
                    <p className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 700, lineHeight: 1 }}>
                      {offer.price}
                    </p>
                    <p className="text-white/80 text-[9px]">-tól/fő</p>
                  </motion.div>

                  {/* Emotional Trip Type badge - premium styling */}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {/* Trip type badge - more prominent */}
                    {offer.tripType && (
                      <motion.div
                        className="px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-lg flex items-center gap-2 border border-white/40"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08 + 0.4 }}
                      >
                        <div className="text-[#00c389]">{offer.tripTypeIcon}</div>
                        <span className="text-gray-800" style={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.01em" }}>
                          {offer.tripType}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Content - editorial premium */}
                <div className="p-6">
                  {/* Title & Subtitle - improved hierarchy */}
                  <h3
                    className="text-gray-900 mb-2"
                    style={{
                      fontSize: offer.featured ? "1.75rem" : "1.375rem",
                      fontWeight: 700,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.15,
                    }}
                  >
                    {offer.title}
                  </h3>
                  <p className="text-gray-500 mb-5 leading-relaxed italic" style={{ fontSize: "0.9375rem", fontWeight: 400 }}>
                    {offer.subtitle}
                  </p>

                  {/* Subtle divider */}
                  <div className="w-12 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent mb-5 opacity-30" />

                  {/* Travel Details - refined spacing */}
                  <div className="space-y-3 mb-5">
                    {/* Departure Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-800">
                        <Calendar className="w-4 h-4 text-[#00c389]" strokeWidth={2} />
                        <span style={{ fontSize: "0.9375rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
                          {offer.departureDate}
                        </span>
                      </div>
                      {offer.additionalDates && (
                        <span className="text-[11px] text-[#00c389]" style={{ fontWeight: 600 }}>
                          + további időpontok
                        </span>
                      )}
                    </div>

                    {/* Transport & Accommodation row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {offer.transport.includes("bus") && (
                        <div className="px-2.5 py-1 bg-gray-50 rounded-md flex items-center gap-1.5">
                          <Bus className="w-3 h-3 text-[#00c389]" strokeWidth={2} />
                          <span className="text-[11px] text-gray-600" style={{ fontWeight: 500 }}>
                            Busz
                          </span>
                        </div>
                      )}
                      {offer.transport.includes("plane") && (
                        <div className="px-2.5 py-1 bg-gray-50 rounded-md flex items-center gap-1.5">
                          <Plane className="w-3 h-3 text-[#00c389]" strokeWidth={2} />
                          <span className="text-[11px] text-gray-600" style={{ fontWeight: 500 }}>
                            Repülő
                          </span>
                        </div>
                      )}
                      <div className="px-2.5 py-1 bg-gray-50 rounded-md flex items-center gap-1.5">
                        <Hotel className="w-3 h-3 text-[#00c389]" strokeWidth={2} />
                        <span className="text-[11px] text-gray-600" style={{ fontWeight: 500 }}>
                          {offer.accommodation}
                        </span>
                      </div>
                    </div>

                    {/* Seats Left */}
                    {offer.seatsLeft && (
                      <motion.div
                        className="flex items-center gap-1.5 text-orange-600 text-[13px]"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Users className="w-3.5 h-3.5" strokeWidth={2} />
                        <span style={{ fontWeight: 600 }}>
                          Már csak {offer.seatsLeft} hely!
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* CTA Button - cleaner and thinner */}
                  <motion.button
                    className="group/btn relative w-full px-5 py-2.5 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white rounded-xl overflow-hidden"
                    whileHover={{
                      scale: 1.01,
                      boxShadow: "0 0 20px rgba(0, 195, 128, 0.25)",
                    }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#00e89d] to-[#00c389] opacity-0 group-hover/btn:opacity-100"
                      transition={{ duration: 0.4 }}
                    />
                    <span
                      className="relative flex items-center justify-center gap-2"
                      style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.01em" }}
                    >
                      Részletek
                      <motion.div
                        animate={{
                          x: hoveredId === offer.id ? 3 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </motion.div>
                    </span>
                  </motion.button>
                </div>

                {/* Subtle glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-[32px] pointer-events-none"
                  animate={{
                    boxShadow: hoveredId === offer.id
                      ? "inset 0 0 0 1.5px rgba(0, 195, 128, 0.15)"
                      : "inset 0 0 0 0px rgba(0, 195, 128, 0)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            className="group px-8 py-4 bg-white text-gray-900 rounded-2xl border-2 border-gray-200 shadow-lg hover:border-[#00c389] hover:shadow-xl transition-all"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <span className="relative flex items-center gap-2" style={{ fontSize: "1rem", fontWeight: 600 }}>
              Összes ajánlat megtekintése
              <ArrowRight className="w-5 h-5 text-[#00c389] group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
