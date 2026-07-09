import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AccordionItemProps = {
  title: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

export function AccordionItem({
  title,
  badge,
  defaultOpen = false,
  children,
  className,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-background', className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-foreground">
          {title}
          {badge}
        </span>
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open ? <div className="border-t px-4 py-3">{children}</div> : null}
    </div>
  );
}
