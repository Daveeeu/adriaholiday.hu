import { motion } from "motion/react";
import { Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { trackEvent } from "../analytics/trackEvent";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";

function isInternalLink(value: string) {
  return value.startsWith("/") || value.startsWith("#");
}

export default function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.1)]"
        initial={{ y: 100 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="grid grid-cols-3 gap-2 p-3">
          {settings.phone ? (
            <motion.a
              href={`tel:${settings.phone.replace(/\s+/g, "")}`}
              onClick={() =>
                trackEvent("phone_click", {
                  metadata: {
                    placement: "sticky_mobile_cta",
                  },
                })
              }
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[18px] bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-5 h-5" strokeWidth={2} />
              <span className="text-xs font-semibold">Hívás</span>
            </motion.a>
          ) : <div />}

          {settings.primaryCtaText && settings.primaryCtaLink ? (
            <motion.div className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[18px] bg-gradient-to-br from-[#00c389] to-[#16b8ff] text-white" whileTap={{ scale: 0.95 }}>
              {isInternalLink(settings.primaryCtaLink) ? (
                <Link
                  to={settings.primaryCtaLink}
                  onClick={() =>
                    trackEvent("cta_click", {
                      metadata: {
                        cta_name: settings.primaryCtaText,
                        placement: "sticky_mobile_cta",
                      },
                    })
                  }
                  className="flex flex-col items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={2} />
                  <span className="text-xs font-semibold">{settings.primaryCtaText}</span>
                </Link>
              ) : (
                <a
                  href={settings.primaryCtaLink}
                  onClick={() =>
                    trackEvent("cta_click", {
                      metadata: {
                        cta_name: settings.primaryCtaText,
                        placement: "sticky_mobile_cta",
                      },
                    })
                  }
                  className="flex flex-col items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={2} />
                  <span className="text-xs font-semibold">{settings.primaryCtaText}</span>
                </a>
              )}
            </motion.div>
          ) : <div />}

          {settings.email ? (
            <motion.a
              href={`mailto:${settings.email}`}
              onClick={() =>
                trackEvent("email_click", {
                  metadata: {
                    placement: "sticky_mobile_cta",
                  },
                })
              }
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[18px] bg-gradient-to-br from-[#00c389] to-[#16b8ff] text-white"
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-5 h-5" strokeWidth={2} />
              <span className="text-xs font-semibold">E-mail</span>
            </motion.a>
          ) : <div />}
        </div>
      </motion.div>

      {settings.whatsapp ? (
        <motion.div
          className="fixed bottom-24 right-6 z-50 lg:bottom-8 lg:right-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <motion.a
            href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("whatsapp_click", {
                metadata: {
                  placement: "floating_whatsapp",
                },
              })
            }
            className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_4px_20px_rgba(34,197,94,0.4)]"
            whileHover={{
              scale: 1.1,
              boxShadow: "0 6px 28px rgba(34,197,94,0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              y: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <MessageCircle className="w-7 h-7" strokeWidth={2} />

            <motion.div
              className="absolute inset-0 rounded-full bg-green-500"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </motion.a>
        </motion.div>
      ) : null}
    </>
  );
}
