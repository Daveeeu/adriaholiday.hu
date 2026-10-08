import type { SiteMedia } from "../site-settings/site-settings.types";

type LogoBadgeProps = {
  logo: NonNullable<SiteMedia>;
  siteName: string;
  imageClassName: string;
};

/**
 * The brand logo in its original colours on a light card, so it stays legible
 * over the photo behind the header and the dark footer alike.
 */
export default function LogoBadge({ logo, siteName, imageClassName }: LogoBadgeProps) {
  return (
    <span className="inline-block rounded-2xl px-3 py-2 bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <img
        src={logo.url}
        alt={logo.alt || siteName || "Logo"}
        title={logo.title || siteName || undefined}
        className={`block w-auto ${imageClassName}`}
      />
    </span>
  );
}
