import {
  Compass,
  CreditCard,
  FileText,
  Info,
  Sparkles,
  Ticket,
  type LucideIcon,
} from "lucide-react";

import { isRichTextEmpty, sanitizeRichTextHtml } from "@/lib/rich-text";

import { Fragment } from "react";

import RichTextContent from "./RichTextContent";
import { useKeywordHighlight } from "../content/keyword-highlight-context";
import { galleryImageUrl } from "../content/offer-gallery";
import type { PortfolioOfferGalleryItem } from "../content/portfolio-offer-detail-api";
import { splitProgramDays } from "../lib/programDays";
import { responsiveImage } from "../lib/responsiveImage";
import { tripSection } from "../lib/tripSection";
import { JUSTIFIED_TEXT } from "../lib/justifiedText";
import { TRIP_SECTION_HEADING } from "../lib/tripTypography";

type OfferContentSectionProps = {
  title: string;
  content?: string | null;
  className?: string;
  /** The section's tab in the trip page's section navigation; none: not listed. */
  navLabel?: string;
  /** Photos set between a program's days, one per gap while they last. */
  photos?: PortfolioOfferGalleryItem[];
};

const PROSE_CLASS_NAME = `prose-h2:mb-4 prose-h2:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-lg prose-p:text-[0.95rem] prose-p:leading-7 prose-li:text-[0.95rem] prose-li:leading-7 ${JUSTIFIED_TEXT}`;

type SectionMeta = { eyebrow: string; icon: LucideIcon };

/** Each trip section's label above its title, by the title it is rendered with. */
const SECTION_META: Record<string, SectionMeta> = {
  Kedvcsináló: { eyebrow: "HANGOLÓDÁS", icon: Sparkles },
  Program: { eyebrow: "ÚTITERV", icon: Compass },
  "Tudnivalók a programhoz": { eyebrow: "TUDNIVALÓK", icon: Info },
  Belépőjegyek: { eyebrow: "BELÉPŐK", icon: Ticket },
  "Jegyzet / egyéb": { eyebrow: "MEGJEGYZÉS", icon: FileText },
  "Fakultatív programok": { eyebrow: "VÁLASZTHATÓ PROGRAMOK", icon: Ticket },
  "Kiegészítő / fizető programok": { eyebrow: "FIZETŐS PROGRAMOK", icon: Ticket },
  "További szolgáltatási információk": { eyebrow: "TUDNIVALÓK", icon: Info },
  Árak: { eyebrow: "ÁRINFORMÁCIÓ", icon: CreditCard },
  Kedvezmények: { eyebrow: "ELŐNYÖK", icon: Sparkles },
};

const DEFAULT_SECTION_META: SectionMeta = { eyebrow: "RÉSZLETEK", icon: Compass };

export default function OfferContentSection({
  title,
  content,
  className = "",
  navLabel,
  photos = [],
}: OfferContentSectionProps) {
  const highlight = useKeywordHighlight();

  if (isRichTextEmpty(content)) {
    return null;
  }

  const html = sanitizeRichTextHtml(content);

  if (html === "") {
    return null;
  }

  const meta = SECTION_META[title] ?? DEFAULT_SECTION_META;
  // Marked as a whole before the split, so each keyword is marked once in the section.
  const parts = photos.length > 0 ? withPhotoGaps(splitProgramDays(highlight(html)), photos.length) : [highlight(html)];
  const Icon = meta.icon;

  return (
    <section className={`mb-20 ${className}`} {...(navLabel ? tripSection(navLabel) : {})}>
      <div className="inline-flex items-center gap-2 text-[#00a878] text-sm font-bold mb-4">
        <Icon className="w-4 h-4" />
        {meta.eyebrow}
      </div>

      <h2 className={`${TRIP_SECTION_HEADING} mb-6`}>
        {title}
      </h2>

      <div className="rounded-[34px] border border-[#e7eef5] bg-white shadow-[0_12px_42px_rgba(15,23,42,0.05)]">
        <div className="p-6 md:p-8 lg:p-9">
          {parts.map((part, index) => (
            <Fragment key={index}>
              {index > 0 ? <ProgramPhoto item={photos[index - 1]} /> : null}
              <RichTextContent html={part} className={PROSE_CLASS_NAME} highlightKeywords={false} />
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The program's days, the last ones merged once the photos run out, so no photo repeats. */
function withPhotoGaps(days: string[], photoCount: number): string[] {
  return days.length - 1 <= photoCount ? days : [...days.slice(0, photoCount), days.slice(photoCount).join("")];
}

function ProgramPhoto({ item }: { item: PortfolioOfferGalleryItem }) {
  const caption = item.caption?.trim() || item.title?.trim() || "";

  return (
    <figure className="my-8">
      <img
        {...responsiveImage(galleryImageUrl(item))}
        sizes="(min-width: 1280px) 50vw, 100vw"
        alt={(item.alt || item.title || caption).trim()}
        className="aspect-[16/9] w-full rounded-[24px] object-cover"
        loading="lazy"
        decoding="async"
      />
      {caption ? <figcaption className="mt-2 text-sm text-gray-500">{caption}</figcaption> : null}
    </figure>
  );
}
