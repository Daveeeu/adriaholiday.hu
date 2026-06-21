import { Badge } from '@/components/ui/badge';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';
import type { Apartment } from '@/types/domain';

type ApartmentStatusBadgeProps = {
  status: Apartment['status'];
};

export function ApartmentStatusBadge({ status }: ApartmentStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'border-transparent capitalize',
        status === 'published' &&
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        status === 'draft' &&
          'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        status === 'archived' &&
          'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
      )}
    >
      {status === 'published'
        ? t('common.published')
        : status === 'draft'
          ? t('common.draft')
          : t('common.archived')}
    </Badge>
  );
}
