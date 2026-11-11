import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { ListPagination } from '@/components/admin/list-pagination';
import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/date-format';
import { cn } from '@/lib/utils';

import { ActivityLogDetailPanel } from '../components/ActivityLogDetailPanel';
import { ActivityLogFiltersBar } from '../components/ActivityLogFiltersBar';
import {
  activityLogQueryKey,
  getActivityLog,
  getActivityLogFilterOptions,
} from '../lib/activity-log.api';
import {
  ACTIVITY_EVENT_BADGE_CLASSES,
  accessChangeLabel,
  activityEventLabel,
  activityFieldLabel,
  describeUserAgent,
  describeAiQuery,
  isAuthEntry,
  loginFailureReasonLabel,
} from '../lib/activity-log.constants';
import type {
  ActivityLogEntry,
  ActivityLogFilters,
} from '../lib/activity-log.types';

const PER_PAGE = 25;
const MAX_SUMMARY_FIELDS = 3;

function summarize(entry: ActivityLogEntry) {
  if (isAuthEntry(entry)) {
    return [
      loginFailureReasonLabel(entry.context.reason),
      entry.context.ip,
      describeUserAgent(entry.context.userAgent),
    ]
      .filter(Boolean)
      .join(' · ');
  }

  const aiQuery = describeAiQuery(entry);
  if (aiQuery) return aiQuery;

  const access = accessChangeLabel(entry.description);
  if (access) return access;

  if (entry.changes.length === 0) return '—';
  if (entry.event === 'created')
    return `Új elem, ${entry.changes.length} mező kitöltve`;
  if (entry.event === 'deleted')
    return `Törölt elem, ${entry.changes.length} mező mentve`;

  const fields = entry.changes
    .slice(0, MAX_SUMMARY_FIELDS)
    .map((change) => activityFieldLabel(change.field));
  const rest = entry.changes.length - fields.length;

  return rest > 0
    ? `${fields.join(', ')} és még ${rest} mező`
    : fields.join(', ');
}

export function ActivityLogPage() {
  const [filters, setFilters] = useState<ActivityLogFilters>({});
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ActivityLogEntry | undefined>();

  const { data: filterOptions } = useQuery({
    queryKey: [...activityLogQueryKey, 'filters'],
    queryFn: getActivityLogFilterOptions,
    select: (response) => response.data,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: [...activityLogQueryKey, { page, ...filters }],
    queryFn: () => getActivityLog({ page, perPage: PER_PAGE, ...filters }),
    placeholderData: (previous) => previous,
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a naplót.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Rendszergazda</p>
        <h1 className="text-3xl font-semibold tracking-tight">Napló</h1>
        <p className="text-sm text-muted-foreground">
          Ki és mikor lépett be az adminba, és ki melyik elemet hozta létre,
          módosította vagy törölte. Egy sorra kattintva látod, mi változott.
        </p>
      </div>

      <ActivityLogFiltersBar
        filters={filters}
        options={filterOptions}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Időpont</TableHead>
                <TableHead>Felhasználó</TableHead>
                <TableHead>Művelet</TableHead>
                <TableHead>Elem</TableHead>
                <TableHead>Részletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length > 0 ? (
                data.items.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(entry)}
                  >
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {formatDateTime(entry.createdAt)}
                    </TableCell>
                    <TableCell>
                      {entry.causer ? (
                        <div>
                          <div className="font-medium">{entry.causer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {entry.causer.email}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-muted-foreground">
                            Látogató vagy rendszer
                          </div>
                          {entry.context.email ? (
                            <div className="text-xs text-muted-foreground">
                              {entry.context.email}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.event ? (
                        <Badge
                          className={cn(
                            'whitespace-nowrap',
                            ACTIVITY_EVENT_BADGE_CLASSES[entry.event],
                          )}
                        >
                          {activityEventLabel(entry)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          {entry.description}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.subject && !isAuthEntry(entry) ? (
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {entry.subject.typeLabel}
                          </div>
                          <div
                            className={cn(
                              'max-w-xs truncate font-medium',
                              !entry.subject.exists && 'line-through',
                            )}
                          >
                            {entry.subject.label ?? 'Név nélkül'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-sm truncate text-sm text-muted-foreground">
                      {summarize(entry)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-28 text-center text-sm text-muted-foreground"
                  >
                    Nincs a szűrőknek megfelelő bejegyzés.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ListPagination
          page={page}
          perPage={PER_PAGE}
          totalCount={data.totalCount}
          onPageChange={setPage}
        />
      </div>

      <ActivityLogDetailPanel
        entry={selected}
        onClose={() => setSelected(undefined)}
      />
    </div>
  );
}
