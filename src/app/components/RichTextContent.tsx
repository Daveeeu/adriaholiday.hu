import { useKeywordHighlight } from "../content/keyword-highlight-context";
import { cn } from "./ui/utils";

type RichTextContentProps = {
  /** Sanitized HTML produced by the admin rich-text editor. */
  html: string;
  size?: "base" | "lg";
  className?: string;
};

const BRAND_PROSE_CLASSES = [
  "prose prose-slate max-w-none",
  "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#0f172a]",
  "prose-p:leading-8 prose-p:text-[#475569]",
  "prose-li:text-[#475569] prose-li:marker:text-[#00c389]",
  "prose-strong:text-[#0f172a]",
  "prose-a:font-semibold prose-a:text-[#00a878] prose-a:no-underline hover:prose-a:text-[#0f8fc9]",
  "prose-blockquote:border-l-[#00c389] prose-blockquote:text-[#334155]",
];

export default function RichTextContent({
  html,
  size = "base",
  className,
}: RichTextContentProps) {
  const highlight = useKeywordHighlight();

  return (
    <div
      className={cn(BRAND_PROSE_CLASSES, size === "lg" && "prose-lg", className)}
      dangerouslySetInnerHTML={{ __html: highlight(html) }}
    />
  );
}
