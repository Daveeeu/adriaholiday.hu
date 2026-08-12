import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";

import { fetchActivePromotion, type PortfolioPromotion } from "../content/promotion-api";

const DISMISSED_KEY = "dismissed-promotion-id";

export default function PromotionToast() {
  const [promotion, setPromotion] = useState<PortfolioPromotion | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let showTimer: ReturnType<typeof setTimeout> | undefined;

    fetchActivePromotion()
      .then(({ promotion: activePromotion }) => {
        if (cancelled || !activePromotion) {
          return;
        }

        const dismissedId = localStorage.getItem(DISMISSED_KEY);
        if (dismissedId !== null && dismissedId === String(activePromotion.id)) {
          return;
        }

        setPromotion(activePromotion);
        showTimer = setTimeout(() => {
          if (!cancelled) {
            setVisible(true);
          }
        }, 1500);
      })
      .catch(() => {
        // Fail silently — no promotion shown if the request fails.
      });

    return () => {
      cancelled = true;
      if (showTimer) {
        clearTimeout(showTimer);
      }
    };
  }, []);

  function handleDismiss() {
    if (promotion) {
      localStorage.setItem(DISMISSED_KEY, String(promotion.id));
    }
    setVisible(false);
  }

  if (!promotion) {
    return null;
  }

  return (
    <div className="fixed bottom-28 left-6 z-40">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -60, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -60, y: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.5 }}
            className="relative bg-white/85 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(15,23,42,0.08)] border border-white/50 max-w-[300px]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none" />

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Bezárás"
              className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-white shadow-sm border border-black/5 text-gray-500 transition-colors hover:text-gray-800"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>

            <div className="relative flex items-start gap-2.5">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-[#00c389] to-[#16b8ff] flex items-center justify-center shadow-sm">
                <Megaphone className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-gray-800"
                  style={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "-0.005em", lineHeight: 1.3 }}
                >
                  {promotion.title}
                </p>
                <p
                  className="mt-0.5 text-gray-600"
                  style={{ fontSize: "0.75rem", lineHeight: 1.4 }}
                >
                  {promotion.message}
                </p>
                {promotion.code ? (
                  <span
                    className="mt-2 inline-block rounded-lg bg-gradient-to-r from-[#00c389]/10 to-[#16b8ff]/10 border border-[#00c389]/30 px-2 py-1 font-mono text-[#00734f]"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {promotion.code}
                  </span>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
