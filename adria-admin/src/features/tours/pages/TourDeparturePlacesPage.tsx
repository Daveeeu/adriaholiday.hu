import {
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Power, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

import {
  createTourDeparturePlace,
  deleteTourDeparturePlace,
  getTourDeparturePlaces,
  setTourDeparturePlaceActive,
  updateTourDeparturePlace,
} from '../lib/tours.api';
import type {
  TourDeparturePlace,
  TourDeparturePlaceFormValues,
  TourDeparturePlaceListQuery,
} from '../lib/tours.types';

const queryKey = ['tour-departure-places'];

function getDefaults(item?: Partial<TourDeparturePlace>): TourDeparturePlaceFormValues {
  return {
    active: item?.active ?? true,
    name: item?.name ?? '',
    city: item?.city ?? '',
    fee: item?.fee ?? '',
  };
}

function DeparturePlacePanel({
  open,
  mode,
  item,
  onOpenChange,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  item?: TourDeparturePlace;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TourDeparturePlaceFormValues) => void;
  onDelete?: () => void;
}) {
  const form = useForm<TourDeparturePlaceFormValues>({
    defaultValues: getDefaults(item),
  });

  useEffect(() => {
    if (open) form.reset(getDefaults(item));
  }, [form, item, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-background shadow-2xl">
        <div className="sticky top-0 z-10 border-b bg-background px-6 py-5">
          <h2 className="text-lg font-semibold">
            {mode === 'create' ? 'Felszállási hely hozzáadása' : mode === 'edit' ? 'Felszállási hely szerkesztése' : 'Felszállási hely részletei'}
          </h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {mode === 'detail' && item ? (
            <div className="space-y-3">
              <div className="rounded-2xl border bg-card p-4">
                <div className="text-sm text-muted-foreground">Név</div>
                <div className="font-medium">{item.name}</div>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <div className="text-sm text-muted-foreground">Város</div>
                <div className="font-medium">{item.city}</div>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Név</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Város</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="fee" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Díj</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem>
                    <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                      <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                      Aktív
                    </label>
                  </FormItem>
                )} />
                <div className="sticky bottom-0 border-t bg-background/95 py-4">
                  <div className="flex justify-end gap-2">
                    {mode === 'edit' && onDelete ? <Button type="button" variant="destructive" onClick={onDelete}>Törlés</Button> : null}
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Mégse</Button>
                    <Button type="submit">Mentés</Button>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </div>
      </aside>
    </div>
  );
}

export function TourDeparturePlacesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | 'detail'>('create');
  const [selectedItem, setSelectedItem] = useState<TourDeparturePlace | undefined>();

  const queryParams = useMemo<TourDeparturePlaceListQuery>(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search,
      sortBy: sorting[0]?.id as TourDeparturePlaceListQuery['sortBy'],
      sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
    }),
    [pagination.pageIndex, pagination.pageSize, search, sorting],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => getTourDeparturePlaces(queryParams),
  });

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [search, sorting]);

  const createMutation = useMutation({
    mutationFn: createTourDeparturePlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Felszállási hely létrehozva.');
      setPanelOpen(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ itemId, values }: { itemId: string; values: TourDeparturePlaceFormValues }) =>
      updateTourDeparturePlace(itemId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Felszállási hely módosítva.');
      setPanelOpen(false);
      setSelectedItem(undefined);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteTourDeparturePlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Felszállási hely törölve.');
      setPanelOpen(false);
      setSelectedItem(undefined);
    },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ itemId, active }: { itemId: string; active: boolean }) =>
      setTourDeparturePlaceActive(itemId, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const columns = useMemo<ColumnDef<TourDeparturePlace>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'name', header: 'Név' },
      { accessorKey: 'city', header: 'Város' },
      { accessorKey: 'fee', header: 'Díj' },
      { accessorKey: 'travelCount', header: 'Utazások' },
      {
        id: 'actions',
        header: 'Műveletek',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="icon" onClick={() => { setSelectedItem(row.original); setPanelMode('detail'); setPanelOpen(true); }}>
              <Eye className="size-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => { setSelectedItem(row.original); setPanelMode('edit'); setPanelOpen(true); }}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => toggleMutation.mutate({ itemId: row.original.id, active: !row.original.active })}>
              <Power className="size-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(row.original.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation, toggleMutation],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: { sorting, pagination },
    pageCount: Math.max(1, Math.ceil((data?.totalCount ?? 0) / pagination.pageSize)),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Nem sikerült betölteni a felszállási helyeket.</div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Körutazások</p>
        <h1 className="text-3xl font-semibold tracking-tight">Felszállási helyek</h1>
      </div>
      <div className="rounded-2xl border bg-card p-4">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Keresés név vagy város alapján..." />
      </div>
      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={cn(header.column.id === 'actions' && 'text-right')}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cn(cell.column.id === 'actions' && 'text-right')}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button onClick={() => { setSelectedItem(undefined); setPanelMode('create'); setPanelOpen(true); }}>Új felszállási hely</Button>
      <DeparturePlacePanel
        open={panelOpen}
        mode={panelMode}
        item={selectedItem}
        onOpenChange={(open) => { setPanelOpen(open); if (!open) setSelectedItem(undefined); }}
        onSubmit={(values) => {
          if (panelMode === 'edit' && selectedItem) updateMutation.mutate({ itemId: selectedItem.id, values });
          else createMutation.mutate(values);
        }}
        onDelete={selectedItem ? () => deleteMutation.mutate(selectedItem.id) : undefined}
      />
    </div>
  );
}
