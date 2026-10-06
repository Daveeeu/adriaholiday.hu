import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import {
  fetchPortfolioTestimonials,
  testimonialAnchor,
  testimonialInitials,
  testimonialQuote,
  type PortfolioTestimonial,
} from "../content/portfolio-testimonials-api";

/** How many of the newest letters the random pick comes from. */
const POOL_SIZE = 50;

/**
 * A floating card quoting one random guest letter ("Rólunk írták"); letters with a
 * signature are preferred so the quote is attributed.
 */
export default function TestimonialQuoteCard({ className }: { className?: string }) {
  const [testimonial, setTestimonial] = useState<PortfolioTestimonial | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPortfolioTestimonials(1, POOL_SIZE)
      .then(({ items }) => {
        const signed = items.filter((item) => item.author);
        const pool = signed.length > 0 ? signed : items;

        if (!cancelled && pool.length > 0) {
          setTestimonial(pool[Math.floor(Math.random() * pool.length)]);
        }
      })
      .catch(() => {
        if (!cancelled) setTestimonial(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!testimonial) {
    return null;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.8, type: "spring" }}
    >
      <Link to={`/rolunk-irtak#${testimonialAnchor(testimonial.id)}`} className="flex items-start gap-4 group">
        <div
          aria-hidden="true"
          className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-[#00c389] to-[#16b8ff] text-white text-lg font-bold flex items-center justify-center"
        >
          {testimonialInitials(testimonial.author)}
        </div>

        <div className="flex-1">
          <p className="text-gray-700 italic mb-3" style={{ fontSize: "0.9375rem", lineHeight: 1.6 }}>
            „{testimonialQuote(testimonial)}”
          </p>
          <p className="text-gray-900 group-hover:text-[#00a878] transition-colors" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
            {testimonial.author ?? "Utasunk"}
          </p>
          <p className="text-gray-500 text-xs">{testimonial.title}</p>
        </div>
      </Link>
    </motion.div>
  );
}
