import { cn } from '@/lib/utils';
import { richTextBlockClassName, sanitizeRichTextHtml } from '@/lib/rich-text';

export function RichTextPreview({
  value,
  className = '',
}: {
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        richTextBlockClassName(
          'rounded-xl border bg-muted/20 px-3 py-2 text-sm',
        ),
        className,
      )}
      dangerouslySetInnerHTML={{
        __html: sanitizeRichTextHtml(value) || '<p>—</p>',
      }}
    />
  );
}
