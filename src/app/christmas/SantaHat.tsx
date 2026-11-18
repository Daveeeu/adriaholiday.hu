import { motion } from "motion/react";

/** A Santa hat dropping onto the top left corner of the logo. */
export default function SantaHat() {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 64 56"
      className="pointer-events-none absolute -left-5 -top-7 h-10 w-11 drop-shadow-[0_4px_8px_rgba(15,23,42,0.25)]"
      initial={{ y: -40, rotate: -40, opacity: 0 }}
      animate={{ y: 0, rotate: -18, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 14 }}
    >
      <path d="M8 40 C14 18 30 4 46 6 C54 7 58 16 56 26 C52 20 46 18 42 22 C38 28 40 36 42 40 Z" fill="#dc2626" />
      <path d="M8 40 C14 24 26 12 38 9 C30 18 26 30 26 40 Z" fill="#b91c1c" />
      <rect x="2" y="38" width="46" height="11" rx="5.5" fill="#ffffff" />
      <circle cx="56" cy="28" r="7" fill="#ffffff" />
    </motion.svg>
  );
}
