import { motion } from "motion/react";

import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export default function FloatingParticles() {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Subtle Mediterranean particles */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0
              ? "rgba(0, 195, 137, 0.15)"
              : i % 3 === 1
              ? "rgba(22, 184, 255, 0.15)"
              : "rgba(255, 255, 255, 0.1)",
            boxShadow: i % 3 === 0
              ? "0 0 8px rgba(0, 195, 137, 0.3)"
              : i % 3 === 1
              ? "0 0 8px rgba(22, 184, 255, 0.3)"
              : "0 0 4px rgba(255, 255, 255, 0.2)",
          }}
          animate={{
            y: [0, -150, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Larger floating orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full blur-2xl"
          style={{
            left: `${20 + i * 20}%`,
            top: `${Math.random() * 80}%`,
            width: `${80 + Math.random() * 120}px`,
            height: `${80 + Math.random() * 120}px`,
            background: i % 2 === 0
              ? "radial-gradient(circle, rgba(0, 195, 137, 0.08), transparent)"
              : "radial-gradient(circle, rgba(22, 184, 255, 0.08), transparent)",
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 40 - 20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: Math.random() * 25 + 20,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
