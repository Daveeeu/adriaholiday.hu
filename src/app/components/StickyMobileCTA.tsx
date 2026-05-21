import { motion } from "motion/react";
import { Phone, Calendar, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Mobile Bottom Sticky CTA */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.1)]"
        initial={{ y: 100 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="grid grid-cols-3 gap-2 p-3">
          {/* Call button */}
          <motion.a
            href="tel:+36123456789"
            className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[18px] bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
            whileTap={{ scale: 0.95 }}
          >
            <Phone className="w-5 h-5" strokeWidth={2} />
            <span className="text-xs font-semibold">Hívás</span>
          </motion.a>

          {/* Booking button */}
          <motion.button
            className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[18px] bg-gradient-to-br from-[#00c389] to-[#16b8ff] text-white"
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/kapcsolat"
              className="flex flex-col items-center justify-center gap-1.5"
            >
              <Calendar className="w-5 h-5" strokeWidth={2} />
              <span className="text-xs font-semibold">Foglalás</span>
            </Link>
          </motion.button>

          {/* Message button */}
          <motion.div
            className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-[18px] bg-gradient-to-br from-[#00c389] to-[#16b8ff] text-white"
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/kapcsolat"
              className="flex flex-col items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-5 h-5" strokeWidth={2} />
              <span className="text-xs font-semibold">Üzenet</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating WhatsApp/Messenger Button (Desktop & Mobile) */}
      <motion.div
        className="fixed bottom-24 right-6 z-50 lg:bottom-8 lg:right-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <motion.a
          href="https://wa.me/36123456789"
          target="_blank"
          rel="noopener noreferrer"
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

          {/* Pulse ring */}
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
    </>
  );
}
