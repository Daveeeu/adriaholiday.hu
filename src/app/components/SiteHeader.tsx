import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

const navItems = [
  { label: "Utazások", to: "/utazasok" },
  { label: "Rólunk", to: "/rolunk" },
  { label: "Kapcsolat", to: "/kapcsolat" },
] as const;

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isOffersActive = useMemo(() => {
    return (
      location.pathname === "/utazasok" ||
      location.pathname.startsWith("/kategoriak/")
    );
  }, [location.pathname]);

  return (
    <header
      className={[
        "sticky top-0 z-50",
        "bg-white",
        "border-b border-black/5",
        isScrolled ? "shadow-sm" : "",
      ].join(" ")}
    >
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-20">
        <div className="h-16 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Adria Holiday – Főoldal"
          >
            <span className="text-base font-semibold tracking-[-0.02em] text-slate-900">
              Adria Holiday
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2" aria-label="Fő navigáció">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "px-3 py-2 rounded-xl text-sm font-medium",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    isActive
                      ? "text-slate-900 bg-slate-900/5"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-900/5",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}

            <Link
              to="/utazasok"
              aria-label="Ajánlatok megtekintése"
              className={[
                "ml-2 px-4 py-2 rounded-xl text-sm font-semibold",
                "bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white",
                "shadow-[0_8px_24px_rgba(0,195,137,0.18)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isOffersActive ? "opacity-95" : "",
              ].join(" ")}
            >
              Ajánlatok
            </Link>
          </nav>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-black/10 bg-white text-slate-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label={isMobileMenuOpen ? "Menü bezárása" : "Menü megnyitása"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-40 bg-black/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="md:hidden fixed top-16 left-0 right-0 z-50 bg-white border-b border-black/10 shadow-lg"
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 420 }}
            >
              <div className="mx-auto max-w-[1500px] px-4 py-4">
                <nav className="grid gap-2" aria-label="Mobil navigáció">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        [
                          "px-3 py-3 rounded-xl text-base font-semibold",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                          isActive ? "bg-slate-900/5 text-slate-900" : "text-slate-700",
                        ].join(" ")
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}

                  <Link
                    to="/utazasok"
                    className="mt-2 px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white text-center shadow-[0_10px_28px_rgba(0,195,137,0.20)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Ajánlatok megtekintése
                  </Link>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
