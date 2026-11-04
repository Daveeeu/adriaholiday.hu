import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { ACTIVITY_EVENT_LABELS } from '../lib/activity-log.constants';
import type {
  ActivityEvent,
  ActivityLogFilterOptions,
  ActivityLogFilters,
} from '../lib/activity-log.types';

type ActivityLogFiltersBarProps = {
  filters: ActivityLogFilters;
  options?: ActivityLogFilterOptions;
  onChange: (filters: ActivityLogFilters) => void;
};

const selectClassName =
  'flex h-10 w-full rounded-md border bg-background px-3 text-sm';

export function ActivityLogFiltersBar({
  filters,
  options,
  onChange,
}: ActivityLogFiltersBarProps) {
  const update = (patch: Partial<ActivityLogFilters>) =>
    onChange({ ...filters, ...patch });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Felhasználó
        <select
          className={selectClassName}
          value={filters.userId ?? ''}
          onChange={(event) =>
            update({ userId: event.target.value || undefined })
          }
        >
          <option value="">Mindenki</option>
          {options?.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email}){user.isActive ? '' : ' – inaktív'}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Művelet
        <select
          className={selectClassName}
          value={filters.event ?? ''}
          onChange={(event) =>
            update({
              event: (event.target.value || undefined) as
                | ActivityEvent
                | undefined,
            })
          }
        >
          <option value="">Minden művelet</option>
          {options?.events.map((event) => (
            <option key={event} value={event}>
              {ACTIVITY_EVENT_LABELS[event]}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Rekordtípus
        <select
          className={selectClassName}
          value={filters.subjectType ?? ''}
          onChange={(event) =>
            update({ subjectType: event.target.value || undefined })
          }
        >
          <option value="">Minden típus</option>
          {options?.subjectTypes.map((type) => (
            <option key={type.key} value={type.key}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Dátumtól
        <Input
          type="date"
          value={filters.dateFrom ?? ''}
          max={filters.dateTo}
          onChange={(event) =>
            update({ dateFrom: event.target.value || undefined })
          }
        />
      </label>

      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Dátumig
        <Input
          type="date"
          value={filters.dateTo ?? ''}
          min={filters.dateFrom}
          onChange={(event) =>
            update({ dateTo: event.target.value || undefined })
          }
        />
      </label>

      <div className="flex items-end">
        <Button
          variant="outline"
          className="w-full"
          disabled={!hasFilters}
          onClick={() => onChange({})}
        >
          Szűrők törlése
        </Button>
      </div>
    </div>
  );
}
