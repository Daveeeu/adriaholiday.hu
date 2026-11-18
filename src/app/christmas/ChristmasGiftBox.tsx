import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { claimChristmasCoupon, type IssuedCoupon } from "../booking/bookings-api";
import { issuedCouponDeadline } from "../booking/issued-coupon";
import { readChristmasCoupon, storeChristmasCoupon } from "./christmas-coupon";
import { useChristmas } from "./ChristmasProvider";

type CouponState =
  | { status: "idle" | "loading" | "failed" }
  | { status: "ready"; coupon: IssuedCoupon };

/**
 * A small gift box in the footer during the Christmas season. Opened, it lets
 * it snow and hands the visitor a coupon of their own (one per browser).
 */
export default function ChristmasGiftBox() {
  const { inSeason, celebrate } = useChristmas();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<CouponState>({ status: "idle" });
  const [copied, setCopied] = useState(false);
  const panelId = useId();
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const close = (event: MouseEvent | KeyboardEvent) => {
      const outside = event instanceof MouseEvent && !container.current?.contains(event.target as Node);

      if (outside || (event instanceof KeyboardEvent && event.key === "Escape")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!inSeason) {
    return null;
  }

  async function loadCoupon() {
    const stored = readChristmasCoupon();

    if (stored) {
      setState({ status: "ready", coupon: stored });
      return;
    }

    setState({ status: "loading" });

    try {
      const coupon = await claimChristmasCoupon();

      storeChristmasCoupon(coupon);
      setState({ status: "ready", coupon });
    } catch {
      setState({ status: "failed" });
    }
  }

  function openBox() {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
    celebrate("gift");

    if (state.status !== "ready" && state.status !== "loading") {
      void loadCoupon();
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Without clipboard access the code stays on screen to copy by hand.
    }
  }

  return (
    <div ref={container} className="inline-flex">
      <motion.button
        type="button"
        aria-label="Karácsonyi meglepetés"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={openBox}
        className="text-lg leading-none opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100"
        whileHover={{ rotate: [0, -12, 12, -6, 0], scale: 1.15 }}
        transition={{ duration: 0.5 }}
      >
        🎁
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Karácsonyi meglepetés"
            className="fixed inset-x-4 bottom-40 z-[73] mx-auto max-w-xs rounded-2xl bg-white p-5 text-left text-[#0f172a] shadow-[0_24px_70px_rgba(15,23,42,0.45)] md:bottom-24"
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
          >
            <button
              type="button"
              aria-label="Bezárás"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-[#64748b] hover:bg-[#f1f5f9]"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="pr-6 text-base font-bold">Megtaláltad a karácsonyi meglepetést! 🎄</p>
            <GiftBoxBody state={state} copied={copied} onCopy={copyCode} onRetry={loadCoupon} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function GiftBoxBody({
  state,
  copied,
  onCopy,
  onRetry,
}: {
  state: CouponState;
  copied: boolean;
  onCopy: (code: string) => void;
  onRetry: () => void;
}) {
  if (state.status === "ready") {
    const { coupon } = state;

    return (
      <>
        <p className="mt-2 text-sm text-[#475569]">
          Ajándékba adunk egy saját kupont: {coupon.percent}% kedvezmény a részvételi díjból, kuponnal foglalható
          útjainkra, {issuedCouponDeadline(coupon)}-ig.
        </p>
        <button
          type="button"
          onClick={() => onCopy(coupon.code)}
          className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl border-2 border-dashed border-[#dc2626] bg-[#fef2f2] px-4 py-2.5 font-mono text-lg font-bold tracking-wider text-[#b91c1c]"
        >
          {coupon.code}
          <span className="flex items-center gap-1 font-sans text-xs font-semibold tracking-normal">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Másolva" : "Másolás"}
          </span>
        </button>
        <p className="mt-2 text-xs text-[#64748b]">Foglaláskor a kuponkód mezőben váltható be, egyszer.</p>
      </>
    );
  }

  if (state.status === "failed") {
    return (
      <p className="mt-2 text-sm text-[#475569]">
        Most nem sikerült becsomagolni a kupont.{" "}
        <button type="button" onClick={onRetry} className="font-semibold text-[#00a374] underline">
          Próbáld újra
        </button>
      </p>
    );
  }

  return <p className="mt-2 text-sm text-[#475569]">Csomagoljuk az ajándékodat…</p>;
}
