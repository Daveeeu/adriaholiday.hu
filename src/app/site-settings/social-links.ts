import { Facebook, Instagram } from "lucide-react";
import type { ComponentType } from "react";

import TikTokIcon from "../components/icons/TikTokIcon";
import type { ResolvedSiteSettings } from "./site-settings.types";

type SocialIcon = ComponentType<{ className?: string; strokeWidth?: number }>;

export type SocialLink = {
  label: string;
  href: string;
  icon: SocialIcon;
};

/** The agency's social profiles that are set in the site settings, in display order. */
export function socialLinks(settings: Pick<ResolvedSiteSettings, "facebook" | "instagram" | "tiktok">): SocialLink[] {
  const links: Array<SocialLink | null> = [
    settings.facebook ? { label: "Facebook", href: settings.facebook, icon: Facebook } : null,
    settings.instagram ? { label: "Instagram", href: settings.instagram, icon: Instagram } : null,
    settings.tiktok ? { label: "TikTok", href: settings.tiktok, icon: TikTokIcon } : null,
  ];

  return links.filter((link): link is SocialLink => link !== null);
}
