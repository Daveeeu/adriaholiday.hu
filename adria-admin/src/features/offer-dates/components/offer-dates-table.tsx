import { Copy, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OfferDateCalendarRow } from '@/features/offer-dates/routes/offer-dates-page';

import { OfferDateStatusBadges } from './offer-date-status-badges';

type OfferDatesTableProps = {
  rows: OfferDateCalendarRow[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (row: OfferDateCalendarRow) => void;
  onClone: (row: OfferDateCalendarRow) => void;
  onDelete: (row: OfferDateCalendarRow) => void;
};

export function OfferDatesTable({
  rows,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onClone,
  onDelete,
}: OfferDatesTableProps) {
  const allSelected =
    rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onSelectAll(event.target.checked)}
                />
              </TableHead>
              <TableHead>Offer</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => onToggleSelect(row.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {row.offerTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.regionName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>
                        {row.startDate} to {row.endDate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.nights} night{row.nights === 1 ? '' : 's'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">€{row.price}</TableCell>
                  <TableCell>
                    <OfferDateStatusBadges
                      active={row.active}
                      xmlExportEnabled={row.xmlExportEnabled}
                      status={row.status}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(row)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onClone(row)}
                      >
                        <Copy className="size-4" />
                        Clone
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(row)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  No offer dates matched the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
