import { Link } from "react-router";
import Seo from "../seo/Seo";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";

export default function StaticPage({
  title,
  children,
  canonicalPath,
  noIndex,
}: {
  title: string;
  children?: React.ReactNode;
  canonicalPath?: string;
  noIndex?: boolean;
}) {
  const { settings } = useSiteSettings();

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={title}
        description={settings.siteName ? `${title} – ${settings.siteName}` : title}
        canonicalPath={canonicalPath ?? "/"}
        noIndex={noIndex}
      />
      <div className="max-w-4xl mx-auto px-8 md:px-12 lg:px-20 py-16">
        <h1 className="text-4xl font-bold text-[#0f172a] tracking-tight">
          {title}
        </h1>
        <div className="mt-6 text-[#475569] leading-relaxed text-lg">
          {children ?? <p>Hamarosan…</p>}
        </div>
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-semibold"
          >
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    </div>
  );
}
