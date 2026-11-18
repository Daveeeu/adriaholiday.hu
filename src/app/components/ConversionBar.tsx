import { motion } from "motion/react";
import { Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";

const PHONE_NUMBER = "+36123456789";

export default function ConversionBar() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  const isEligibleRoute = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/ajanlat/")) return false;
    if (path === "/kapcsolat") return false;
    return path === "/" || path === "/utazasok" || path.startsWith("/kategoriak/");
  }, [location.pathname]);

  useEffect(() => {
    if (!isEligibleRoute) return;
    const onScroll = () => setIsVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isEligibleRoute]);

  if (!isEligibleRoute) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      initial={{ y: 100 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ type: "spring", stiffness: 360, damping: 34 }}
      aria-hidden={!isVisible}
    >
      <div className="bg-white border-t border-black/10 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] px-4 py-3">
        <div className="mx-auto max-w-[1500px] flex items-center gap-3">
          <Link
            to="/utazasok"
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-semibold flex items-center justify-center shadow-[0_10px_28px_rgba(0,195,137,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Ajánlatok megtekintése
          </Link>
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="w-12 h-12 rounded-xl border border-black/10 bg-white text-slate-900 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Hívás"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

