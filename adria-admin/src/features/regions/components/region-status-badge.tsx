import { Badge } from '@/components/ui/badge';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';

type RegionStatusBadgeProps = {
  isActive: boolean;
};

export function RegionStatusBadge({ isActive }: RegionStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'border-transparent capitalize',
        isActive
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
      )}
    >
      {isActive ? t('common.active') : t('common.inactive')}
    </Badge>
  );
}
