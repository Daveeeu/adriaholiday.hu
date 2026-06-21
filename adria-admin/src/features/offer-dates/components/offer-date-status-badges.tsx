import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OfferDate } from '@/types/domain';

type OfferDateStatusBadgesProps = {
  active: boolean;
  xmlExportEnabled: boolean;
  status: OfferDate['status'];
};

export function OfferDateStatusBadges({
  active,
  xmlExportEnabled,
  status,
}: OfferDateStatusBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        className={cn(
          'border-transparent capitalize',
          active
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
        )}
      >
        {active ? 'active' : 'inactive'}
      </Badge>
      <Badge
        className={cn(
          'border-transparent',
          xmlExportEnabled
            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {xmlExportEnabled ? 'XML on' : 'XML off'}
      </Badge>
      <Badge className="border-transparent bg-secondary text-secondary-foreground capitalize">
        {status.replace('_', ' ')}
      </Badge>
    </div>
  );
}
