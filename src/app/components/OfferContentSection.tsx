import {
  Compass,
  CreditCard,
  FileText,
  Info,
  Sparkles,
  Ticket,
} from "lucide-react";

import { isRichTextEmpty, sanitizeRichTextHtml } from "@/lib/rich-text";

import RichTextContent from "./RichTextContent";

type OfferContentSectionProps = {
  title: string;
  content?: string | null;
};

function resolveSectionMeta(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("fizető") || normalized.includes("program")) {
    return {
      eyebrow: "KIEGÉSZÍTŐK",
      icon: Ticket,
    };
  }

  if (normalized.includes("szolgáltatási") || normalized.includes("információ")) {
    return {
      eyebrow: "TUDNIVALÓK",
      icon: Info,
    };
  }

  if (normalized.includes("ár")) {
    return {
      eyebrow: "ÁRINFORMÁCIÓ",
      icon: CreditCard,
    };
  }

  if (normalized.includes("kedvez")) {
    return {
      eyebrow: "ELŐNYÖK",
      icon: Sparkles,
    };
  }

  if (normalized.includes("jegyzet")) {
    return {
      eyebrow: "MEGJEGYZÉS",
      icon: FileText,
    };
  }

  return {
    eyebrow: "RÉSZLETEK",
    icon: Compass,
  };
}

export default function OfferContentSection({
  title,
  content,
}: OfferContentSectionProps) {
  if (isRichTextEmpty(content)) {
    return null;
  }

  const html = sanitizeRichTextHtml(content);

  if (html === "") {
    return null;
  }

  const meta = resolveSectionMeta(title);
  const Icon = meta.icon;

  return (
    <section className="mb-20">
      <div className="inline-flex items-center gap-2 text-[#00a878] text-sm font-bold mb-4">
        <Icon className="w-4 h-4" />
        {meta.eyebrow}
      </div>

      <h2 className="text-5xl font-bold text-[#0f172a] mb-6 tracking-tight">
        {title}
      </h2>

      <div className="rounded-[34px] border border-[#e7eef5] bg-white shadow-[0_12px_42px_rgba(15,23,42,0.05)]">
        <div className="p-6 md:p-8 lg:p-9">
          <RichTextContent
            html={html}
            className="prose-h2:mb-4 prose-h2:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl prose-p:text-[1.02rem] prose-li:leading-7"
          />
        </div>
      </div>
    </section>
  );
}
