import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpDown,
  Copy,
  Eye,
  Pencil,
  Power,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

import { ToursTable } from '../components/ToursTable';
import { TourBooleanBadge } from '../components/tour-boolean-badge';
import { TourSidePanel } from '../components/TourSidePanel';
import { ToursToolbar } from '../components/ToursToolbar';
import {
  TOUR_GROUP_OPTIONS,
  TOUR_REGION_OPTIONS,
  TOUR_SEASONAL_GROUP_OPTIONS,
  TOUR_DEFAULT_SORT_BY,
} from '../lib/tours.constants';
import type { Tour, TourFormValues, TourListQuery } from '../lib/tours.types';
import {
  createTour,
  deleteTour,
  duplicateTourOffer,
  getTours,
  getTourById,
  moveTourOffer,
  setTourActive,
  updateTour,
} from '../lib/tours.api';

const toursQueryKey = ['tours'];

function createTourDefaults(overrides?: Partial<Tour>): Tour {
  return {
    id: `tmp_${crypto.randomUUID()}`,
    sortOrder: 1,
    active: true,
    featured: false,
    recommended: false,
    partnerOffer: false,
    imageOffer: false,
    xmlEnabled: true,
    sliderImageEnabled: false,
    sliderTextEnabled: false,
    name: '',
    seoName: '',
    seoAutoGenerate: true,
    action1: '',
    action2: '',
    listDescription: '',
    shortDescription: '',
    programPdf: '',
    programPdfFile: '',
    programBefore: '',
    program: '',
    inclusions: '',
    paymentProgram: '',
    prices: '',
    discounts: '',
    notes: '',
    programDays: [],
    priceItems: [],
    regionId: '',
    homepageOfferId: '',
    homepageOfferIds: [],
    homepageOffers: [],
    groupId: '',
    seasonalGroupId: '',
    departurePlaceIds: [],
    countryIds: [],
    tagIds: [],
    categoryIds: [],
    fitId: '',
    programTypeId: '',
    travelModeId: '',
    difficultyId: '',
    price: '',
    displayedPrice: '',
    priceBox: {
      price: null,
      displayedPrice: '',
      currency: 'HUF',
      priceSuffix: '/ fő',
      discountBadge: '',
      discountText: '',
      urgencyText: '',
      ratingText: '',
      minParticipants: null,
      maxParticipants: null,
      availableSeats: null,
      capacity: null,
      ctaPrimaryLabel: '',
      ctaSecondaryLabel: '',
    },
    dates: [],
    partnerBonuses: [],
    sliderImage: '',
    sliderText: '',
    ...overrides,
  };
}

export function ToursPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: TOUR_DEFAULT_SORT_BY, desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [regionId, setRegionId] = useState('all');
  const [groupId, setGroupId] = useState('all');
  const [seasonalGroupId, setSeasonalGroupId] = useState('all');
  const [featured, setFeatured] = useState<'all' | 'true' | 'false'>('all');
  const [active, setActive] = useState<'all' | 'true' | 'false'>('all');
  const [imageOffer, setImageOffer] = useState<'all' | 'true' | 'false'>('all');
  const [xmlEnabled, setXmlEnabled] = useState<'all' | 'true' | 'false'>('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | 'detail'>('create');
  const [selectedTour, setSelectedTour] = useState<Tour | undefined>();

  const queryParams = useMemo<TourListQuery>(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search,
      sortBy: sorting[0]?.id as TourListQuery['sortBy'],
      sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
      regionId: regionId === 'all' ? undefined : regionId,
      groupId: groupId === 'all' ? undefined : groupId,
      seasonalGroupId: seasonalGroupId === 'all' ? undefined : seasonalGroupId,
      featured,
      active,
      imageOffer,
      xmlEnabled,
    }),
    [
      active,
      featured,
      groupId,
      imageOffer,
      pagination.pageIndex,
      pagination.pageSize,
      regionId,
      search,
      seasonalGroupId,
      sorting,
      xmlEnabled,
    ],
  );

  const {
    data: toursResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [...toursQueryKey, queryParams],
    queryFn: () => getTours(queryParams),
  });

  const selectedTourId = selectedTour?.id;
  const {
    data: selectedTourDetail,
    isLoading: selectedTourDetailLoading,
    isError: selectedTourDetailError,
  } = useQuery({
    queryKey: [...toursQueryKey, 'detail', selectedTourId],
    queryFn: () => getTourById(selectedTourId ?? ''),
    enabled: panelOpen && !!selectedTourId && panelMode !== 'create',
  });

  useEffect(() => {
    setPagination((current) => ({
      ...current,
      pageIndex: 0,
    }));
  }, [search, sorting, regionId, groupId, seasonalGroupId, featured, active, imageOffer, xmlEnabled]);

  const createMutation = useMutation({
    mutationFn: createTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toursQueryKey });
      toast.success('Körutazás létrehozva.');
      setPanelOpen(false);
      setSelectedTour(undefined);
    },
    onError: () => {
      toast.error('Nem sikerült létrehozni a körutazást.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ tourId, values }: { tourId: string; values: TourFormValues }) =>
      updateTour(tourId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toursQueryKey });
      toast.success('Körutazás módosítva.');
      setPanelOpen(false);
      setSelectedTour(undefined);
    },
    onError: () => {
      toast.error('Nem sikerült módosítani a körutazást.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toursQueryKey });
      toast.success('Körutazás törölve.');
      setPanelOpen(false);
      setSelectedTour(undefined);
    },
    onError: () => {
      toast.error('Nem sikerült törölni a körutazást.');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      tourId,
      active,
    }: {
      tourId: string;
      active: boolean;
    }) => setTourActive(tourId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toursQueryKey });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateTourOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toursQueryKey });
      toast.success('Körutazás másolva.');
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({
      tourId,
      direction,
    }: {
      tourId: string;
      direction: 'up' | 'down';
    }) => moveTourOffer(tourId, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toursQueryKey });
    },
  });

  const tours = toursResponse?.items ?? [];
  const totalCount = toursResponse?.totalCount ?? 0;
  const panelTour = panelMode === 'create'
    ? selectedTour
    : selectedTourDetail;
  const panelLoading =
    panelMode !== 'create' && !!selectedTourId && selectedTourDetailLoading;
  const panelError =
    panelMode !== 'create' && selectedTourDetailError && !selectedTourDetail
      ? 'Nem sikerült betölteni a körutazás adatait.'
      : null;

  const columns = useMemo<ColumnDef<Tour>[]>(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            ID <ArrowUpDown className="size-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Név / Akció 1 / Akció 2 <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium text-foreground">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">
              {[row.original.action1, row.original.action2].filter(Boolean).join(' • ') || '—'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'regionId',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Régió <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.regionLabel ?? '—'}
          </span>
        ),
      },
      {
        accessorKey: 'groupId',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Csoport <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.groupLabel ?? '—'}
          </span>
        ),
      },
      {
        accessorKey: 'featured',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Kiemelt <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => <TourBooleanBadge value={row.original.featured} />,
      },
      {
        accessorKey: 'active',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Aktív <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => <TourBooleanBadge value={row.original.active} />,
      },
      {
        accessorKey: 'imageOffer',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Képes ajánlat <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => <TourBooleanBadge value={row.original.imageOffer} />,
      },
      {
        accessorKey: 'xmlEnabled',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            XML-ben szerepel <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => <TourBooleanBadge value={row.original.xmlEnabled} />,
      },
      {
        id: 'actions',
        header: 'Műveletek',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedTour(row.original);
                setPanelMode('detail');
                setPanelOpen(true);
              }}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedTour(row.original);
                setPanelMode('edit');
                setPanelOpen(true);
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                statusMutation.mutate({
                  tourId: row.original.id,
                  active: !row.original.active,
                })
              }
            >
              <Power className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => duplicateMutation.mutate(row.original.id)}
            >
              <Copy className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                moveMutation.mutate({
                  tourId: row.original.id,
                  direction: 'up',
                })
              }
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                moveMutation.mutate({
                  tourId: row.original.id,
                  direction: 'down',
                })
              }
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                if (window.confirm(`Biztosan törlöd ezt a körutazást? (${row.original.name})`)) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [
      deleteMutation,
      duplicateMutation,
      moveMutation,
      statusMutation,
    ],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tours,
    columns,
    state: {
      sorting,
      pagination,
    },
    pageCount: Math.max(1, Math.ceil(totalCount / pagination.pageSize)),
    onSortingChange: setSorting,
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

  const submitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    statusMutation.isPending ||
    duplicateMutation.isPending ||
    moveMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Körutazások</p>
        <h1 className="text-3xl font-semibold tracking-tight">Ajánlatok</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          A körutazási ajánlatok kezelése, többféle szűréssel és side paneles szerkesztéssel.
        </p>
      </div>

      <ToursToolbar
        search={search}
        onSearchChange={setSearch}
        onCreateClick={() => {
          setSelectedTour(createTourDefaults());
          setPanelMode('create');
          setPanelOpen(true);
        }}
      />

      <div className="grid gap-3 rounded-2xl border bg-card p-4 lg:grid-cols-4">
        <Select value={regionId} onChange={(event) => setRegionId(event.target.value)}>
          <option value="all">Összes régió</option>
          {TOUR_REGION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
          <option value="all">Összes csoport</option>
          {TOUR_GROUP_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          value={seasonalGroupId}
          onChange={(event) => setSeasonalGroupId(event.target.value)}
        >
          <option value="all">Összes szezonális csoport</option>
          {TOUR_SEASONAL_GROUP_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Select value={active} onChange={(event) => setActive(event.target.value as typeof active)}>
            <option value="all">Aktív állapot</option>
            <option value="true">Aktív</option>
            <option value="false">Inaktív</option>
          </Select>
          <Select value={featured} onChange={(event) => setFeatured(event.target.value as typeof featured)}>
            <option value="all">Kiemelt állapot</option>
            <option value="true">Kiemelt</option>
            <option value="false">Nem kiemelt</option>
          </Select>
          <Select
            value={xmlEnabled}
            onChange={(event) => setXmlEnabled(event.target.value as typeof xmlEnabled)}
          >
            <option value="all">XML állapot</option>
            <option value="true">XML-ben szerepel</option>
            <option value="false">Nem szerepel</option>
          </Select>

          <Select
            value={imageOffer}
            onChange={(event) => setImageOffer(event.target.value as typeof imageOffer)}
          >
            <option value="all">Képes ajánlat állapot</option>
            <option value="true">Képes ajánlat</option>
            <option value="false">Nem képes ajánlat</option>
          </Select>
        </div>
      </div>

      <ToursTable
        table={table}
        sorting={sorting}
        pagination={pagination}
        totalCount={totalCount}
        onPageSizeChange={(pageSize) =>
          setPagination((current) => ({
            ...current,
            pageIndex: 0,
            pageSize,
          }))
        }
      />

      <TourSidePanel
        open={panelOpen}
        mode={panelMode}
        tour={panelTour}
        loading={panelLoading}
        error={panelError}
        submitting={submitting}
        onOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) {
            setSelectedTour(undefined);
          }
        }}
        onSubmit={(values) => {
          if (panelMode === 'edit' && selectedTour) {
            updateMutation.mutate({
              tourId: selectedTour.id,
              values,
            });
            return;
          }

          createMutation.mutate(values);
        }}
        onEdit={
          selectedTour
            ? () => {
                setPanelMode('edit');
              }
            : undefined
        }
        onDelete={
          selectedTour
            ? () => {
                if (window.confirm(`Biztosan törlöd ezt a körutazást? (${selectedTour.name})`)) {
                  deleteMutation.mutate(selectedTour.id);
                }
              }
            : undefined
        }
        onToggleActive={
          selectedTour
            ? () =>
                statusMutation.mutate({
                  tourId: selectedTour.id,
                  active: !selectedTour.active,
                })
            : undefined
        }
        onDuplicate={
          selectedTour
            ? () => duplicateMutation.mutate(selectedTour.id)
            : undefined
        }
      />
    </div>
  );
}
