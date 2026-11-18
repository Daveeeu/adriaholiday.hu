import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Flame, X } from "lucide-react";

import type { UrgencyMessage } from "../lib/urgencyMessage";

/** Shown this long after the page opens or the date changes. */
const SHOW_DELAY_MS = 3000;

/**
 * A small toast in the corner urging the visitor to book: it slides in a
 * moment after the trip page opens, again when another date brings another
 * message, and stays until the visitor closes it; a closed message stays closed.
 */
export default function UrgencyToast({ message }: { message: UrgencyMessage | null }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(() => new Set());
  const reduceMotion = useReducedMotion();
  const key = message ? `${message.title}|${message.text}` : null;

  useEffect(() => {
    setVisible(false);

    if (key === null || dismissed.has(key)) {
      return;
    }

    const show = setTimeout(() => setVisible(true), SHOW_DELAY_MS);

    return () => clearTimeout(show);
  }, [key, dismissed]);

  function dismiss() {
    if (key !== null) {
      setDismissed((current) => new Set(current).add(key));
    }
    setVisible(false);
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-40 flex md:inset-x-auto md:bottom-6 md:left-6">
      <AnimatePresence>
        {visible && message ? (
          <motion.div
            role="status"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -60, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -60, y: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="pointer-events-auto relative w-full rounded-2xl border border-[#ff7a45]/25 bg-white/95 px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.16)] backdrop-blur-xl md:max-w-[320px]"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Bezárás"
              className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-black/5 bg-white text-gray-500 shadow-sm transition-colors hover:text-gray-800"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff7a45] to-[#ff3d5a] shadow-sm">
                <Flame className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900">{message.title}</p>
                <p className="mt-0.5 text-[0.8125rem] leading-snug text-gray-600">{message.text}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
