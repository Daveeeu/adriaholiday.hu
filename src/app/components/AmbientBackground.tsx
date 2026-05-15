import { motion } from "motion/react";

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Subtle radial gradient ambience - top */}
      <motion.div
        className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 195, 137, 0.08) 0%, rgba(22, 184, 255, 0.05) 30%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Mediterranean blue ambient glow - middle right */}
      <motion.div
        className="absolute top-1/3 right-0 w-[700px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(22, 184, 255, 0.06) 0%, rgba(14, 165, 233, 0.04) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      {/* Turquoise warmth - middle left */}
      <motion.div
        className="absolute top-1/2 left-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 195, 137, 0.07) 0%, rgba(0, 195, 137, 0.03) 50%, transparent 75%)",
          filter: "blur(70px)",
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      {/* Bottom ambient glow */}
      <motion.div
        className="absolute bottom-0 right-1/3 w-[900px] h-[900px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, rgba(0, 195, 137, 0.03) 40%, transparent 70%)",
          filter: "blur(90px)",
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, 40, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 8,
        }}
      />

      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 195, 137, 0.3) 1px, transparent 0)`,
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
