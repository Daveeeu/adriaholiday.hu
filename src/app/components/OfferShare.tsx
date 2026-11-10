import { useEffect, useState } from "react";
import { Check, Facebook, Link2, Mail, MessageCircle, Share2, type LucideIcon } from "lucide-react";

import { useAnalytics } from "../analytics/useAnalytics";
import { shareLinks, type ShareMethod } from "../lib/offerShare";
import { absoluteUrl } from "../seo/site";

type OfferShareProps = {
  slug: string;
  title: string;
};

type CopyState = "idle" | "copied" | "failed";

const COPY_FEEDBACK_MS = 2500;

const BUTTON_CLASS =
  "flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#0f172a] transition-all hover:border-[#00c389]/40 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)]";

function canShareNatively() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export default function OfferShare({ slug, title }: OfferShareProps) {
  const { trackEvent } = useAnalytics();
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [nativeShare] = useState(canShareNatively);

  const url = absoluteUrl(`/ajanlat/${slug}`);
  const links = shareLinks({ url, title });

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = window.setTimeout(() => setCopyState("idle"), COPY_FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const trackShare = (method: ShareMethod) => {
    trackEvent("share", {
      entity: { type: "tour", slug },
      metadata: { method, content_type: "tour", item_id: slug },
    });
  };

  const shareNatively = async () => {
    try {
      await navigator.share({ title, text: title, url });
      trackShare("native");
    } catch {
      // The visitor closed the share sheet; nothing to report.
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      trackShare("copy_link");
    } catch {
      setCopyState("failed");
    }
  };

  const linkButtons: Array<{ method: ShareMethod; label: string; href: string; icon: LucideIcon; newTab: boolean }> = [
    { method: "facebook", label: "Facebook", href: links.facebook, icon: Facebook, newTab: true },
    { method: "whatsapp", label: "WhatsApp", href: links.whatsapp, icon: MessageCircle, newTab: true },
    { method: "email", label: "E-mail", href: links.email, icon: Mail, newTab: false },
  ];

  return (
    <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f172a]">
        <Share2 className="h-4 w-4 text-[#00c389]" />
        Oszd meg ismerőseiddel
      </div>

      {nativeShare ? (
        <button
          type="button"
          onClick={shareNatively}
          className="mb-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0f172a] text-sm font-bold text-white transition-all hover:bg-[#1e293b]"
        >
          <Share2 className="h-4 w-4" />
          Megosztás
        </button>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        {linkButtons.map(({ method, label, href, icon: Icon, newTab }) => (
          <a
            key={method}
            href={href}
            onClick={() => trackShare(method)}
            {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={BUTTON_CLASS}
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        ))}

        <button type="button" onClick={copyLink} className={BUTTON_CLASS}>
          {copyState === "copied" ? <Check className="h-4 w-4 text-[#00c389]" /> : <Link2 className="h-4 w-4" />}
          {copyState === "copied" ? "Másolva" : "Link másolása"}
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {copyState === "copied" ? "A link a vágólapra került." : ""}
      </p>

      {copyState === "failed" ? (
        <p className="mt-2 text-center text-xs text-red-500" role="alert">
          Nem sikerült a másolás. A link: {url}
        </p>
      ) : null}
    </div>
  );
}
