import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

type TourFormSectionProps = {
  title: string;
  description: string;
  countLabel?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

/** A collapsible section of the tour editor. */
export function TourFormSection({
  title,
  description,
  countLabel,
  open,
  onToggle,
  children,
}: TourFormSectionProps) {
  return (
    <section className="overflow-hidden rounded-[22px] border bg-card shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/20"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {countLabel ? (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {countLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground">
          {open ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </span>
      </button>

      {open ? <div className="border-t px-4 py-4">{children}</div> : null}
    </section>
  );
}
