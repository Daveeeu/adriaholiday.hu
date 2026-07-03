import { motion } from "motion/react";
import { NavLink, Link, useLocation } from "react-router";
import { Phone, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { trackEvent } from "../analytics/trackEvent";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";

function isInternalLink(value: string) {
  return value.startsWith("/") || value.startsWith("#");
}

function Brand() {
  const { settings } = useSiteSettings();

  return (
    <Link to="/" className="inline-flex items-center">
      {settings.siteName ? <span className="sr-only">{settings.siteName}</span> : null}
      <span
        className={[
          "rounded-2xl px-3 py-2",
          "bg-[#0A1628]/90 backdrop-blur-xl border border-white/15",
        ].join(" ")}
      >
        {settings.logo?.url ? (
          <img
            src={settings.logo.url}
            alt={settings.logo.alt || settings.siteName || "Logo"}
            title={settings.logo.title || settings.siteName || undefined}
            className="h-9 lg:h-10 w-auto max-w-[220px] lg:max-w-[260px] drop-shadow-[0_10px_26px_rgba(0,0,0,0.25)]"
          />
        ) : settings.siteName ? (
          <span className="text-lg font-semibold tracking-tight text-white">
            {settings.siteName}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function DesktopNav() {
  const { settings } = useSiteSettings();

  if (settings.headerNavigation.length === 0) {
    return null;
  }

  return (
    <nav className="hidden md:flex items-center gap-2">
      {settings.headerNavigation.map((item) => (
        <NavLink
          key={`${item.to}-${item.label}`}
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
  const { settings } = useSiteSettings();
  const [showHeader, setShowHeader] = useState(true);
  const ctaLabel = settings.primaryCtaText;
  const ctaLink = settings.primaryCtaLink;
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

  if (!showHeader) {
    return null;
  }

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
            {settings.phone ? (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
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
                {settings.phone}
              </a>
            ) : null}

            {ctaLabel && ctaLink ? (
              isInternalLink(ctaLink) ? (
                <Link
                  to={ctaLink}
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
              ) : (
                <a
                  href={ctaLink}
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
                </a>
              )
            ) : null}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
