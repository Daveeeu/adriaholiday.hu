import { useEffect } from "react";

import { useSiteSettings } from "../site-settings/SiteSettingsProvider";

const PIXEL_ID_PATTERN = /^BP-[A-Za-z0-9]{10}-\d{2}$/;

type BarionPixelQueue = ((...args: unknown[]) => void) & { q?: unknown[][]; l?: number };

declare global {
  interface Window {
    bp?: BarionPixelQueue;
    barion_pixel_id?: string;
  }
}

/**
 * Base Barion Pixel: the fraud-prevention snippet Barion requires on every
 * page of an approved shop. It collects no marketing data, so it loads
 * regardless of the analytics consent; the privacy policy must mention it.
 */
export default function BarionPixel() {
  const { settings } = useSiteSettings();
  const pixelId = settings.barionPixelId;

  useEffect(() => {
    if (!PIXEL_ID_PATTERN.test(pixelId) || window.bp) {
      return;
    }

    const bp: BarionPixelQueue = (...args: unknown[]) => {
      (bp.q = bp.q ?? []).push(args);
    };
    bp.l = Date.now();
    window.bp = bp;
    window.barion_pixel_id = pixelId;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://pixel.barion.com/bp.js";
    document.head.appendChild(script);

    bp("init", "addBarionPixelId", pixelId);
  }, [pixelId]);

  return null;
}
