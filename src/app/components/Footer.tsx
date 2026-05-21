import { motion } from "motion/react";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-[#0A1628] via-[#0F1E35] to-[#1A2942] text-white overflow-hidden">
      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footerGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-white" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#footerGrid)" />
        </svg>
      </div>

      {/* Floating gradient accents */}
      <motion.div
        className="absolute top-20 left-[15%] w-80 h-80 bg-[#00c389]/10 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-[15%] w-80 h-80 bg-[#16b8ff]/10 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <motion.div
            className="col-span-1 md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h3
              className="text-white mb-4"
              style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}
              whileHover={{ scale: 1.02 }}
            >
              <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
                Adria
              </span>{" "}
              Holiday
            </motion.h3>
            <p className="text-white/70 mb-6 max-w-md leading-relaxed">
              Prémium buszos utazások Európa legszebb úti céljaihoz. 15 év tapasztalat,
              10,000+ elégedett utas, és számtalan felejthetetlen élmény.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, to: "/kapcsolat", label: "Facebook" },
                { icon: Instagram, to: "/kapcsolat", label: "Instagram" },
                { icon: Mail, to: "/kapcsolat", label: "Email" },
              ].map((social, index) => (
                <motion.div
                  key={index}
                  aria-label={social.label}
                  className="w-11 h-11 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-[#00c389] hover:to-[#16b8ff] flex items-center justify-center transition-all duration-300 border border-white/10"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Link to={social.to} aria-label={social.label}>
                    <social.icon className="w-5 h-5" strokeWidth={2} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4
              className="text-white mb-5"
              style={{ fontSize: "1.125rem", fontWeight: 700 }}
            >
              Gyors linkek
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Utazások", to: "/utazasok" },
                { label: "Rólunk", to: "/rolunk" },
                { label: "Kapcsolat", to: "/kapcsolat" },
                { label: "ÁSZF", to: "/aszf" },
                { label: "Adatvédelem", to: "/adatvedelem" },
              ].map((link) => (
                <motion.li key={link.label} whileHover={{ x: 4 }}>
                  <Link
                    to={link.to}
                    className="text-white/70 hover:text-[#00c389] transition-colors duration-300 text-[15px]"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4
              className="text-white mb-5"
              style={{ fontSize: "1.125rem", fontWeight: 700 }}
            >
              Kapcsolat
            </h4>
            <ul className="space-y-4">
              <motion.li
                className="flex items-start gap-3 text-white/70"
                whileHover={{ x: 2 }}
              >
                <div className="w-9 h-9 rounded-lg bg-[#00c389]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-[#00c389]" strokeWidth={2} />
                </div>
                <span className="text-[15px] pt-1.5">+36 1 234 5678</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-3 text-white/70"
                whileHover={{ x: 2 }}
              >
                <div className="w-9 h-9 rounded-lg bg-[#00c389]/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-[#00c389]" strokeWidth={2} />
                </div>
                <span className="text-[15px] pt-1.5">info@adriaholiday.hu</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-3 text-white/70"
                whileHover={{ x: 2 }}
              >
                <div className="w-9 h-9 rounded-lg bg-[#00c389]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#00c389]" strokeWidth={2} />
                </div>
                <span className="text-[15px] pt-1.5">
                  1051 Budapest<br />Példa utca 12.
                </span>
              </motion.li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-white/50 text-sm">
            © 2026 Adria Holiday. Minden jog fenntartva.
          </p>
          <div className="flex gap-6 text-sm text-white/50">
            <motion.div
              className="hover:text-[#00c389] transition-colors"
              whileHover={{ y: -2 }}
            >
              <Link to="/impresszum">Impresszum</Link>
            </motion.div>
            <motion.div
              className="hover:text-[#00c389] transition-colors"
              whileHover={{ y: -2 }}
            >
              <Link to="/sutik">Süti kezelés</Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
