import { ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { CrudEmptyState } from './crud-empty-state';
import type { CrudSortDirection } from '../lib/bookings.types';

export type DataTableColumn<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  title: string;
  description?: string;
  columns: Array<DataTableColumn<T>>;
  items: T[];
  totalCount: number;
  page: number;
  perPage: number;
  sortBy: string;
  sortDirection: CrudSortDirection;
  emptyText: string;
  isLoading?: boolean;
  actionsLabel?: string;
  onSortChange: (key: string) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  renderActions: (item: T) => ReactNode;
}

export function DataTable<T>({
  title,
  description,
  columns,
  items,
  totalCount,
  page,
  perPage,
  sortBy,
  sortDirection,
  emptyText,
  isLoading = false,
  actionsLabel = 'Műveletek',
  onSortChange,
  onPageChange,
  onPerPageChange,
  renderActions,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const start = totalCount === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalCount);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <div className="h-1 w-full rounded-full bg-primary/20" /> : null}
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => {
                  const isSorted = sortBy === column.key;
                  return (
                    <TableHead
                      key={column.key}
                      className={cn(column.headerClassName, column.className)}
                    >
                      {column.sortable ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="-ml-3 h-auto px-3 py-2 font-medium text-muted-foreground hover:text-foreground"
                          onClick={() => onSortChange(column.key)}
                        >
                          <span>{column.label}</span>
                          <ArrowUpDown
                            className={cn(
                              'size-4 transition-all',
                              isSorted ? 'opacity-100' : 'opacity-40',
                              isSorted && sortDirection === 'desc' ? 'rotate-180' : '',
                            )}
                          />
                        </Button>
                      ) : (
                        column.label
                      )}
                    </TableHead>
                  );
                })}
                <TableHead className="w-[180px] text-right">{actionsLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && items.length === 0 ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={cn(column.className)}>
                        <Skeleton className="h-4 w-full max-w-[12rem]" />
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="py-8"
                  >
                    <CrudEmptyState
                      title="Nincs megjeleníthető rekord"
                      description={emptyText}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(column.className)}
                      >
                        {column.render(item)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">{renderActions(item)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border bg-muted/25 px-4 py-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            {totalCount === 0
              ? 'Nincs megjeleníthető rekord.'
              : `${start}-${end} / ${totalCount} rekord`}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Sorok
            </label>
            <select
              value={perPage}
              onChange={(event) => onPerPageChange(Number(event.target.value))}
              className="h-9 rounded-xl border bg-background px-3 text-sm text-foreground outline-none"
            >
              {[5, 10, 20, 50].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                Előző
              </Button>
              <span className="min-w-[88px] text-center text-xs font-medium uppercase tracking-[0.18em]">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                Következő
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
