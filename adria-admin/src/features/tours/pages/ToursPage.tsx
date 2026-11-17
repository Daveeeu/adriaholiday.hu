import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { PageLoader } from '@/components/common/page-loader';
import { useAuthStore } from '@/store/auth-store';

import { TourDetailPanel } from '../components/TourDetailPanel';
import { ToursFilters } from '../components/ToursFilters';
import { ToursTable } from '../components/ToursTable';
import { ToursToolbar } from '../components/ToursToolbar';
import { getTourListColumns } from '../lib/tour-list-columns';
import {
  DEFAULT_TOUR_LIST_FILTERS,
  type TourListFilters,
} from '../lib/tour-list-filters';
import { TOUR_CREATE_PATH, TOURS_QUERY_KEY } from '../lib/tour-routes';
import { getRegionOptions } from '../lib/tour-select-options.api';
import { TOUR_DEFAULT_SORT_BY } from '../lib/tours.constants';
import { getTours } from '../lib/tours.api';
import type { TourListQuery } from '../lib/tours.types';
import { useTourListActions } from '../lib/use-tour-list-actions';

const FIRST_PAGE: PaginationState = { pageIndex: 0, pageSize: 10 };

const filterValue = (value: string) => (value === 'all' ? undefined : value);

export function ToursPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('tours.create');
  const canUpdate = hasPermission('tours.update');
  const canDelete = hasPermission('tours.delete');
  const canUpdateStatus = hasPermission('tours.status');
  const canDuplicate = hasPermission('tours.duplicate');
  const canDownloadPdf = hasPermission('tours.view');
  const canReorder = hasPermission('tours.reorder');

  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: TOUR_DEFAULT_SORT_BY, desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>(FIRST_PAGE);
  const [filters, setFilters] = useState<TourListFilters>(
    DEFAULT_TOUR_LIST_FILTERS,
  );
  const [viewedTourId, setViewedTourId] = useState<string | null>(null);

  // Any new search, order or filter starts again at the first page.
  const resetPage = () =>
    setPagination((current) => ({ ...current, pageIndex: 0 }));

  const actions = useTourListActions({
    onDeleted: (tourId) =>
      setViewedTourId((current) => (current === tourId ? null : current)),
  });

  const { data: regionOptions = [] } = useQuery({
    queryKey: ['tour-select-options', 'regions'],
    queryFn: () => getRegionOptions(),
  });

  const queryParams = useMemo<TourListQuery>(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search,
      sortBy: sorting[0]?.id,
      sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
      regionId: filterValue(filters.regionId),
      featured: filters.featured,
      active: filters.active,
      xmlEnabled: filters.xmlEnabled,
    }),
    [filters, pagination.pageIndex, pagination.pageSize, search, sorting],
  );

  const {
    data: toursResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [...TOURS_QUERY_KEY, queryParams],
    queryFn: () => getTours(queryParams),
    placeholderData: (previous) => previous,
  });

  const columns = useMemo(
    () =>
      getTourListColumns({
        permissions: {
          canUpdate,
          canUpdateStatus,
          canDownloadPdf,
          canDuplicate,
          canReorder,
          canDelete,
        },
        actions,
        onView: setViewedTourId,
      }),
    [
      actions,
      canDelete,
      canDownloadPdf,
      canDuplicate,
      canReorder,
      canUpdate,
      canUpdateStatus,
    ],
  );

  const totalCount = toursResponse?.totalCount ?? 0;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: toursResponse?.items ?? [],
    columns,
    state: { sorting, pagination },
    pageCount: Math.max(1, Math.ceil(totalCount / pagination.pageSize)),
    onSortingChange: (updater) => {
      setSorting(updater);
      resetPage();
    },
    onPaginationChange: setPagination,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !toursResponse) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a körutazásokat.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Körutazások</p>
        <h1 className="text-3xl font-semibold tracking-tight">Ajánlatok</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          A körutazási ajánlatok kezelése.
        </p>
      </div>

      <ToursToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          resetPage();
        }}
        createPath={canCreate ? TOUR_CREATE_PATH : undefined}
      />

      <ToursFilters
        sorting={sorting}
        onSortingChange={(value) => {
          setSorting(value);
          resetPage();
        }}
        filters={filters}
        onFiltersChange={(value) => {
          setFilters(value);
          resetPage();
        }}
        regionOptions={regionOptions}
      />

      <ToursTable
        table={table}
        pagination={pagination}
        totalCount={totalCount}
        onPageSizeChange={(pageSize) =>
          setPagination({ pageIndex: 0, pageSize })
        }
      />

      <TourDetailPanel
        tourId={viewedTourId}
        canEdit={canUpdate}
        onClose={() => setViewedTourId(null)}
        onToggleActive={canUpdateStatus ? actions.setActive : undefined}
        onDuplicate={canDuplicate ? actions.duplicate : undefined}
        onDelete={canDelete ? actions.remove : undefined}
      />
    </div>
  );
}
