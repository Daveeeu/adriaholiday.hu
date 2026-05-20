import { motion } from "motion/react";
import { Calendar, Clock, Users, MapPin, ArrowRight } from "lucide-react";
import { useState } from "react";

interface Trip {
  id: string;
  destination: string;
  country: string;
  image: string;
  date: string;
  duration: string;
  price: string;
  seatsLeft: number;
  featured?: boolean;
}

export const trips = [
  {
    title: "Liguria gyöngyszemei",
    subtitle: "Portofino-öböl és Cinque Terre",
    price: "179.800 Ft-tól",
    date: "2026. május 21–25.",
    image: "https://adriaholiday.hu/framework/img.php?p=files/manarola-6200837_1920.jpg&op=;1920x800;",
    href: "/korutazasok/liguria-gyongyszemei-portofino-felsziget-es-a-cinque-terre",
  },
  {
    title: "Andalúzia - mór örökségek nyomában",
    price: "308.600 Ft-tól",
    date: "2026. szeptember 23–28.",
    image: "https://adriaholiday.hu/framework/img.php?p=files/alhambra-967024_1920.jpg&op=;1920x800;",
    href: "/korutazasok/andaluzia-csodai",
  },
  {
    title: "Montenegró, a mediterrán csoda",
    price: "259.900 Ft-tól",
    date: "2026. június 13–20.",
    image: "https://adriaholiday.hu/framework/img.php?p=files/to-4627352_1920.jpg&op=;1920x800;",
    href: "/korutazasok/montenegro-a-mediterran-csoda-felpanzioval",
  },
  {
    title: "Kirándulás a Plitvicei-tavakhoz",
    price: "68.900 Ft-tól",
    date: "2026. május 23–24.",
    image: "https://adriaholiday.hu/framework/img.php?p=files/1111.jpg&op=;1920x800;",
    href: "/korutazasok/kirandulas-a-plitvicei-tavakhoz",
  },
];




export default function FeaturedTrips() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="relative py-20 bg-gradient-to-b from-[#0F1E35] to-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            ✨ Kiemelt ajánlatok
          </motion.span>
          <h2 className="text-gray-900 mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
            Következő{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              utazásaink
            </span>
          </h2>
          <p className="text-gray-600" style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}>
            Válassz a legközelebbi indulások közül
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredId(trip.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.div
                className="relative h-full bg-white rounded-2xl overflow-hidden shadow-lg"
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Image container */}
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    src={trip.image}
                    alt={trip.destination}
                    className="w-full h-full object-cover"
                    animate={{
                      scale: hoveredId === trip.id ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Featured badge */}
                  {trip.featured && (
                    <motion.div
                      className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full shadow-lg"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      🔥 Népszerű
                    </motion.div>
                  )}

                  {/* Floating shadow effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "radial-gradient(circle at center, rgba(6, 182, 212, 0.3) 0%, transparent 70%)",
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-gray-900 mb-1" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                      {trip.destination}
                    </h3>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {trip.country}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 text-cyan-600" />
                      <span>{trip.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Clock className="w-4 h-4 text-cyan-600" />
                      <span>{trip.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Users className="w-4 h-4 text-cyan-600" />
                      <span>{trip.seatsLeft} szabad hely</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Kezdő ár</p>
                        <p className="text-cyan-600" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                          {trip.price}
                        </p>
                      </div>
                      <motion.div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00c389] to-[#16b8ff] flex items-center justify-center text-white shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </div>

                    <motion.button
                      className="w-full py-3 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white rounded-xl overflow-hidden relative group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="relative">Részletek</span>
                    </motion.button>
                  </div>
                </div>

                {/* Glow border on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-cyan-400/50 pointer-events-none"
                  animate={{
                    boxShadow: hoveredId === trip.id
                      ? "0 0 20px rgba(6, 182, 212, 0.5)"
                      : "0 0 0px rgba(6, 182, 212, 0)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="px-8 py-4 bg-white border-2 border-cyan-500 text-cyan-600 rounded-xl hover:bg-cyan-50 transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Összes utazás megtekintése
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
