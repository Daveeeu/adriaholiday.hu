import { motion } from "motion/react";
import { Facebook, Instagram, Mail, MapPin, Phone, Music2 } from "lucide-react";
import { Link } from "react-router";

import { useAnalytics } from "../analytics/useAnalytics";
import { trackEvent } from "../analytics/trackEvent";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";

function ExternalLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {children}
    </a>
  );
}

export default function Footer() {
  const { settings } = useSiteSettings();
  const { openConsentPreferences } = useAnalytics();

  const socialItems = [
    settings.facebook
      ? { icon: Facebook, href: settings.facebook, label: "Facebook" }
      : null,
    settings.instagram
      ? { icon: Instagram, href: settings.instagram, label: "Instagram" }
      : null,
    settings.tiktok
      ? { icon: Music2, href: settings.tiktok, label: "TikTok" }
      : null,
    settings.email
      ? { icon: Mail, href: `mailto:${settings.email}`, label: "Email" }
      : null,
  ].filter(Boolean) as Array<{ icon: typeof Facebook; href: string; label: string }>;

  return (
    <footer className="relative bg-gradient-to-br from-[#0A1628] via-[#0F1E35] to-[#1A2942] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footerGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-white" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#footerGrid)" />
        </svg>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <motion.div className="col-span-1 md:col-span-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {(settings.logo?.url || settings.siteName) ? (
              <motion.div className="mb-4" whileHover={{ scale: 1.02 }}>
                {settings.logo?.url ? (
                  <img
                    src={settings.logo.url}
                    alt={settings.logo.alt || settings.siteName || "Logo"}
                    title={settings.logo.title || settings.siteName || undefined}
                    className="h-12 w-auto max-w-[240px]"
                  />
                ) : settings.siteName ? (
                  <h3 className="text-[2rem] font-bold tracking-[-0.02em]">{settings.siteName}</h3>
                ) : null}
              </motion.div>
            ) : null}

            {settings.footerDescription ? (
              <p className="text-white/70 mb-6 max-w-md leading-relaxed">
                {settings.footerDescription}
              </p>
            ) : null}

            {socialItems.length > 0 ? (
              <div className="flex gap-3">
                {socialItems.map((social) => (
                  <motion.div
                    key={social.label}
                    aria-label={social.label}
                    className="w-11 h-11 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-[#00c389] hover:to-[#16b8ff] flex items-center justify-center transition-all duration-300 border border-white/10"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <ExternalLink href={social.href} label={social.label}>
                      <social.icon className="w-5 h-5" strokeWidth={2} />
                    </ExternalLink>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </motion.div>

          {settings.footerQuickLinks.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <h4 className="text-white mb-5 text-[1.125rem] font-bold">Gyors linkek</h4>
              <ul className="space-y-3">
                {settings.footerQuickLinks.map((item) => (
                  <motion.li key={`${item.to}-${item.label}`} whileHover={{ x: 4 }}>
                    <Link to={item.to} className="text-white/70 hover:text-[#00c389] transition-colors duration-300 text-[15px]">
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : null}

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h4 className="text-white mb-5 text-[1.125rem] font-bold">Kapcsolat</h4>
            <ul className="space-y-4">
              {settings.phone ? (
                <motion.li className="flex items-start gap-3 text-white/70" whileHover={{ x: 2 }}>
                  <div className="w-9 h-9 rounded-lg bg-[#00c389]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#00c389]" strokeWidth={2} />
                  </div>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                    className="text-[15px] pt-1.5"
                    onClick={() => trackEvent("phone_click", { metadata: { placement: "footer" } })}
                  >
                    {settings.phone}
                  </a>
                </motion.li>
              ) : null}
              {settings.email ? (
                <motion.li className="flex items-start gap-3 text-white/70" whileHover={{ x: 2 }}>
                  <div className="w-9 h-9 rounded-lg bg-[#00c389]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#00c389]" strokeWidth={2} />
                  </div>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-[15px] pt-1.5"
                    onClick={() => trackEvent("email_click", { metadata: { placement: "footer" } })}
                  >
                    {settings.email}
                  </a>
                </motion.li>
              ) : null}
              {settings.address ? (
                <motion.li className="flex items-start gap-3 text-white/70" whileHover={{ x: 2 }}>
                  <div className="w-9 h-9 rounded-lg bg-[#00c389]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#00c389]" strokeWidth={2} />
                  </div>
                  <span className="text-[15px] pt-1.5 whitespace-pre-line">{settings.address}</span>
                </motion.li>
              ) : null}
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {settings.footerCopyright ? (
            <p className="text-white/50 text-sm">{settings.footerCopyright}</p>
          ) : <span />}
          <div className="flex gap-6 text-sm text-white/50">
            {settings.imprintUrl ? (
              <motion.div className="hover:text-[#00c389] transition-colors" whileHover={{ y: -2 }}>
                <Link to={settings.imprintUrl}>Impresszum</Link>
              </motion.div>
            ) : null}
            {settings.cookieUrl ? (
              <motion.div className="hover:text-[#00c389] transition-colors" whileHover={{ y: -2 }}>
                <Link to={settings.cookieUrl}>Süti kezelés</Link>
              </motion.div>
            ) : null}
            <motion.div className="hover:text-[#00c389] transition-colors" whileHover={{ y: -2 }}>
              <button type="button" onClick={openConsentPreferences}>
                Süti beállítások módosítása
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
