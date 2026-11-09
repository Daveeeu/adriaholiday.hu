import { EntitySidePanel } from '@/components/admin/entity-side-panel';
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

import {
  ACTIVITY_EVENT_BADGE_CLASSES,
  accessChangeLabel,
  activityEventLabel,
  activityFieldLabel,
  describeUserAgent,
  formatChangeValue,
  isAuthEntry,
  loginFailureReasonLabel,
} from '../lib/activity-log.constants';
import type { ActivityLogEntry } from '../lib/activity-log.types';

type ActivityLogDetailPanelProps = {
  entry?: ActivityLogEntry;
  onClose: () => void;
};

export function ActivityLogDetailPanel({
  entry,
  onClose,
}: ActivityLogDetailPanelProps) {
  if (!entry) return null;

  const details = [
    { label: 'Időpont', value: formatDateTime(entry.createdAt) },
    {
      label: 'Felhasználó',
      value: entry.causer
        ? `${entry.causer.name} (${entry.causer.email})`
        : 'Látogató vagy rendszer',
    },
    entry.subject
      ? {
          label: 'Elem',
          value: [
            entry.subject.typeLabel,
            entry.subject.label,
            entry.subject.id ? `#${entry.subject.id}` : null,
            entry.subject.exists ? null : '(már nem létezik)',
          ]
            .filter(Boolean)
            .join(' · '),
        }
      : null,
    accessChangeLabel(entry.description)
      ? { label: 'Változás', value: accessChangeLabel(entry.description) }
      : null,
    entry.context.email
      ? { label: 'Megadott e-mail', value: entry.context.email }
      : null,
    entry.context.reason
      ? { label: 'Ok', value: loginFailureReasonLabel(entry.context.reason) }
      : null,
    entry.context.ip ? { label: 'IP-cím', value: entry.context.ip } : null,
    entry.context.userAgent
      ? {
          label: 'Böngésző',
          value: describeUserAgent(entry.context.userAgent),
          hint: entry.context.userAgent,
        }
      : null,
  ].filter(
    (
      detail,
    ): detail is { label: string; value: string | null; hint?: string } =>
      detail !== null,
  );

  return (
    <EntitySidePanel
      open
      eyebrow="Napló"
      title={activityEventLabel(entry)}
      description={formatDateTime(entry.createdAt)}
      widthClassName="max-w-[min(100vw,760px)]"
      onOpenChange={(open) => (open ? undefined : onClose())}
    >
      <div className="space-y-6 p-6">
        {entry.event ? (
          <Badge className={cn(ACTIVITY_EVENT_BADGE_CLASSES[entry.event])}>
            {activityEventLabel(entry)}
          </Badge>
        ) : null}

        <dl className="grid gap-3 text-sm sm:grid-cols-[160px_1fr]">
          {details.map((detail) => (
            <div key={detail.label} className="contents">
              <dt className="text-muted-foreground">{detail.label}</dt>
              <dd className="break-words font-medium" title={detail.hint}>
                {detail.value ?? '—'}
              </dd>
            </div>
          ))}
        </dl>

        {entry.changes.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Mi változott</h3>
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mező</TableHead>
                    <TableHead>Régi érték</TableHead>
                    <TableHead>Új érték</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entry.changes.map((change) => (
                    <TableRow key={change.field}>
                      <TableCell
                        className="align-top font-medium"
                        title={change.field}
                      >
                        {activityFieldLabel(change.field)}
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap break-words align-top text-muted-foreground">
                        {formatChangeValue(change.old)}
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap break-words align-top">
                        {formatChangeValue(change.new)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : !isAuthEntry(entry) ? (
          <p className="text-sm text-muted-foreground">
            Ehhez a bejegyzéshez nem tartozik mezőszintű változás.
          </p>
        ) : null}
      </div>
    </EntitySidePanel>
  );
}
