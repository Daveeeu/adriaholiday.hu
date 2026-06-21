import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type CrudEmptyStateProps = {
  title: string;
  description: string;
  className?: string;
  action?: ReactNode;
};

export function CrudEmptyState({
  title,
  description,
  className,
  action,
}: CrudEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-14 text-center',
        className,
      )}
    >
      <div className="max-w-md space-y-3">
        <div className="text-lg font-semibold tracking-tight">{title}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  );
}
