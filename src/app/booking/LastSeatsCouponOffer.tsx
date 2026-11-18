import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Flame, Ticket, X } from "lucide-react";

import { useBrowsingEngagement } from "../hooks/useBrowsingEngagement";
import type { IssuedCoupon } from "./bookings-api";
import { issuedCouponDeadline } from "./issued-coupon";
import type { LastSeatsCouponState } from "./useLastSeatsCoupon";

/** How long the visitor reads the trip page (and scrolls it) before the offer comes up. */
const READING_MS = 20000;

/**
 * A prominent offer that comes up once the visitor has been reading about a
 * date whose seats are running low: it tells them the seats left and gives
 * them a one-day coupon for the last seats discount. It comes up once per
 * date and page view, and not at all when this browser already has the
 * date's coupon (the booking form shows that one).
 */
export default function LastSeatsCouponOffer({
  lastSeats,
  dateId,
  seatsLeft,
  onUse,
}: {
  lastSeats: LastSeatsCouponState;
  dateId: string | number;
  seatsLeft: number | null;
  onUse: (coupon: IssuedCoupon) => void;
}) {
  const { offeredPercent, coupon, claim } = lastSeats;
  const [shownFor, setShownFor] = useState<ReadonlySet<string>>(() => new Set());
  const [open, setOpen] = useState(false);
  const [offered, setOffered] = useState<IssuedCoupon | null>(null);
  const dateKey = String(dateId);
  const due = offeredPercent !== null && coupon === null && !shownFor.has(dateKey);
  const engaged = useBrowsingEngagement(READING_MS, due);
  const reduceMotion = useReducedMotion();
  const primaryButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!due || !engaged) {
      return;
    }

    // Not cancelled when the claimed coupon makes the offer no longer due: that is when it opens.
    setShownFor((current) => new Set(current).add(dateKey));
    claim()
      .then((given) => {
        setOffered(given);
        setOpen(true);
      })
      // Without a coupon there is nothing to offer; the booking form still points out the seats.
      .catch(() => undefined);
  }, [claim, dateKey, due, engaged]);

  useEffect(() => {
    if (!open) {
      return;
    }

    primaryButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function use() {
    if (offered) {
      onUse(offered);
    }
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && offered ? (
        <motion.div
          className="fixed inset-0 z-[150] flex items-end justify-center bg-[#07111f]/60 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="last-seats-offer-title"
            className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white text-center shadow-[0_24px_60px_rgba(15,23,42,0.35)]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Bezárás"
              className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>

            <div className="bg-gradient-to-br from-[#ff7a45] to-[#ff3d5a] px-6 pb-6 pt-8 text-white">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/20">
                <Flame className="h-8 w-8" strokeWidth={2.5} />
              </div>
              <h2 id="last-seats-offer-title" className="mt-4 text-3xl font-extrabold tracking-tight">
                Fogynak a helyek!
              </h2>
              {seatsLeft !== null ? (
                <p className="mt-1 text-base font-semibold text-white/90">
                  Erre az időpontra már csak {seatsLeft} szabad hely maradt.
                </p>
              ) : null}
            </div>

            <div className="px-6 pb-6 pt-5">
              <p className="text-lg font-bold text-[#0f172a]">
                Itt van {offered.percent}% kedvezmény, ha most foglalsz!
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#ff7a45] bg-[#fff4ee] px-4 py-3">
                <Ticket className="h-5 w-5 text-[#ff5a3c]" />
                <span className="font-mono text-2xl font-extrabold tracking-wider text-[#0f172a]">{offered.code}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                A kupon {issuedCouponDeadline(offered)}-ig érvényes, erre az időpontra, a részvételi díjból.
              </p>

              <button
                ref={primaryButton}
                type="button"
                onClick={use}
                className="mt-5 w-full rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ff3d5a] px-6 py-3.5 text-base font-bold text-white shadow-[0_10px_24px_rgba(255,61,90,0.35)] transition-transform hover:scale-[1.02]"
              >
                Foglalok {offered.percent}% kedvezménnyel
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-2 w-full rounded-full px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800"
              >
                Később – a kuponkódot a foglalásnál is megtalálod
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
