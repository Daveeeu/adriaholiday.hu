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
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { RichTextEditor, RichTextPreview } from '@/components/editor/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

import {
  createTourSeasonalGroup,
  deleteTourSeasonalGroup,
  getTourSeasonalGroups,
  setTourSeasonalGroupActive,
  updateTourSeasonalGroup,
} from '../lib/tours.api';
import { TOUR_SEASONAL_MENU_TYPES, slugifyTourText } from '../lib/tours.constants';
import type {
  TourSeasonalGroup,
  TourSeasonalGroupFormValues,
  TourSeasonalGroupListQuery,
} from '../lib/tours.types';

const queryKey = ['tour-seasonal-groups'];

function getDefaults(item?: Partial<TourSeasonalGroup>): TourSeasonalGroupFormValues {
  return {
    active: item?.active ?? true,
    menuType: item?.menuType ?? 'intro',
    name: item?.name ?? '',
    seoName: item?.seoName ?? '',
    seoAutoGenerate: item?.seoAutoGenerate ?? true,
    boxText: item?.boxText ?? '',
    hasOffers: item?.hasOffers ?? false,
  };
}

function SeasonalGroupPanel({
  open,
  mode,
  item,
  onOpenChange,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  item?: TourSeasonalGroup;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TourSeasonalGroupFormValues) => void;
  onDelete?: () => void;
}) {
  const form = useForm<TourSeasonalGroupFormValues>({
    defaultValues: getDefaults(item),
  });

  useEffect(() => {
    if (open) form.reset(getDefaults(item));
  }, [form, item, open]);

  const seoAuto = useWatch({ control: form.control, name: 'seoAutoGenerate' });
  const name = useWatch({ control: form.control, name: 'name' });
  useEffect(() => {
    if (seoAuto) {
      form.setValue('seoName', slugifyTourText(name), { shouldDirty: true });
    }
  }, [form, name, seoAuto]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-3xl flex-col bg-background shadow-2xl">
        <div className="sticky top-0 z-10 border-b bg-background px-6 py-5">
          <h2 className="text-lg font-semibold">
            {mode === 'create' ? 'Szezonális csoport hozzáadása' : mode === 'edit' ? 'Szezonális csoport szerkesztése' : 'Szezonális csoport részletei'}
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
                <div className="text-sm text-muted-foreground">Menü típus</div>
                <div className="font-medium">{TOUR_SEASONAL_MENU_TYPES.find((opt) => opt.value === item.menuType)?.label ?? item.menuType}</div>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <div className="text-sm text-muted-foreground">Doboz szöveg</div>
                <RichTextPreview value={item.boxText || ''} className="mt-2 border-0 bg-transparent p-0 rounded-none" />
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem>
                    <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                      <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                      Aktív
                    </label>
                  </FormItem>
                )} />
                <FormField control={form.control} name="hasOffers" render={({ field }) => (
                  <FormItem>
                    <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                      <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                      Ajánlatos utak?
                    </label>
                  </FormItem>
                )} />
                <FormField control={form.control} name="menuType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menü típus</FormLabel>
                    <FormControl>
                      <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" {...field}>
                        {TOUR_SEASONAL_MENU_TYPES.map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Név</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="seoName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO név</FormLabel>
                    <FormControl><Input {...field} readOnly={seoAuto} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="seoAutoGenerate" render={({ field }) => (
                  <FormItem>
                    <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                      <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                      Automatikus generálás
                    </label>
                  </FormItem>
                )} />
                <FormField control={form.control} name="boxText" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doboz szöveg</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        minHeight={140}
                        allowPreview
                        placeholder="Doboz szöveg"
                      />
                    </FormControl>
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

export function TourSeasonalGroupsPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('tour-seasonal-groups.create');
  const canUpdate = hasPermission('tour-seasonal-groups.update');
  const canDelete = hasPermission('tour-seasonal-groups.delete');
  const canUpdateStatus = hasPermission('tour-seasonal-groups.status');
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | 'detail'>('create');
  const [selectedItem, setSelectedItem] = useState<TourSeasonalGroup | undefined>();

  const queryParams = useMemo<TourSeasonalGroupListQuery>(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search,
      sortBy: sorting[0]?.id as TourSeasonalGroupListQuery['sortBy'],
      sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
    }),
    [pagination.pageIndex, pagination.pageSize, search, sorting],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => getTourSeasonalGroups(queryParams),
  });

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [search, sorting]);

  const createMutation = useMutation({
    mutationFn: createTourSeasonalGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Szezonális csoport létrehozva.');
      setPanelOpen(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ itemId, values }: { itemId: string; values: TourSeasonalGroupFormValues }) =>
      updateTourSeasonalGroup(itemId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Szezonális csoport módosítva.');
      setPanelOpen(false);
      setSelectedItem(undefined);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteTourSeasonalGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Szezonális csoport törölve.');
      setPanelOpen(false);
      setSelectedItem(undefined);
    },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ itemId, active }: { itemId: string; active: boolean }) =>
      setTourSeasonalGroupActive(itemId, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const columns = useMemo<ColumnDef<TourSeasonalGroup>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'name', header: 'Név' },
      {
        accessorKey: 'menuType',
        header: 'Menü',
        cell: ({ row }) => TOUR_SEASONAL_MENU_TYPES.find((opt) => opt.value === row.original.menuType)?.label ?? row.original.menuType,
      },
      {
        accessorKey: 'hasOffers',
        header: 'Ajánlatos utak?',
        cell: ({ row }) => (row.original.hasOffers ? 'Igen' : 'Nem'),
      },
      { accessorKey: 'relatedToursCount', header: 'Kapcsolódó utak száma' },
      {
        id: 'actions',
        header: 'Műveletek',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="icon" onClick={() => { setSelectedItem(row.original); setPanelMode('detail'); setPanelOpen(true); }}>
              <Eye className="size-4" />
            </Button>
            {canUpdate ? (
              <Button variant="outline" size="icon" onClick={() => { setSelectedItem(row.original); setPanelMode('edit'); setPanelOpen(true); }}>
                <Pencil className="size-4" />
              </Button>
            ) : null}
            {canUpdateStatus ? (
              <Button variant="outline" size="icon" onClick={() => toggleMutation.mutate({ itemId: row.original.id, active: !row.original.active })}>
                <Power className="size-4" />
              </Button>
            ) : null}
            {canDelete ? (
              <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(row.original.id)}>
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [canDelete, canUpdate, canUpdateStatus, deleteMutation, toggleMutation],
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
  if (isError || !data) return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Nem sikerült betölteni a szezonális csoportokat.</div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Körutazások</p>
        <h1 className="text-3xl font-semibold tracking-tight">Szezonális ajánlat csoportok</h1>
      </div>
      <div className="rounded-2xl border bg-card p-4">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Keresés név vagy box szöveg alapján..." />
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
      {canCreate ? (
        <Button onClick={() => { setSelectedItem(undefined); setPanelMode('create'); setPanelOpen(true); }}>Új szezonális csoport</Button>
      ) : null}
      <SeasonalGroupPanel
        open={panelOpen}
        mode={panelMode}
        item={selectedItem}
        onOpenChange={(open) => { setPanelOpen(open); if (!open) setSelectedItem(undefined); }}
        onSubmit={(values) => {
          if (panelMode === 'edit' && selectedItem) updateMutation.mutate({ itemId: selectedItem.id, values });
          else createMutation.mutate(values);
        }}
        onDelete={selectedItem && canDelete ? () => deleteMutation.mutate(selectedItem.id) : undefined}
      />
    </div>
  );
}
