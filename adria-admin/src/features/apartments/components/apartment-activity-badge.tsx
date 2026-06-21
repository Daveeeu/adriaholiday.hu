import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ApartmentActivityBadgeProps = {
  isActive: boolean;
};

export function ApartmentActivityBadge({ isActive }: ApartmentActivityBadgeProps) {
  return (
    <Badge
      className={cn(
        'border-transparent',
        isActive
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
      )}
    >
      {isActive ? 'Aktív' : 'Inaktív'}
    </Badge>
  );
}

