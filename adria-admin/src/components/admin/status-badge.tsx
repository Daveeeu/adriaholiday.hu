import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
};

export function StatusBadge({ active, activeLabel, inactiveLabel }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700',
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
