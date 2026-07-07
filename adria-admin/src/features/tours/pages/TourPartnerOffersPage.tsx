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
import { ArrowUpDown, Eye, Pencil, Power, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

import {
  createTourPartnerOffer,
  deleteTourPartnerOffer,
  getTourPartnerOffers,
  setTourPartnerOfferActive,
  updateTourPartnerOffer,
} from '../lib/tours.api';
import { TOUR_PARTNER_OFFER_STATUSES } from '../lib/tours.constants';
import type {
  TourPartnerOffer,
  TourPartnerOfferFormValues,
  TourPartnerOfferListQuery,
} from '../lib/tours.types';

const queryKey = ['tour-partner-offers'];

function getDefaults(offer?: Partial<TourPartnerOffer>): TourPartnerOfferFormValues {
  return {
    name: offer?.name ?? '',
    partnerName: offer?.partnerName ?? '',
    partnerEmail: offer?.partnerEmail ?? '',
    inquiryDate: offer?.inquiryDate ?? '',
    status: offer?.status ?? 'new',
    note: offer?.note ?? '',
    active: offer?.active ?? true,
  };
}

function PartnerOfferPanel({
  open,
  mode,
  offer,
  submitting,
  onOpenChange,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  offer?: TourPartnerOffer;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TourPartnerOfferFormValues) => void;
  onDelete?: () => void;
}) {
  const form = useForm<TourPartnerOfferFormValues>({
    defaultValues: getDefaults(offer),
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaults(offer));
    }
  }, [form, offer, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-3xl flex-col bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">
              {mode === 'create'
                ? 'Partner ajánlat hozzáadása'
                : mode === 'edit'
                  ? 'Partner ajánlat szerkesztése'
                  : 'Partner ajánlat részletei'}
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <Trash2 className="invisible size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {mode === 'detail' && offer ? (
            <div className="space-y-4">
              <div className="rounded-2xl border bg-card p-4">
                <div className="text-sm text-muted-foreground">Név</div>
                <div className="font-medium">{offer.name}</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border bg-card p-4">
                  <div className="text-sm text-muted-foreground">Partner</div>
                  <div className="font-medium">{offer.partnerName}</div>
                </div>
                <div className="rounded-2xl border bg-card p-4">
                  <div className="text-sm text-muted-foreground">Partner email</div>
                  <div className="font-medium">{offer.partnerEmail}</div>
                </div>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                className="space-y-5"
                onSubmit={form.handleSubmit((values) => onSubmit(values))}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Név</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner neve</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inquiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Érdeklődés dátuma</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ajánlat státusz</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                          {...field}
                        >
                          {TOUR_PARTNER_OFFER_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Megjegyzés</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-28" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem>
                      <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                        />
                        Aktív
                      </label>
                    </FormItem>
                  )}
                />
                <div className="sticky bottom-0 border-t bg-background/95 py-4">
                  <div className="flex justify-end gap-2">
                    {mode === 'edit' && onDelete ? (
                      <Button type="button" variant="destructive" onClick={onDelete} disabled={submitting}>
                        Törlés
                      </Button>
                    ) : null}
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Mégse
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      Mentés
                    </Button>
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

export function TourPartnerOffersPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('tour-partner-offers.create');
  const canUpdate = hasPermission('tour-partner-offers.update');
  const canDelete = hasPermission('tour-partner-offers.delete');
  const canUpdateStatus = hasPermission('tour-partner-offers.status');
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'inquiryDate', desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | 'detail'>('create');
  const [selectedOffer, setSelectedOffer] = useState<TourPartnerOffer | undefined>();

  const queryParams = useMemo<TourPartnerOfferListQuery>(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search,
      sortBy: sorting[0]?.id as TourPartnerOfferListQuery['sortBy'],
      sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
    }),
    [pagination.pageIndex, pagination.pageSize, search, sorting],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => getTourPartnerOffers(queryParams),
  });

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [search, sorting]);

  const createMutation = useMutation({
    mutationFn: createTourPartnerOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Partner ajánlat létrehozva.');
      setPanelOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ offerId, values }: { offerId: string; values: TourPartnerOfferFormValues }) =>
      updateTourPartnerOffer(offerId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Partner ajánlat módosítva.');
      setPanelOpen(false);
      setSelectedOffer(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTourPartnerOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Partner ajánlat törölve.');
      setPanelOpen(false);
      setSelectedOffer(undefined);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ offerId, active }: { offerId: string; active: boolean }) =>
      setTourPartnerOfferActive(offerId, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const columns = useMemo<ColumnDef<TourPartnerOffer>[]>(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <Button variant="ghost" className="-ml-3" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            ID <ArrowUpDown className="size-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button variant="ghost" className="-ml-3" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Név <ArrowUpDown className="size-4" />
          </Button>
        ),
      },
      { accessorKey: 'partnerName', header: 'Partner' },
      { accessorKey: 'partnerEmail', header: 'Partner email' },
      { accessorKey: 'inquiryDate', header: 'Érdeklődés dátuma' },
      {
        id: 'actions',
        header: 'Műveletek',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedOffer(row.original);
                setPanelMode('detail');
                setPanelOpen(true);
              }}
            >
              <Eye className="size-4" />
            </Button>
            {canUpdate ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedOffer(row.original);
                  setPanelMode('edit');
                  setPanelOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
            ) : null}
            {canUpdateStatus ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  toggleMutation.mutate({
                    offerId: row.original.id,
                    active: !row.original.active,
                  })
                }
              >
                <Power className="size-4" />
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteMutation.mutate(row.original.id)}
              >
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
  if (isError || !data) {
    return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Nem sikerült betölteni a partner ajánlatokat.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Körutazások</p>
        <h1 className="text-3xl font-semibold tracking-tight">Szervezés alatt partner ajánlatok</h1>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Keresés név, partner vagy email alapján..." />
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cn(cell.column.id === 'actions' && 'text-right')}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                    Nincs találat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-4">
          <div className="text-sm text-muted-foreground">
            Találatok: {data.totalCount}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ArrowUpDown className="size-4 rotate-90" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ArrowUpDown className="size-4 -rotate-90" />
            </Button>
          </div>
        </div>
      </div>

      {canCreate ? (
        <Button
          onClick={() => {
            setSelectedOffer(undefined);
            setPanelMode('create');
            setPanelOpen(true);
          }}
        >
          Új partner ajánlat
        </Button>
      ) : null}

      <PartnerOfferPanel
        open={panelOpen}
        mode={panelMode}
        offer={selectedOffer}
        onOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) setSelectedOffer(undefined);
        }}
        onSubmit={(values) => {
          if (panelMode === 'edit' && selectedOffer) {
            updateMutation.mutate({ offerId: selectedOffer.id, values });
          } else {
            createMutation.mutate(values);
          }
        }}
        onDelete={
          selectedOffer && canDelete
            ? () => deleteMutation.mutate(selectedOffer.id)
            : undefined
        }
        submitting={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
      />
    </div>
  );
}
