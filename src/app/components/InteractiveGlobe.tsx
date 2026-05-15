import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Calendar, Users } from "lucide-react";

interface Destination {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  price: string;
  nextDate: string;
  seatsLeft: number;
  image: string;
}

const destinations: Destination[] = [
  {
    id: "1",
    name: "Dubrovnik",
    country: "Horvátország",
    lat: 42.6507,
    lng: 18.0944,
    price: "189.900 Ft",
    nextDate: "2026. máj. 24",
    seatsLeft: 12,
    image: "https://images.unsplash.com/photo-1775153014119-84d0ca7edd7d?w=400",
  },
  {
    id: "2",
    name: "Velence",
    country: "Olaszország",
    lat: 45.4408,
    lng: 12.3155,
    price: "229.900 Ft",
    nextDate: "2026. máj. 28",
    seatsLeft: 8,
    image: "https://images.unsplash.com/photo-1551801319-ca06060f3fcc?w=400",
  },
  {
    id: "3",
    name: "Bled-tó",
    country: "Szlovénia",
    lat: 46.3683,
    lng: 14.1146,
    price: "149.900 Ft",
    nextDate: "2026. jún. 5",
    seatsLeft: 15,
    image: "https://images.unsplash.com/photo-1478088913771-e3a36f50bb63?w=400",
  },
  {
    id: "4",
    name: "Amalfi part",
    country: "Olaszország",
    lat: 40.6340,
    lng: 14.6027,
    price: "269.900 Ft",
    nextDate: "2026. jún. 12",
    seatsLeft: 6,
    image: "https://images.unsplash.com/photo-1681844931449-e0992a27d157?w=400",
  },
];

export default function InteractiveGlobe() {
  const [selectedRegion, setSelectedRegion] = useState<string>("europe");
  const [hoveredDestination, setHoveredDestination] = useState<Destination | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <section className="relative py-20 bg-gradient-to-b from-[#0A1628] to-[#0F1E35] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-white mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700 }}>
            Válassz úti célt az{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              interaktív térképen
            </span>
          </h2>
          <p className="text-white/70" style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}>
            Fedezd fel Európa legszebb úti céljait
          </p>
        </motion.div>

        {/* Interactive Map */}
        <div
          ref={containerRef}
          className="relative w-full h-[600px] rounded-3xl bg-gradient-to-br from-[#0F1E35] to-[#1A2942] overflow-hidden border border-cyan-500/20 shadow-2xl"
          onMouseMove={handleMouseMove}
        >
          {/* Simplified 3D-style map */}
          <svg
            viewBox="0 0 1000 600"
            className="w-full h-full"
            style={{ filter: "drop-shadow(0 0 20px rgba(6, 182, 212, 0.3))" }}
          >
            <defs>
              <radialGradient id="mapGlow" cx="50%" cy="50%">
                <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
              </radialGradient>
              <linearGradient id="landGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="100%" stopColor="#0D9488" />
              </linearGradient>
            </defs>

            {/* Glow effect */}
            <circle cx="500" cy="300" r="400" fill="url(#mapGlow)" />

            {/* Simplified Europe landmass */}
            <motion.path
              d="M 250 150 Q 300 120 350 140 L 400 130 Q 450 120 480 150 L 520 160 Q 560 155 580 180 L 600 200 Q 610 230 600 260 L 590 300 Q 585 340 560 360 L 520 380 Q 480 390 440 380 L 400 370 Q 360 375 330 360 L 300 340 Q 270 320 260 290 L 250 260 Q 245 220 250 180 Z"
              fill="url(#landGradient)"
              stroke="#16b8ff"
              strokeWidth="2"
              opacity={selectedRegion === "europe" ? 1 : 0.3}
              initial={{ scale: 0.9 }}
              animate={{
                scale: selectedRegion === "europe" ? 1 : 0.9,
                opacity: selectedRegion === "europe" ? 1 : 0.3,
              }}
              transition={{ duration: 0.5 }}
            />

            {/* Croatia region */}
            <motion.path
              d="M 480 280 Q 490 270 500 280 L 510 295 Q 512 310 505 320 L 495 325 Q 485 322 480 315 Z"
              fill={selectedRegion === "croatia" ? "#16b8ff" : "#0D9488"}
              stroke="#16b8ff"
              strokeWidth="1.5"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1, fill: "#16b8ff" }}
              onClick={() => setSelectedRegion("croatia")}
              className="cursor-pointer"
            />

            {/* Italy region */}
            <motion.path
              d="M 420 250 Q 430 240 440 250 L 445 280 Q 448 310 440 340 L 435 360 Q 425 370 415 360 L 410 330 Q 408 300 415 270 Z"
              fill={selectedRegion === "italy" ? "#16b8ff" : "#0D9488"}
              stroke="#16b8ff"
              strokeWidth="1.5"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1, fill: "#16b8ff" }}
              onClick={() => setSelectedRegion("italy")}
              className="cursor-pointer"
            />

            {/* Slovenia region */}
            <motion.path
              d="M 450 230 Q 460 225 470 230 L 475 240 Q 478 250 472 258 L 465 260 Q 455 257 450 250 Z"
              fill={selectedRegion === "slovenia" ? "#16b8ff" : "#0D9488"}
              stroke="#16b8ff"
              strokeWidth="1.5"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1, fill: "#16b8ff" }}
              onClick={() => setSelectedRegion("slovenia")}
              className="cursor-pointer"
            />

            {/* Destination markers */}
            {destinations.map((dest, index) => {
              const x = 250 + (dest.lng - 12) * 15;
              const y = 400 - (dest.lat - 40) * 15;

              return (
                <motion.g
                  key={dest.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  onMouseEnter={() => setHoveredDestination(dest)}
                  onMouseLeave={() => setHoveredDestination(null)}
                  className="cursor-pointer"
                >
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill="rgba(6, 182, 212, 0.2)"
                    animate={{
                      r: [20, 25, 20],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  />
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="#16b8ff"
                    whileHover={{ scale: 1.3, fill: "#22D3EE" }}
                  />
                  <MapPin
                    x={x - 6}
                    y={y - 16}
                    width="12"
                    height="12"
                    className="text-white"
                    style={{ overflow: "visible" }}
                  />
                </motion.g>
              );
            })}

            {/* Connection lines */}
            {destinations.map((dest, index) => {
              if (index === 0) return null;
              const x1 = 250 + (destinations[index - 1].lng - 12) * 15;
              const y1 = 400 - (destinations[index - 1].lat - 40) * 15;
              const x2 = 250 + (dest.lng - 12) * 15;
              const y2 = 400 - (dest.lat - 40) * 15;

              return (
                <motion.line
                  key={`line-${dest.id}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 1, delay: index * 0.2 + 1 }}
                />
              );
            })}

            <defs>
              <linearGradient id="lineGradient">
                <stop offset="0%" stopColor="#16b8ff" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#16b8ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#16b8ff" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Hover card */}
          <AnimatePresence>
            {hoveredDestination && (
              <motion.div
                className="absolute pointer-events-none z-50"
                style={{
                  left: mousePosition.x + 20,
                  top: mousePosition.y - 100,
                }}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-cyan-200 min-w-[280px]">
                  <img
                    src={hoveredDestination.image}
                    alt={hoveredDestination.name}
                    className="w-full h-32 object-cover rounded-xl mb-3"
                  />
                  <h3 className="text-gray-900" style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                    {hoveredDestination.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{hoveredDestination.country}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-[#00c389]" />
                      <span>{hoveredDestination.nextDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-4 h-4 text-[#00c389]" />
                      <span>{hoveredDestination.seatsLeft} szabad hely</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-[#00c389]" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                        {hoveredDestination.price}
                      </p>
                      <p className="text-xs text-gray-500">-tól/fő</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Region selector */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { id: "europe", label: "Egész Európa" },
            { id: "croatia", label: "Horvátország" },
            { id: "italy", label: "Olaszország" },
            { id: "slovenia", label: "Szlovénia" },
          ].map((region) => (
            <motion.button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`px-6 py-3 rounded-xl transition-all ${
                selectedRegion === region.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {region.label}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
