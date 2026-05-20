import { motion } from "motion/react";
import { useState } from "react";
import {
  ArrowRight,
  Bus,
  Plane,
  Hotel,
  Calendar,
  Users,
  Sun,
  Heart,
  Baby,
} from "lucide-react";

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
  seatsLeft?: number;
  tripType?: string;
  tripTypeIcon?: React.ReactNode;
}

const offers: TravelOffer[] = [
  {
    id: "1",
    title: "Liguria gyöngyszemei",
    subtitle: "Portofino-öböl és a mesés Cinque Terre",
    image:
      "https://adriaholiday.hu/cache/images/uploads/gallery/154953_5c5bfecca11c8/1209600_5da5d0e3278a86.94515698.jpg%3Bop%28%3B1155x675%3B%29.jpg",
    departureDate: "2026.05.21 - 25.",
    additionalDates: true,
    transport: ["bus"],
    accommodation: "Hotel***",
    meals: "Reggeli",
    price: "179.800 Ft",
    badge: "Legnépszerűbb",
    seatsLeft: 6,
    tripType: "Cinque Terre",
    tripTypeIcon: <Heart className="w-3.5 h-3.5" strokeWidth={2} />,
  },

  {
    id: "2",
    title: "Napfényes Itália",
    subtitle: "5 nap tengerparti üdülés városlátogatásokkal",
    image:
      "https://adriaholiday.hu/cache/images/uploads/gallery/155127_5c768e92caefc/1209600_5c7699d5b96b68.76122659.jpg%3Bop%28%3B555x675%3B%29.jpg",
    departureDate: "2026.05.25 - 29.",
    additionalDates: true,
    transport: ["bus"],
    accommodation: "Apartman",
    meals: "Önellátás",
    price: "59.900 Ft",
    badge: "Last Minute",
    originalPrice: "79.900 Ft",
    seatsLeft: 4,
    tripType: "Tengerpart",
    tripTypeIcon: <Sun className="w-3.5 h-3.5" strokeWidth={2} />,
  },

  {
    id: "3",
    title: "Róma - Pompei - Vezúv",
    subtitle: "Olaszország ikonikus történelmi városai",
    image:
      "https://adriaholiday.hu/cache/images/uploads/gallery/177097_698efbf08d2d0/1209600_698efc4469ea56.32688726.jpg%3Bop%28%3B555x675%3B%29.jpg",
    departureDate: "2026.06.17 - 22.",
    transport: ["bus"],
    accommodation: "Hotel***",
    meals: "Reggeli",
    price: "207.700 Ft",
    badge: "Új",
    tripType: "Kulturális út",
    tripTypeIcon: <Users className="w-3.5 h-3.5" strokeWidth={2} />,
  },

  {
    id: "4",
    title: "Kirándulás a Plitvicei-tavakhoz",
    subtitle: "Horvátország természeti csodája",
    image:
      "https://adriaholiday.hu/cache/images/uploads/gallery/158952_5ebe408e8b3c5/1209600_5ebe40c8eea9a1.83414887.jpg%3Bop%28%3B555x450%3B%29.jpg",
    departureDate: "2026.05.23 - 24.",
    additionalDates: true,
    transport: ["bus"],
    accommodation: "Hotel***",
    meals: "Reggeli",
    price: "68.900 Ft",
    badge: "Legnépszerűbb",
    tripType: "Nemzeti park",
    tripTypeIcon: <Sun className="w-3.5 h-3.5" strokeWidth={2} />,
  },

  {
    id: "5",
    title: "Andalúzia ékkövei",
    subtitle: "Spanyolország legszebb városai repülővel",
    image:
      "https://adriaholiday.hu/cache/images/uploads/gallery/177323_69b178f2c52aa/1209600_69b179411ec525.17426506.jpg%3Bop%28%3B555x450%3B%29.jpg",
    departureDate: "2026.10.09 - 16.",
    transport: ["plane"],
    accommodation: "Hotel***",
    meals: "Félpanzió",
    price: "249.800 Ft",
    badge: "Már csak pár hely",
    seatsLeft: 3,
    tripType: "Repülős körút",
    tripTypeIcon: <Plane className="w-3.5 h-3.5" strokeWidth={2} />,
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

  const getBadgeColor = (badge?: string) => {
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
    <section className="relative pt-14 pb-16 bg-gradient-to-b from-[#f7fbff] via-white to-white overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#00c389]/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c389]/5 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
        <motion.div
          className="text-center mb-7"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="text-gray-900 mb-3"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
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

        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
  {offers.map((offer, index) => {
    const isFeatured = index === 0;

    return (
      <motion.div
        key={offer.id}
        className={`group ${isFeatured ? "lg:col-span-2" : ""}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: index * 0.06 }}
        onMouseEnter={() => setHoveredId(offer.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        <motion.div
          className={`relative h-full bg-white overflow-hidden border border-gray-100 transition-all duration-500 ${
            isFeatured
              ? "rounded-[34px] shadow-[0_18px_60px_rgba(0,195,137,0.14)]"
              : "rounded-[28px] shadow-[0_6px_28px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_44px_rgba(0,195,137,0.14)]"
          }`}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        >
          <div
            className={`relative overflow-hidden ${
              isFeatured ? "h-56" : "h-52"
            }`}
          >
            <motion.img
              src={offer.image}
              alt={offer.title}
              className="w-full h-full object-cover"
              animate={{ scale: hoveredId === offer.id ? 1.06 : 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

            {offer.badge && (
              <div
                className={`absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r ${getBadgeColor(
                  offer.badge
                )} rounded-full shadow-md`}
              >
                <span className="text-white text-xs font-semibold">
                  {offer.badge}
                </span>
              </div>
            )}

            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-md">
              {offer.originalPrice && (
                <p className="text-gray-400 text-[10px] line-through leading-none mb-1">
                  {offer.originalPrice}
                </p>
              )}

              <p className="text-[#00a878] text-base font-bold leading-none">
                {offer.price}
              </p>

              <p className="text-gray-500 text-[10px] leading-none mt-1">
                -tól/fő
              </p>
            </div>

            {offer.tripType && (
              <div className="absolute bottom-4 left-4 px-3 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-md flex items-center gap-2">
                <div className="text-[#00c389]">{offer.tripTypeIcon}</div>
                <span className="text-gray-800 text-xs font-semibold">
                  {offer.tripType}
                </span>
              </div>
            )}
          </div>

          <div className={`${isFeatured ? "p-6" : "p-5"}`}>
            <h3
              className={`text-gray-900 font-bold leading-tight tracking-[-0.02em] mb-2 ${
                isFeatured ? "text-[1.8rem]" : "text-[1.35rem]"
              }`}
            >
              {offer.title}
            </h3>

            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              {offer.subtitle}
            </p>

            <div className="w-10 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent mb-4 opacity-40" />

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-gray-800">
                  <Calendar className="w-4 h-4 text-[#00c389]" strokeWidth={2} />
                  <span className="text-sm font-semibold">
                    {offer.departureDate}
                  </span>
                </div>

                {offer.additionalDates && (
                  <span className="text-[11px] text-[#00c389] font-semibold whitespace-nowrap">
                    + további időpontok
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {offer.transport.includes("bus") && (
                  <div className="px-2.5 py-1 bg-gray-50 rounded-md flex items-center gap-1.5">
                    <Bus className="w-3 h-3 text-[#00c389]" strokeWidth={2} />
                    <span className="text-[11px] text-gray-600 font-medium">
                      Busz
                    </span>
                  </div>
                )}

                {offer.transport.includes("plane") && (
                  <div className="px-2.5 py-1 bg-gray-50 rounded-md flex items-center gap-1.5">
                    <Plane className="w-3 h-3 text-[#00c389]" strokeWidth={2} />
                    <span className="text-[11px] text-gray-600 font-medium">
                      Repülő
                    </span>
                  </div>
                )}

                <div className="px-2.5 py-1 bg-gray-50 rounded-md flex items-center gap-1.5">
                  <Hotel className="w-3 h-3 text-[#00c389]" strokeWidth={2} />
                  <span className="text-[11px] text-gray-600 font-medium">
                    {offer.accommodation}
                  </span>
                </div>
              </div>

              {offer.seatsLeft && (
                <motion.div
                  className="flex items-center gap-1.5 text-orange-600 text-[13px]"
                  animate={{ opacity: [1, 0.75, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                >
                  <Users className="w-3.5 h-3.5" strokeWidth={2} />
                  <span className="font-semibold">
                    Már csak {offer.seatsLeft} hely!
                  </span>
                </motion.div>
              )}
            </div>

            <motion.button
              className="group/btn relative w-full px-5 py-3 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white rounded-xl overflow-hidden"
              whileHover={{
                scale: 1.01,
                boxShadow: "0 0 20px rgba(0,195,137,0.25)",
              }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="relative flex items-center justify-center gap-2 text-sm font-semibold">
                Részletek
                <motion.div
                  animate={{ x: hoveredId === offer.id ? 3 : 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </motion.div>
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  })}
</div>

        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
        >
          <motion.button
            className="group px-8 py-4 bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-md hover:border-[#00c389] hover:shadow-lg transition-all"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-2 text-base font-semibold">
              Összes ajánlat megtekintése
              <ArrowRight
                className="w-5 h-5 text-[#00c389] group-hover:translate-x-1 transition-transform"
                strokeWidth={2.5}
              />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}