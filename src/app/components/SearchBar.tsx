import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { MapPin, Calendar, DollarSign, Clock, Search } from "lucide-react";

export default function SearchBar() {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />

          <div className="relative bg-white p-8">
            <motion.h3
              className="text-gray-900 mb-8 text-center"
              style={{ fontSize: "1.875rem", fontWeight: 700 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Találd meg az{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                ideális utazást
              </span>
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Destination */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  className={`relative rounded-xl border-2 transition-all ${
                    focusedField === "destination"
                      ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
                      : "border-gray-200"
                  }`}
                  animate={{
                    scale: focusedField === "destination" ? 1.02 : 1,
                  }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Úti cél"
                    className="w-full pl-12 pr-4 py-4 bg-transparent focus:outline-none"
                    onFocus={() => setFocusedField("destination")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <AnimatePresence>
                    {focusedField === "destination" && (
                      <motion.div
                        className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {["Horvátország", "Olaszország", "Szlovénia", "Adriai körút"].map((dest) => (
                          <motion.div
                            key={dest}
                            className="px-4 py-3 rounded-lg hover:bg-cyan-50 cursor-pointer text-gray-700 transition-colors"
                            whileHover={{ x: 4 }}
                          >
                            {dest}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Departure City */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className={`relative rounded-xl border-2 transition-all ${
                    focusedField === "departure"
                      ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
                      : "border-gray-200"
                  }`}
                  animate={{
                    scale: focusedField === "departure" ? 1.02 : 1,
                  }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Indulás helye"
                    className="w-full pl-12 pr-4 py-4 bg-transparent focus:outline-none"
                    onFocus={() => setFocusedField("departure")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </motion.div>

              {/* Date */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className={`relative rounded-xl border-2 transition-all ${
                    focusedField === "date"
                      ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
                      : "border-gray-200"
                  }`}
                  animate={{
                    scale: focusedField === "date" ? 1.02 : 1,
                  }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Dátum"
                    className="w-full pl-12 pr-4 py-4 bg-transparent focus:outline-none"
                    onFocus={() => setFocusedField("date")}
                    onBlur={() => setFocusedField(null)}
                  />
                </motion.div>
              </motion.div>

              {/* Duration */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className={`relative rounded-xl border-2 transition-all ${
                    focusedField === "duration"
                      ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
                      : "border-gray-200"
                  }`}
                  animate={{
                    scale: focusedField === "duration" ? 1.02 : 1,
                  }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <select
                    className="w-full pl-12 pr-4 py-4 bg-transparent focus:outline-none appearance-none cursor-pointer"
                    onFocus={() => setFocusedField("duration")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="">Időtartam</option>
                    <option value="2-3">2-3 nap</option>
                    <option value="4-5">4-5 nap</option>
                    <option value="6-7">6-7 nap</option>
                    <option value="8+">8+ nap</option>
                  </select>
                </motion.div>
              </motion.div>

              {/* Search Button */}
              <motion.button
                className="relative group rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  Keresés
                </span>
              </motion.button>
            </div>

            {/* Popular searches */}
            <motion.div
              className="mt-6 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-gray-500 text-sm">Népszerű:</span>
              {["Horvátország nyár", "Bled-tó", "Velence", "Last minute"].map((tag, index) => (
                <motion.button
                  key={tag}
                  className="px-4 py-2 bg-gray-100 hover:bg-cyan-50 text-gray-700 hover:text-cyan-600 rounded-full text-sm transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tag}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
