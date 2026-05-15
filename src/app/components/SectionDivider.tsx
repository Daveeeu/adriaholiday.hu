import { motion } from "motion/react";

interface SectionDividerProps {
  variant?: "gradient" | "wave" | "subtle";
}

export default function SectionDivider({ variant = "subtle" }: SectionDividerProps) {
  if (variant === "gradient") {
    return (
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f8fafc]/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#00c389]/30 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className="relative h-24">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M0,50 Q300,80 600,50 T1200,50 L1200,120 L0,120 Z"
            fill="url(#waveGradient)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.4 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00c389" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#16b8ff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#00c389" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Subtle variant - very minimal
  return (
    <div className="relative h-16 flex items-center justify-center overflow-hidden">
      <motion.div
        className="w-1 h-1 rounded-full bg-[#00c389]/20"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.3 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
}
