import { motion } from "motion/react";
import { NavLink, Link, useLocation } from "react-router";
import { Phone, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { trackEvent } from "../analytics/trackEvent";
import { EditableMedia } from "../content/EditableFields";
import { usePortfolioContent } from "../content/PortfolioContentProvider";

const portfolioAssetBase = import.meta.env.BASE_URL;

const navItems = [
  { label: "Utazások", to: "/utazasok" },
  { label: "Blog", to: "/blog" },
  { label: "Rólunk", to: "/rolunk" },
  { label: "Kapcsolat", to: "/kapcsolat" },
] as const;

function Brand() {
  const { getValue } = usePortfolioContent();
  const logo = getValue("home.brand.logo", {
    url: `${portfolioAssetBase}adrialogo_fehernarancs.png`,
    alt: "Adria Holiday",
    title: "Adria Holiday",
  }) as { url?: string; alt?: string; title?: string };

  return (
    <Link to="/" className="inline-flex items-center">
      <span className="sr-only">Adria Holiday</span>
      <span
        className={[
          "rounded-2xl px-3 py-2",
          "bg-[#0A1628]/90 backdrop-blur-xl border border-white/15",
        ].join(" ")}
      >
        <EditableMedia
          fieldKey="home.brand.logo"
          fallback={{
            url: logo.url ?? `${portfolioAssetBase}adrialogo_fehernarancs.png`,
            alt: logo.alt ?? "Adria Holiday",
            title: logo.title ?? "Adria Holiday",
          }}
          className="leading-none"
          mediaClassName={[
            "h-9 lg:h-10 w-auto",
            "max-w-[220px] lg:max-w-[260px]",
            "drop-shadow-[0_10px_26px_rgba(0,0,0,0.25)]",
          ].join(" ")}
        />
      </span>
    </Link>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden md:flex items-center gap-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [
              "px-4 py-2 rounded-2xl text-[15px] font-semibold transition-all",
              "hover:bg-white/70 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]",
              isActive
                ? "text-[#0f172a] bg-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                : "text-[#334155]",
            ].join(" ")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Header() {
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(true);
  const ctaLabel = useMemo(
    () => (location.pathname === "/" ? "Ajánlatot kérek" : "Foglalás"),
    [location.pathname]
  );
  const isHome = useMemo(
    () => location.pathname === "/" || location.pathname === "/utazasok",
    [location.pathname]
  );

  useEffect(() => {
    const onScroll = () => {
      if (!isHome) {
        setShowHeader(true);
        return;
      }

      const threshold = Math.max(220, Math.floor(window.innerHeight * 0.7));
      setShowHeader(window.scrollY > threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  if (!showHeader) return null;

  return (
    <motion.header
      className="hidden md:block fixed top-0 left-0 right-0 z-50"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/45 backdrop-blur-2xl border-b border-white/50 shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
        <div className="mx-auto max-w-[1500px] px-8 md:px-12 lg:px-20 h-[76px] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Brand />
            <DesktopNav />
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:+36123456789"
              onClick={() =>
                trackEvent("phone_click", {
                  metadata: {
                    placement: "header",
                  },
                })
              }
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 border border-white/70 text-[#0f172a] font-semibold shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_14px_40px_rgba(15,23,42,0.10)] transition-all"
            >
              <Phone className="w-4 h-4 text-[#00c389]" />
              +36 1 234 5678
            </a>

            <Link
              to="/kapcsolat"
              onClick={() =>
                trackEvent("cta_click", {
                  metadata: {
                    cta_name: ctaLabel,
                    placement: "header",
                  },
                })
              }
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-semibold shadow-[0_14px_44px_rgba(0,195,137,0.22)] hover:shadow-[0_18px_56px_rgba(0,195,137,0.28)] transition-all"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
