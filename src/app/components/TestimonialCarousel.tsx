import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Quote } from "lucide-react";
import { Link } from "react-router";

import {
  fetchPortfolioTestimonials,
  formatTestimonialDate,
  testimonialAnchor,
  testimonialInitials,
  type PortfolioTestimonial,
} from "../content/portfolio-testimonials-api";

const HOME_TESTIMONIAL_COUNT = 8;
const ROTATION_MS = 7000;

/**
 * The newest guest letters ("Rólunk írták") rotating on the home page, each
 * linking to the whole letter on the testimonials page.
 */
export default function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState<PortfolioTestimonial[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchPortfolioTestimonials(1, HOME_TESTIMONIAL_COUNT)
      .then((response) => {
        if (!cancelled) setTestimonials(response.items);
      })
      .catch(() => {
        if (!cancelled) setTestimonials([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (testimonials.length < 2) return;

    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % testimonials.length), ROTATION_MS);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex"
        animate={{ x: `-${current * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="min-w-full px-1 md:px-4">
            <motion.article
              className="relative bg-white/92 backdrop-blur-xl rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_12px_44px_rgba(15,23,42,0.08)]"
              whileHover={{ y: -4 }}
            >
              <div className="absolute top-7 right-7 w-14 h-14 rounded-full bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 flex items-center justify-center">
                <Quote className="w-6 h-6 text-[#00c389]" />
              </div>

              <div className="flex items-center gap-5 mb-6 pr-16">
                <div
                  aria-hidden="true"
                  className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-br from-[#00c389] to-[#16b8ff] text-white text-xl font-bold flex items-center justify-center"
                >
                  {testimonialInitials(testimonial.author)}
                </div>

                <div>
                  <h4 className="text-[#0f172a] text-lg font-bold">{testimonial.author ?? "Utasunk"}</h4>
                  <p className="text-gray-500 text-sm">
                    {testimonial.title} · {formatTestimonialDate(testimonial.publishedAt)}
                  </p>
                </div>
              </div>

              <div className="w-20 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent opacity-50 mb-6" />

              <p className="text-gray-700 text-lg md:text-xl leading-relaxed">„{testimonial.excerpt}”</p>

              <Link
                to={`/rolunk-irtak#${testimonialAnchor(testimonial.id)}`}
                className="inline-flex items-center gap-2 mt-6 text-[#00a878] font-semibold hover:text-[#0f8fc9] transition-colors"
              >
                Tovább olvasom
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.article>
          </div>
        ))}
      </motion.div>

      <div className="flex justify-center gap-2 mt-7">
        {testimonials.map((testimonial, index) => (
          <button
            key={testimonial.id}
            type="button"
            aria-label={`${index + 1}. levél`}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index ? "w-8 bg-gradient-to-r from-[#00c389] to-[#16b8ff]" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
