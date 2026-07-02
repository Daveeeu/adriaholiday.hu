import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router";
import { trackEvent } from "../analytics/trackEvent";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            className="fixed top-6 right-6 z-50 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-xl flex items-center justify-center text-white md:hidden"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-[#0A1628] to-[#0F1E35] shadow-2xl z-50 p-8 md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <nav className="mt-16 space-y-6">
                {[
                  { label: "Utazások", to: "/utazasok" },
                  { label: "Blog", to: "/blog" },
                  { label: "Úti célok", to: "/utazasok" },
                  { label: "Rólunk", to: "/rolunk" },
                  { label: "Kapcsolat", to: "/kapcsolat" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="block text-white hover:text-cyan-400 transition-colors"
                    style={{ fontSize: "1.25rem", fontWeight: 600 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <Link to={item.to}>{item.label}</Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-12 space-y-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/kapcsolat"
                    onClick={() =>
                      trackEvent("cta_click", {
                        metadata: {
                          cta_name: "Foglalás",
                          placement: "mobile_menu",
                        },
                      })
                    }
                    className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg text-center font-semibold"
                  >
                    Foglalás
                  </Link>
                </motion.div>
                <motion.a
                  href="tel:+36123456789"
                  onClick={() =>
                    trackEvent("phone_click", {
                      metadata: {
                        placement: "mobile_menu",
                      },
                    })
                  }
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 text-white rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="w-5 h-5" />
                  +36 1 234 5678
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Bottom CTA (Mobile) */}
      <AnimatePresence>
        {isVisible && !isOpen && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
          >
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 shadow-2xl">
              <div className="flex items-center gap-3">
                <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
                  <Link
                    to="/kapcsolat"
                    onClick={() =>
                      trackEvent("cta_click", {
                        metadata: {
                          cta_name: "Foglalj most",
                          placement: "mobile_bottom_bar",
                        },
                      })
                    }
                    className="w-full py-3 bg-white text-cyan-600 rounded-xl flex items-center justify-center gap-2 font-semibold"
                  >
                    <Calendar className="w-5 h-5" />
                    Foglalj most
                  </Link>
                </motion.div>
                <motion.a
                  href="tel:+36123456789"
                  onClick={() =>
                    trackEvent("phone_click", {
                      metadata: {
                        placement: "mobile_bottom_bar",
                      },
                    })
                  }
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white"
                  whileTap={{ scale: 0.9 }}
                >
                  <Phone className="w-5 h-5" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
