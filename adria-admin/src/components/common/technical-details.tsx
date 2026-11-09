import type { ReactNode } from 'react';

import { useAuthStore } from '@/store/auth-store';

type TechnicalDetailsProps = {
  items?: Array<{ label: string; value?: ReactNode }>;
  children?: ReactNode;
};

/**
 * Identifiers and tracking data only an administrator needs, closed by default.
 * This declutters the screen; it is not an access control.
 */
export function TechnicalDetails({ items = [], children }: TechnicalDetailsProps) {
  const canSee = useAuthStore((state) => state.hasPermission('activity.viewAny'));
  const filled = items.filter(
    ({ value }) => value !== null && value !== undefined && value !== '',
  );

  if (!canSee || (filled.length === 0 && !children)) {
    return null;
  }

  return (
    <details className="rounded-xl border bg-muted/20 p-3 text-sm">
      <summary className="cursor-pointer font-medium text-muted-foreground">
        Technikai adatok
      </summary>
      <div className="mt-3 space-y-3">
        {filled.length > 0 ? (
          <dl className="grid gap-2 md:grid-cols-2">
            {filled.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="break-all">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
    </details>
  );
}
