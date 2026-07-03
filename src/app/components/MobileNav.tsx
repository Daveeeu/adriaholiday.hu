import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X, Phone, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router";

import { trackEvent } from "../analytics/trackEvent";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";

function isInternalLink(value: string) {
  return value.startsWith("/") || value.startsWith("#");
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const { settings } = useSiteSettings();

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
              {settings.headerNavigation.length > 0 ? (
                <nav className="mt-16 space-y-6">
                  {settings.headerNavigation.map((item, index) => (
                    <motion.div
                      key={`${item.to}-${item.label}`}
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
              ) : null}

              <div className="mt-12 space-y-4">
                {settings.primaryCtaText && settings.primaryCtaLink ? (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {isInternalLink(settings.primaryCtaLink) ? (
                      <Link
                        to={settings.primaryCtaLink}
                        onClick={() =>
                          trackEvent("cta_click", {
                            metadata: {
                              cta_name: settings.primaryCtaText,
                              placement: "mobile_menu",
                            },
                          })
                        }
                        className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg text-center font-semibold"
                      >
                        {settings.primaryCtaText}
                      </Link>
                    ) : (
                      <a
                        href={settings.primaryCtaLink}
                        onClick={() =>
                          trackEvent("cta_click", {
                            metadata: {
                              cta_name: settings.primaryCtaText,
                              placement: "mobile_menu",
                            },
                          })
                        }
                        className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg text-center font-semibold"
                      >
                        {settings.primaryCtaText}
                      </a>
                    )}
                  </motion.div>
                ) : null}

                {settings.phone ? (
                  <motion.a
                    href={`tel:${settings.phone.replace(/\s+/g, "")}`}
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
                    {settings.phone}
                  </motion.a>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && !isOpen && settings.primaryCtaText && settings.primaryCtaLink ? (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
          >
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 shadow-2xl">
              <div className="flex items-center gap-3">
                <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
                  {isInternalLink(settings.primaryCtaLink) ? (
                    <Link
                      to={settings.primaryCtaLink}
                      onClick={() =>
                        trackEvent("cta_click", {
                          metadata: {
                            cta_name: settings.primaryCtaText,
                            placement: "mobile_bottom_bar",
                          },
                        })
                      }
                      className="w-full py-3 bg-white text-cyan-600 rounded-xl flex items-center justify-center gap-2 font-semibold"
                    >
                      <ArrowRight className="w-5 h-5" />
                      {settings.primaryCtaText}
                    </Link>
                  ) : (
                    <a
                      href={settings.primaryCtaLink}
                      onClick={() =>
                        trackEvent("cta_click", {
                          metadata: {
                            cta_name: settings.primaryCtaText,
                            placement: "mobile_bottom_bar",
                          },
                        })
                      }
                      className="w-full py-3 bg-white text-cyan-600 rounded-xl flex items-center justify-center gap-2 font-semibold"
                    >
                      <ArrowRight className="w-5 h-5" />
                      {settings.primaryCtaText}
                    </a>
                  )}
                </motion.div>
                {settings.phone ? (
                  <motion.a
                    href={`tel:${settings.phone.replace(/\s+/g, "")}`}
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
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
