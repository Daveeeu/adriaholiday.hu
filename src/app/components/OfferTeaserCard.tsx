import { Sparkles } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

import { isRichTextEmpty, sanitizeRichTextHtml } from "@/lib/rich-text";

import RichTextContent from "./RichTextContent";

type OfferTeaserCardProps = {
  content?: string | null;
  className?: string;
};

/**
 * The trip's "Kedvcsináló" in the booking sidebar: the opening lines stay
 * visible, the rest opens on demand so the date picker and the booking
 * button stay within reach.
 */
export default function OfferTeaserCard({ content, className = "" }: OfferTeaserCardProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const html = isRichTextEmpty(content) ? "" : sanitizeRichTextHtml(content);

  useLayoutEffect(() => {
    const text = textRef.current;
    setOverflowing(text !== null && text.scrollHeight > text.clientHeight + 1);
  }, [html]);

  if (html === "") {
    return null;
  }

  const clamped = !expanded && overflowing;

  return (
    <div className={`mb-6 rounded-[24px] bg-[#f5f9fc] p-5 ${className}`}>
      <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#00a878]">
        <Sparkles className="h-4 w-4" />
        Kedvcsináló
      </div>

      <div className="relative">
        <div ref={textRef} className={expanded ? "" : "max-h-48 overflow-hidden"}>
          <RichTextContent html={html} className="prose-sm prose-p:my-2 first:prose-p:mt-0" />
        </div>

        {clamped ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f5f9fc] to-transparent" />
        ) : null}
      </div>

      {overflowing ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-3 text-sm font-semibold text-[#00a878] transition-colors hover:text-[#0f172a]"
        >
          {expanded ? "Kevesebb" : "Tovább olvasom"}
        </button>
      ) : null}
    </div>
  );
}
