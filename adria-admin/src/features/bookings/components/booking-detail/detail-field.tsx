import type { ReactNode } from 'react';

type DetailFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

function isEmptyValue(value: ReactNode): boolean {
  return value === null || value === undefined || value === '' || value === '—';
}

export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">
        {isEmptyValue(value) ? <span className="italic text-muted-foreground">Nincs adat</span> : value}
      </div>
    </div>
  );
}
