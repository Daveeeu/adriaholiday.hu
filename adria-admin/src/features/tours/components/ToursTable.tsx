import {
  flexRender,
  type PaginationState,
  type SortingState,
  type Table as ReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import type { Tour } from '../lib/tours.types';

type ToursTableProps = {
  table: ReactTable<Tour>;
  sorting: SortingState;
  pagination: PaginationState;
  totalCount: number;
  onPageSizeChange: (pageSize: number) => void;
};

export function ToursTable({
  table,
  sorting,
  pagination,
  totalCount,
  onPageSizeChange,
}: ToursTableProps) {
  const rows = table.getRowModel().rows;
  const pageFrom = rows.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const pageTo = pagination.pageIndex * pagination.pageSize + rows.length;

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(header.column.id === 'actions' && 'text-right')}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(cell.column.id === 'actions' && 'text-right')}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllLeafColumns().length}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  Nincs megjeleníthető körutazás.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Találatok: <span className="font-medium text-foreground">{pageFrom}</span>-
          <span className="font-medium text-foreground">{pageTo}</span> /{' '}
          <span className="font-medium text-foreground">{totalCount}</span>{' '}
          összesen
          <span className="ml-2">
            | Rendezés:{' '}
            <span className="font-medium text-foreground">
              {sorting[0]?.id ?? 'sortOrder'}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Sorok száma
            <select
              value={pagination.pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {pagination.pageIndex + 1} / {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

