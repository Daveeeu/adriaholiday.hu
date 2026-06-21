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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown, Pencil, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { RegionFormDialog } from '@/features/regions/components/region-form-dialog';
import { RegionStatusBadge } from '@/features/regions/components/region-status-badge';
import { RegionsTable } from '@/features/regions/components/regions-table';
import { RegionsToolbar } from '@/features/regions/components/regions-toolbar';
import { t } from '@/i18n';
import {
  createRegion,
  deleteRegion,
  getRegions,
  setRegionActiveState,
  updateRegion,
} from '@/services/region-service';
import type { Region } from '@/types/domain';

import type { RegionFormValues } from '../lib/region-schema';

const regionsQueryKey = ['regions'];

function toMutationInput(values: RegionFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    status: values.status,
  };
}

function createOptimisticRegion(values: RegionFormValues): Region {
  return {
    id: `tmp_${crypto.randomUUID()}`,
    name: values.name,
    slug: values.slug,
    isActive: values.status === 'active',
    countryCode: 'HR',
    timezone: 'Europe/Zagreb',
    currency: 'EUR',
    heroImageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    summary: `${values.name} portfolio region ready for admin setup.`,
    description: `${values.name} létrehozása folyamatban van a kérés befejezéséig.`,
  };
}

export function RegionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | undefined>();

  const { data, isLoading, isError } = useQuery({
    queryKey: regionsQueryKey,
    queryFn: () => getRegions(),
  });

  const createRegionMutation = useMutation({
    mutationFn: (values: RegionFormValues) =>
      createRegion(toMutationInput(values)),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: regionsQueryKey });
      const previousRegions =
        queryClient.getQueryData<Region[]>(regionsQueryKey) ?? [];
      const optimisticRegion = createOptimisticRegion(values);

      queryClient.setQueryData<Region[]>(regionsQueryKey, [
        optimisticRegion,
        ...previousRegions,
      ]);

      return { previousRegions, optimisticId: optimisticRegion.id };
    },
    onError: (_error, _values, context) => {
      queryClient.setQueryData(regionsQueryKey, context?.previousRegions);
      toast.error(t('regions.toast.createError'));
    },
    onSuccess: (createdRegion, _values, context) => {
      queryClient.setQueryData<Region[]>(
        regionsQueryKey,
        (currentRegions = []) =>
          currentRegions.map((region) =>
            region.id === context?.optimisticId ? createdRegion : region,
          ),
      );
      toast.success(t('regions.toast.createSuccess'));
      setDialogOpen(false);
    },
  });

  const updateRegionMutation = useMutation({
    mutationFn: ({
      regionId,
      values,
    }: {
      regionId: string;
      values: RegionFormValues;
    }) => updateRegion(regionId, toMutationInput(values)),
    onMutate: async ({ regionId, values }) => {
      await queryClient.cancelQueries({ queryKey: regionsQueryKey });
      const previousRegions =
        queryClient.getQueryData<Region[]>(regionsQueryKey) ?? [];

      queryClient.setQueryData<Region[]>(
        regionsQueryKey,
        (currentRegions = []) =>
          currentRegions.map((region) =>
            region.id === regionId
              ? {
                  ...region,
                  name: values.name,
                  slug: values.slug,
                  isActive: values.status === 'active',
                }
              : region,
          ),
      );

      return { previousRegions };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(regionsQueryKey, context?.previousRegions);
      toast.error(t('regions.toast.updateError'));
    },
    onSuccess: (updatedRegion) => {
      queryClient.setQueryData<Region[]>(
        regionsQueryKey,
        (currentRegions = []) =>
          currentRegions.map((region) =>
            region.id === updatedRegion.id ? updatedRegion : region,
          ),
      );
      toast.success(t('regions.toast.updateSuccess'));
      setDialogOpen(false);
      setEditingRegion(undefined);
    },
  });

  const deleteRegionMutation = useMutation({
    mutationFn: (regionId: string) => deleteRegion(regionId),
    onMutate: async (regionId) => {
      await queryClient.cancelQueries({ queryKey: regionsQueryKey });
      const previousRegions =
        queryClient.getQueryData<Region[]>(regionsQueryKey) ?? [];

      queryClient.setQueryData<Region[]>(
        regionsQueryKey,
        (currentRegions = []) =>
          currentRegions.filter((region) => region.id !== regionId),
      );

      return { previousRegions };
    },
    onError: (_error, _regionId, context) => {
      queryClient.setQueryData(regionsQueryKey, context?.previousRegions);
      toast.error(t('regions.toast.deleteError'));
    },
    onSuccess: () => {
      toast.success(t('regions.toast.deleteSuccess'));
    },
  });

  const toggleRegionMutation = useMutation({
    mutationFn: ({
      regionId,
      isActive,
    }: {
      regionId: string;
      isActive: boolean;
    }) => setRegionActiveState(regionId, isActive),
    onMutate: async ({ regionId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: regionsQueryKey });
      const previousRegions =
        queryClient.getQueryData<Region[]>(regionsQueryKey) ?? [];

      queryClient.setQueryData<Region[]>(
        regionsQueryKey,
        (currentRegions = []) =>
          currentRegions.map((region) =>
            region.id === regionId ? { ...region, isActive } : region,
          ),
      );

      return { previousRegions };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(regionsQueryKey, context?.previousRegions);
      toast.error(t('regions.toast.statusError'));
    },
    onSuccess: (updatedRegion) => {
      queryClient.setQueryData<Region[]>(
        regionsQueryKey,
        (currentRegions = []) =>
          currentRegions.map((region) =>
            region.id === updatedRegion.id ? updatedRegion : region,
          ),
      );
      toast.success(
        updatedRegion.isActive
          ? t('regions.toast.activated')
          : t('regions.toast.deactivated'),
      );
    },
  });

  const columns: ColumnDef<Region>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('regions.table.name')}
          <ArrowUpDown className="size-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.summary}
          </p>
        </div>
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
          {t('regions.table.slug')}
          <ArrowUpDown className="size-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-xs">
          {row.original.slug}
        </code>
      ),
    },
    {
      id: 'status',
      accessorFn: (region) => (region.isActive ? 'active' : 'inactive'),
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('regions.table.status')}
          <ArrowUpDown className="size-4" />
        </Button>
      ),
      cell: ({ row }) => <RegionStatusBadge isActive={row.original.isActive} />,
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingRegion(row.original);
              setDialogOpen(true);
            }}
          >
            <Pencil className="size-4" />
            {t('regions.table.edit')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toggleRegionMutation.mutate({
                regionId: row.original.id,
                isActive: !row.original.isActive,
              })
            }
          >
            <Power className="size-4" />
            {row.original.isActive
              ? t('regions.table.deactivate')
              : t('regions.table.activate')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteRegionMutation.mutate(row.original.id)}
          >
            <Trash2 className="size-4" />
            {t('regions.table.delete')}
          </Button>
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
      return [
        row.original.name,
        row.original.slug,
        row.original.isActive ? t('common.active') : t('common.inactive'),
      ].some((value) => value.toLowerCase().includes(query));
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
        {t('regions.error.load')}
      </div>
    );
  }

  const submitting =
    createRegionMutation.isPending || updateRegionMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">
          {t('regions.page.eyebrow')}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t('regions.page.title')}
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t('regions.page.description')}
        </p>
      </div>

      <RegionsToolbar
        search={search}
        resultCount={table.getFilteredRowModel().rows.length}
        onSearchChange={setSearch}
        onCreateClick={() => {
          setEditingRegion(undefined);
          setDialogOpen(true);
        }}
      />

      <RegionsTable
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

      <RegionFormDialog
        open={dialogOpen}
        region={editingRegion}
        submitting={submitting}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingRegion(undefined);
          }
        }}
        onSubmit={(values) => {
          if (editingRegion) {
            updateRegionMutation.mutate({
              regionId: editingRegion.id,
              values,
            });
            return;
          }

          createRegionMutation.mutate(values);
        }}
      />
    </div>
  );
}
