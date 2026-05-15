import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Users, TrendingUp, CheckCircle } from "lucide-react";

const activities = [
  {
    icon: <CheckCircle className="w-3 h-3" strokeWidth={2.5} />,
    text: "Anna most foglalt egy horvátországi utat",
    color: "from-[#00c389] to-[#16b8ff]",
  },
  {
    icon: <Users className="w-3 h-3" strokeWidth={2.5} />,
    text: "18 foglalás az elmúlt 24 órában",
    color: "from-[#16b8ff] to-[#00c389]",
  },
  {
    icon: <TrendingUp className="w-3 h-3" strokeWidth={2.5} />,
    text: "Legnépszerűbb ezen a héten: Dalmácia",
    color: "from-[#00c389] to-[#0ea5e9]",
  },
];

export default function LiveActivity() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show first notification after 8 seconds (not intrusive)
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 8000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Longer cycle time - subtle and not annoying
    const cycleInterval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 500);
    }, 15000); // Show every 15 seconds - subtle

    return () => clearInterval(cycleInterval);
  }, [isVisible]);

  const currentActivity = activities[currentIndex];

  return (
    <div className="fixed bottom-28 left-6 z-40 pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="pointer-events-auto"
            initial={{ opacity: 0, x: -60, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -60, y: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.5 }}
          >
            <motion.div
              className="relative bg-white/85 backdrop-blur-xl rounded-2xl px-3.5 py-2.5 shadow-[0_4px_20px_rgba(15,23,42,0.08)] border border-white/50 max-w-[280px]"
            >
              {/* Subtle glassmorphism glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none" />

              <div className="relative flex items-center gap-2.5">
                {/* Icon - smaller and softer */}
                <motion.div
                  className={`flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br ${currentActivity.color} flex items-center justify-center shadow-sm`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                >
                  <div className="text-white">{currentActivity.icon}</div>
                </motion.div>

                {/* Text - smaller font */}
                <p className="text-gray-700 flex-1" style={{ fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "-0.005em", lineHeight: 1.4 }}>
                  {currentActivity.text}
                </p>

                {/* Subtle pulse indicator - smaller */}
                <motion.div
                  className="flex-shrink-0 w-1 h-1 rounded-full bg-[#00c389]"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.8, 0.4, 0.8],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
