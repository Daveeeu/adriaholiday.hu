import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown, Pencil, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import type { ApartmentType } from '@/types/domain';

import { ApartmentTypeFormDialog } from '../components/apartment-type-form-dialog';
import { ApartmentTypeStatusBadge } from '../components/apartment-type-status-badge';
import { ApartmentTypesTable } from '../components/apartment-types-table';
import { ApartmentTypesToolbar } from '../components/apartment-types-toolbar';
import type { ApartmentTypeFormValues } from '../lib/apartment-type-schema';
import { apartmentTypesQueryKey, useApartmentTypes } from '../lib/use-apartment-types';
import {
  createApartmentType,
  deleteApartmentType,
  setApartmentTypeActiveState,
  updateApartmentType,
} from '@/services/apartment-type-service';

function toMutationInput(values: ApartmentTypeFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    isActive: values.status === 'active',
    sortOrder: values.sortOrder,
  };
}

export function ApartmentTypesPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('apartment-types.create');
  const canUpdate = hasPermission('apartment-types.update');
  const canDelete = hasPermission('apartment-types.delete');
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'sortOrder', desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ApartmentType | undefined>();

  const { data, isLoading, isError } = useApartmentTypes();

  const createMutation = useMutation({
    mutationFn: (values: ApartmentTypeFormValues) =>
      createApartmentType(toMutationInput(values)),
    onError: () => toast.error('A típus létrehozása nem sikerült.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apartmentTypesQueryKey });
      toast.success('A típus létrejött.');
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      apartmentTypeId,
      values,
    }: {
      apartmentTypeId: string;
      values: ApartmentTypeFormValues;
    }) => updateApartmentType(apartmentTypeId, toMutationInput(values)),
    onError: () => toast.error('A típus mentése nem sikerült.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apartmentTypesQueryKey });
      toast.success('A típus frissítve.');
      setDialogOpen(false);
      setEditingType(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (apartmentTypeId: string) => deleteApartmentType(apartmentTypeId),
    onError: () => toast.error('A típus törlése nem sikerült.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apartmentTypesQueryKey });
      toast.success('A típus törölve.');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      apartmentTypeId,
      isActive,
    }: {
      apartmentTypeId: string;
      isActive: boolean;
    }) => setApartmentTypeActiveState(apartmentTypeId, isActive),
    onError: () => toast.error('Az állapot módosítása nem sikerült.'),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: apartmentTypesQueryKey });
      toast.success(updated.isActive ? 'A típus aktiválva.' : 'A típus inaktiválva.');
    },
  });

  const columns: ColumnDef<ApartmentType>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Név
          <ArrowUpDown className="size-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <p className="font-medium text-foreground">{row.original.name}</p>
      ),
    },
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Slug
          <ArrowUpDown className="size-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-xs">{row.original.slug}</code>
      ),
    },
    {
      accessorKey: 'sortOrder',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Sorrend
          <ArrowUpDown className="size-4" />
        </Button>
      ),
    },
    {
      id: 'status',
      accessorFn: (type) => (type.isActive ? 'active' : 'inactive'),
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Állapot
          <ArrowUpDown className="size-4" />
        </Button>
      ),
      cell: ({ row }) => <ApartmentTypeStatusBadge isActive={row.original.isActive} />,
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {canUpdate ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingType(row.original);
                setDialogOpen(true);
              }}
            >
              <Pencil className="size-4" />
              Szerkesztés
            </Button>
          ) : null}
          {canUpdate ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toggleMutation.mutate({
                  apartmentTypeId: row.original.id,
                  isActive: !row.original.isActive,
                })
              }
            >
              <Power className="size-4" />
              {row.original.isActive ? 'Inaktiválás' : 'Aktiválás'}
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm(`Biztosan törlöd ezt a típust? (${row.original.name})`)) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
            >
              <Trash2 className="size-4" />
              Törlés
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      sorting,
      globalFilter: search,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    onPaginationChange: setPagination,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase();
      return [row.original.name, row.original.slug].some((value) =>
        value.toLowerCase().includes(query),
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Az apartman típusok nem tölthetők be.
      </div>
    );
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Apartmanok</p>
        <h1 className="text-3xl font-semibold tracking-tight">Típusok</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Az apartman típusszótár kezelése. Csak az aktív típusok jelennek meg a menüben és
          az apartman űrlap típusválasztójában.
        </p>
      </div>

      <ApartmentTypesToolbar
        search={search}
        resultCount={table.getFilteredRowModel().rows.length}
        onSearchChange={setSearch}
        onCreateClick={
          canCreate
            ? () => {
                setEditingType(undefined);
                setDialogOpen(true);
              }
            : undefined
        }
      />

      <ApartmentTypesTable
        table={table}
        sorting={sorting}
        pagination={pagination}
        onPageSizeChange={(pageSize) =>
          setPagination((currentPagination) => ({
            ...currentPagination,
            pageSize,
            pageIndex: 0,
          }))
        }
      />

      <ApartmentTypeFormDialog
        open={dialogOpen}
        apartmentType={editingType}
        submitting={submitting}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingType(undefined);
          }
        }}
        onSubmit={(values) => {
          if (editingType) {
            updateMutation.mutate({ apartmentTypeId: editingType.id, values });
            return;
          }

          createMutation.mutate(values);
        }}
      />
    </div>
  );
}
