import { motion } from "motion/react";
import { Star, ShieldCheck } from "lucide-react";

export default function GoogleRatingBadge() {
  return (
    <motion.div
      className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/70"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
    >
      {/* Google logo placeholder */}
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M18.9 10.2c0-.7-.1-1.4-.2-2H10v3.8h5c-.2 1.1-.9 2-1.8 2.7v2.3h2.9c1.7-1.6 2.8-3.9 2.8-6.8z"
            fill="#4285F4"
          />
          <path
            d="M10 19c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H1.9v2.3C3.4 17 6.5 19 10 19z"
            fill="#34A853"
          />
          <path
            d="M4.9 11.5c-.4-1.1-.4-2.3 0-3.4V5.8H1.9c-1.2 2.4-1.2 5.2 0 7.6l3-2.3z"
            fill="#FBBC04"
          />
          <path
            d="M10 4.2c1.4 0 2.6.5 3.6 1.4l2.7-2.7C14.5 1.2 12.4.4 10 .4 6.5.4 3.4 2.4 1.9 5.5l3 2.3c.7-2.2 2.7-3.8 5.1-3.8z"
            fill="#EA4335"
          />
        </svg>
        <span className="text-gray-700 font-medium text-sm">Google</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200" />

      {/* Rating */}
      <div className="flex items-center gap-1.5">
        <span className="text-gray-900 font-bold text-lg">4.9</span>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3.5 h-3.5 fill-[#FBBC04] text-[#FBBC04]"
            />
          ))}
        </div>
      </div>

      {/* Review count */}
      <span className="text-gray-500 text-xs font-medium">(1,240)</span>

      {/* Verified badge */}
      <ShieldCheck className="w-4 h-4 text-blue-500 ml-1" strokeWidth={2.5} />
    </motion.div>
  );
}
