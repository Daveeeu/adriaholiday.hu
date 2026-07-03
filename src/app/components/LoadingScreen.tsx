import { motion } from "motion/react";

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0A1628] via-[#0f172a] to-[#0A1628]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#00c389]/14 via-[#16b8ff]/10 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.28, 0.42, 0.28],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative">
          <motion.div
            className="h-24 w-24 rounded-full border border-white/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#00c389] border-r-[#16b8ff]" />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 rgba(0,195,137,0.0)",
                "0 0 36px rgba(0,195,137,0.22)",
                "0 0 0 rgba(0,195,137,0.0)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="text-center">
          <h2
            className="mb-2 text-white"
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Az utazásod{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              betöltődik
            </span>
          </h2>
          <motion.p
            className="text-sm text-white/60"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            Kérlek várj...
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
