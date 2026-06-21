import {
  flexRender,
  type PaginationState,
  type SortingState,
  type Table as ReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Eye, Pencil, Power, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/i18n';
import { APARTMENT_TYPES } from '@/features/apartments/constants/apartmentTypes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import type { ApartmentRow } from '@/features/apartments/routes/apartments-page';

type ApartmentsTableProps = {
  table: ReactTable<ApartmentRow>;
  sorting: SortingState;
  pagination: PaginationState;
  totalCount: number;
  onPageSizeChange: (pageSize: number) => void;
  onViewApartment: (apartment: ApartmentRow) => void;
  onEditApartment: (apartment: ApartmentRow) => void;
  onDeleteApartment: (apartment: ApartmentRow) => void;
  onToggleActive: (apartment: ApartmentRow) => void;
};

function ColumnFilter({
  table,
  columnId,
}: {
  table: ReactTable<ApartmentRow>;
  columnId: string;
}) {
  const column = table.getColumn(columnId);

  if (!column?.getCanFilter()) {
    return null;
  }

  const filterValue = column.getFilterValue();

  switch (columnId) {
    case 'id':
    case 'name':
      return (
        <Input
          value={(filterValue as string) ?? ''}
          onChange={(event) => {
            column.setFilterValue(event.target.value);
            table.setPageIndex(0);
          }}
          placeholder="Szűrés"
          className="h-8"
        />
      );
    case 'kind':
      return (
        <select
          className="h-8 w-full rounded-lg border border-input bg-background px-2 text-xs"
          value={(filterValue as string) ?? ''}
          onChange={(event) => {
            column.setFilterValue(event.target.value);
            table.setPageIndex(0);
          }}
        >
          <option value="">Összes</option>
          <option value="apartment">Apartman</option>
          <option value="accommodation">Szállás</option>
        </select>
      );
    case 'type':
      return (
        <select
          className="h-8 w-full rounded-lg border border-input bg-background px-2 text-xs"
          value={(filterValue as string) ?? ''}
          onChange={(event) => {
            column.setFilterValue(event.target.value);
            table.setPageIndex(0);
          }}
        >
          <option value="">Összes</option>
          {APARTMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.formLabel}
            </option>
          ))}
        </select>
      );
    case 'isActive':
    case 'featured':
      return (
        <select
          className="h-8 w-full rounded-lg border border-input bg-background px-2 text-xs"
          value={(filterValue as string) ?? ''}
          onChange={(event) => {
            column.setFilterValue(event.target.value);
            table.setPageIndex(0);
          }}
        >
          <option value="">Összes</option>
          <option value="yes">Igen</option>
          <option value="no">Nem</option>
        </select>
      );
    default:
      return null;
  }
}

export function ApartmentsTable({
  table,
  sorting,
  pagination,
  totalCount,
  onPageSizeChange,
  onViewApartment,
  onEditApartment,
  onDeleteApartment,
  onToggleActive,
}: ApartmentsTableProps) {
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

            <TableRow>
              {table.getAllLeafColumns().map((column) => (
                <TableHead key={`${column.id}-filter`}>
                  <ColumnFilter table={table} columnId={column.id} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    if (cell.column.id === 'actions') {
                      return (
                        <TableCell key={cell.id} className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onViewApartment(row.original)}
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onEditApartment(row.original)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onToggleActive(row.original)}
                            >
                              <Power className="size-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => onDeleteApartment(row.original)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  {t('apartments.table.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Találatok: <span className="font-medium text-foreground">{pageFrom}</span>
          - <span className="font-medium text-foreground">{pageTo}</span> /{' '}
          <span className="font-medium text-foreground">{totalCount}</span> összesen
          <span className="ml-2">
            | Rendezés: <span className="font-medium text-foreground">{sorting[0]?.id ?? 'name'}</span>
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            {t('common.rowsPerPage')}
            <select
              value={pagination.pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('apartments.table.page', {
                page: pagination.pageIndex + 1,
                count: table.getPageCount() || 1,
              })}
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
