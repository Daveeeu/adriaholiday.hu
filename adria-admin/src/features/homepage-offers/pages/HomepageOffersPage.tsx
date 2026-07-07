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
import { ArrowUpDown, Eye, Pencil, Power, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

import { HomepageOfferSidePanel } from '../components/HomepageOfferSidePanel';
import { HomepageOffersTable } from '../components/HomepageOffersTable';
import { HomepageOffersToolbar } from '../components/HomepageOffersToolbar';
import {
  createHomepageOffer,
  deleteHomepageOffer,
  getHomepageOffers,
  setHomepageOfferStatus,
  updateHomepageOffer,
} from '../lib/homepage-offers.api';
import { HOMEPAGE_OFFER_LANGUAGES } from '../lib/homepage-offers.constants';
import type {
  HomepageOffer,
  HomepageOfferPanelMode,
  HomepageOffersListQuery,
  HomepageOfferUpsertInput,
} from '../lib/homepage-offers.types';
import { HomepageOfferStatusBadge } from '../components/homepage-offer-status-badge';

const homepageOffersQueryKey = ['homepage-offers'];

function getSortBy(sorting: SortingState): NonNullable<HomepageOffersListQuery['sortBy']> {
  return (sorting[0]?.id as NonNullable<HomepageOffersListQuery['sortBy']>) ?? 'sortOrder';
}

export function HomepageOffersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('homepage-offers.create');
  const canUpdate = hasPermission('homepage-offers.update');
  const canDelete = hasPermission('homepage-offers.delete');
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'sortOrder', desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<HomepageOfferPanelMode>('create');
  const [selectedOffer, setSelectedOffer] = useState<HomepageOffer | undefined>();

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search,
      sortBy: getSortBy(sorting),
      sortDirection: (sorting[0]?.desc ? 'desc' : 'asc') as 'desc' | 'asc',
    }),
    [pagination.pageIndex, pagination.pageSize, search, sorting],
  );

  const {
    data: homepageOffersResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [...homepageOffersQueryKey, queryParams],
    queryFn: () => getHomepageOffers(queryParams),
    placeholderData: (previous) => previous,
  });

  const pageItems = homepageOffersResponse?.items ?? [];
  const totalCount = homepageOffersResponse?.totalCount ?? 0;

  useEffect(() => {
    setPagination((current) => ({
      ...current,
      pageIndex: 0,
    }));
  }, [search, sorting]);

  const createMutation = useMutation({
    mutationFn: createHomepageOffer,
    onError: () => {
      toast.error('Nem sikerült létrehozni a főoldali ajánlatot.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homepageOffersQueryKey });
      toast.success('Főoldali ajánlat létrehozva.');
      setPanelOpen(false);
      setSelectedOffer(undefined);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      offerId,
      values,
    }: {
      offerId: string | number;
      values: HomepageOfferUpsertInput;
    }) => updateHomepageOffer(offerId, values),
    onError: () => {
      toast.error('Nem sikerült módosítani a főoldali ajánlatot.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homepageOffersQueryKey });
      toast.success('Főoldali ajánlat módosítva.');
      setPanelOpen(false);
      setSelectedOffer(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHomepageOffer,
    onError: () => {
      toast.error('Nem sikerült törölni a főoldali ajánlatot.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homepageOffersQueryKey });
      toast.success('Főoldali ajánlat törölve.');
      setPanelOpen(false);
      setSelectedOffer(undefined);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      offerId,
      active,
    }: {
      offerId: string | number;
      active: boolean;
    }) => setHomepageOfferStatus(offerId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homepageOffersQueryKey });
    },
  });

  const columns = useMemo<ColumnDef<HomepageOffer>[]>(
    () => [
      {
        accessorKey: 'sortOrder',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Sorrend <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.sortOrder}
          </span>
        ),
      },
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
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            className="h-auto p-0 text-sm font-medium text-muted-foreground"
            disabled={!row.original.link}
            onClick={() => {
              const link = row.original.link?.trim();
              if (!link) {
                return;
              }

              if (/^https?:\/\//i.test(link) || link.startsWith('//')) {
                window.open(link, '_blank', 'noopener,noreferrer');
                return;
              }

              navigate(link);
            }}
          >
            {row.original.id}
          </Button>
        ),
      },
      {
        id: 'name',
        accessorFn: (offer) => offer.translations.hu.name,
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Név <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium text-foreground">
              {row.original.translations.hu.name}
            </div>
            <div className="text-xs text-muted-foreground">
              SEO: {row.original.translations.hu.seoName || '—'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'image',
        header: 'Kép',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.image ? (
            <div className="flex items-center gap-3">
              <img
                src={row.original.image}
                alt={row.original.imageTitle || row.original.translations.hu.name}
                className="h-14 w-24 rounded-lg object-cover"
              />
            </div>
          ) : (
            <div className="flex h-14 w-24 items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 text-xs text-muted-foreground">
              Nincs kép
            </div>
          ),
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
        cell: ({ row }) => <HomepageOfferStatusBadge active={row.original.active} />,
      },
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
            {canUpdate ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  statusMutation.mutate({
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
                onClick={() => {
                  if (
                    window.confirm(
                      `Biztosan törlöd ezt a főoldali ajánlatot? (${row.original.translations.hu.name})`,
                    )
                  ) {
                    deleteMutation.mutate(row.original.id);
                  }
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [canDelete, canUpdate, deleteMutation, navigate, statusMutation],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: pageItems,
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

  if (isError || !homepageOffersResponse) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a főoldali ajánlatokat.
      </div>
    );
  }

  const submitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const defaultSortOrder = totalCount + 1;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Tartalomkezelés</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Főoldali ajánlatok
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          A főoldalon megjelenő ajánlatcsoportok kezelése.
        </p>
      </div>

      <HomepageOffersToolbar
        search={search}
        resultCount={homepageOffersResponse.items.length}
        totalCount={homepageOffersResponse.totalCount}
        onSearchChange={setSearch}
        onCreateClick={
          canCreate
            ? () => {
                setSelectedOffer({
                  id: `tmp_${crypto.randomUUID()}`,
                  active: true,
                  sortOrder: defaultSortOrder,
                  image: null,
                  imageTitle: '',
                  link: '',
                  translations: HOMEPAGE_OFFER_LANGUAGES.reduce(
                    (acc, language) => ({
                      ...acc,
                      [language]: {
                        name: '',
                        seoName: '',
                        seoAutoGenerate: true,
                      },
                    }),
                    {} as HomepageOffer['translations'],
                  ),
                });
                setPanelMode('create');
                setPanelOpen(true);
              }
            : undefined
        }
      />

      <HomepageOffersTable
        table={table}
        sorting={sorting}
        pagination={pagination}
        totalCount={homepageOffersResponse.totalCount}
        onPageSizeChange={(pageSize) =>
          setPagination((current) => ({
            ...current,
            pageIndex: 0,
            pageSize,
          }))
        }
      />

      <HomepageOfferSidePanel
        key={`${panelMode}-${selectedOffer?.id ?? 'new'}-${panelOpen ? 'open' : 'closed'}`}
        open={panelOpen}
        mode={panelMode}
        offer={selectedOffer}
        submitting={submitting}
        onOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) {
            setSelectedOffer(undefined);
          }
        }}
        onSubmit={(values) => {
          if (panelMode === 'edit' && selectedOffer) {
            updateMutation.mutate({
              offerId: selectedOffer.id,
              values,
            });
            return;
          }

          createMutation.mutate(values);
        }}
        onEdit={
          selectedOffer && canUpdate
            ? () => {
                setPanelMode('edit');
              }
            : undefined
        }
        onDelete={
          selectedOffer && canDelete
            ? () => {
                if (
                  window.confirm(
                    `Biztosan törlöd ezt a főoldali ajánlatot? (${selectedOffer.translations.hu.name})`,
                  )
                ) {
                  deleteMutation.mutate(selectedOffer.id);
                }
              }
            : undefined
        }
        onToggleActive={
          selectedOffer && canUpdate
            ? () =>
                statusMutation.mutate({
                  offerId: selectedOffer.id,
                  active: !selectedOffer.active,
                })
            : undefined
        }
      />
    </div>
  );
}
