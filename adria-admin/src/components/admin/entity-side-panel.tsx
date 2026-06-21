import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EntitySidePanelProps = {
  open: boolean;
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  onOpenChange: (open: boolean) => void;
  className?: string;
  widthClassName?: string;
};

export function EntitySidePanel({
  open,
  title,
  description,
  eyebrow,
  children,
  footer,
  headerActions,
  onOpenChange,
  className,
  widthClassName = 'max-w-[min(100vw,1100px)]',
}: EntitySidePanelProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-50 flex h-dvh w-full transform-gpu flex-col border-l bg-background shadow-2xl transition-transform duration-300',
        widthClassName,
        className,
      )}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background px-6 py-5 backdrop-blur">
        <div className="space-y-1">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {headerActions}
          <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {children}
      </div>

      {footer ? (
        <div className="sticky bottom-0 z-10 border-t bg-background/95 px-6 py-4 backdrop-blur">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
