import {
  Compass,
  CreditCard,
  FileText,
  Info,
  Sparkles,
  Ticket,
} from "lucide-react";

import { isRichTextEmpty, sanitizeRichTextHtml } from "@/lib/rich-text";

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
          <div
            className="prose prose-slate max-w-none
              prose-headings:text-[#0f172a]
              prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4
              prose-h3:text-xl prose-h3:font-bold prose-h3:mb-3 prose-h3:mt-8
              prose-p:text-[1.02rem] prose-p:leading-8 prose-p:text-[#475569]
              prose-strong:text-[#0f172a]
              prose-a:text-[#00a878] prose-a:font-semibold prose-a:no-underline hover:prose-a:text-[#0f8fc9]
              prose-ul:my-5 prose-ul:space-y-2
              prose-ol:my-5 prose-ol:space-y-2
              prose-ul:pl-5 prose-ol:pl-5
              prose-li:text-[#475569] prose-li:leading-7
              prose-li:marker:text-[#00c389]
              prose-table:w-full prose-table:overflow-hidden prose-table:rounded-[24px] prose-table:border prose-table:border-[#dbe9f7]
              prose-thead:bg-[#f5f9fc]
              prose-th:border-b prose-th:border-[#dbe9f7] prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-xs prose-th:font-bold prose-th:uppercase prose-th:tracking-[0.16em] prose-th:text-[#546174]
              prose-td:border-b prose-td:border-[#eef5fb] prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:text-[#334155]
              prose-tr:last:border-0
              [&_table]:block [&_table]:overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </section>
  );
}
