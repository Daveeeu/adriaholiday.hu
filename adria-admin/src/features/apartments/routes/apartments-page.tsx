import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import type {
  ApartmentMutationInput,
  ApartmentsListQuery,
} from '@/api/admin-api';
import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getApartmentCreateRoute,
  getApartmentDetailRoute,
  getApartmentEditRoute,
  getApartmentListRoute,
  getApartmentRouteContext,
  getApartmentTypeDefinition,
  getApartmentTypeFromPath,
} from '@/features/apartments/constants/apartmentTypes';
import { ApartmentSidePanel } from '@/features/apartments/components/apartment-side-panel';
import { ApartmentsTable } from '@/features/apartments/components/apartments-table';
import { ApartmentsToolbar } from '@/features/apartments/components/apartments-toolbar';
import { createSlug } from '@/data/generators/core-generators';
import { getApartmentFormDefaults } from '@/features/apartments/lib/apartment-schema';
import type {
  ApartmentFormValues,
  ApartmentPanelMode,
} from '@/features/apartments/lib/apartments.types';
import {
  createApartment,
  deleteApartment,
  getApartmentById,
  getApartments,
  updateApartment,
} from '@/services/apartment-service';
import {
  getGalleries,
  getLocations,
  getRegions,
} from '@/services/reference-data-service';
import { useAuthStore } from '@/store/auth-store';
import type { Apartment } from '@/types/domain';

const apartmentsQueryKey = ['apartments'];

export type ApartmentRow = Apartment & {
  regionName: string;
  locationName: string;
  galleryTitle: string;
  apartmentKind: 'apartment' | 'accommodation';
  typeLabel: string;
};

function toMutationInput(values: ApartmentFormValues): ApartmentMutationInput {
  const type = values.type as Apartment['type'];
  const normalizedCoordinates = values.coordinates
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number(part))
    .filter((part) => Number.isFinite(part));
  const latitude = normalizedCoordinates[0] ?? values.latitude;
  const longitude = normalizedCoordinates[1] ?? values.longitude;
  const services =
    values.services.length > 0 ? values.services : values.amenities;
  const normalizedPriceSeasons = values.priceSeasons.map((season) => ({
    ...season,
    apartmentId: season.apartmentId ?? season.apartment_id ?? '',
    apartment_id: season.apartment_id ?? season.apartmentId,
    startDate: season.startDate ?? season.start_date ?? '',
    start_date: season.start_date ?? season.startDate,
    endDate: season.endDate ?? season.end_date ?? '',
    end_date: season.end_date ?? season.endDate,
  }));

  return {
    seoName: values.autoGenerateSeoName
      ? createSlug(values.name)
      : values.seoName,
    seo_name: values.seo_name || values.seoName,
    seo_auto_generate: values.seo_auto_generate ?? values.autoGenerateSeoName,
    isActive: values.isActive,
    active: values.active ?? values.isActive,
    featured: values.featured,
    isAccommodation: values.isAccommodation,
    accommodation: values.accommodation ?? values.isAccommodation,
    stars: values.stars,
    name: values.name,
    slug: values.slug || createSlug(values.name),
    code: values.code,
    type,
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    maxGuests: values.maxGuests,
    sizeM2: values.sizeM2,
    address: values.address,
    mapAddress: values.mapAddress,
    map_address: values.map_address || values.mapAddress,
    latitude,
    longitude,
    coordinates: values.coordinates,
    shortDescription: values.shortDescription,
    description: values.description,
    additionalInformation: values.additionalInformation,
    typeDescription: values.typeDescription || values.apartment_type_content,
    apartmentTypeContent:
      values.apartmentTypeContent ||
      values.apartment_type_content ||
      values.typeDescription,
    apartment_type_content:
      values.apartment_type_content ||
      values.apartmentTypeContent ||
      values.typeDescription,
    apartment_type_description: values.apartment_type_description,
    apartment_type_text_description: values.apartment_type_text_description,
    apartment_type_text_description_2: values.apartment_type_text_description_2,
    allInclusiveDescription:
      values.allInclusiveDescription || values.all_inclusive_content,
    allInclusiveContent:
      values.allInclusiveContent ||
      values.all_inclusive_content ||
      values.allInclusiveDescription,
    all_inclusive_content:
      values.all_inclusive_content ||
      values.allInclusiveContent ||
      values.allInclusiveDescription,
    regionId: values.regionId,
    locationId: values.locationId,
    galleryId: values.galleryId,
    region_id: values.region_id || values.regionId,
    place_id: values.place_id || values.locationId,
    gallery_id: values.gallery_id || values.galleryId,
    amenities: values.amenities,
    services,
    priceHeader: values.priceHeader,
    priceInnerHeader: values.priceInnerHeader,
    pricingMatrix: values.pricingMatrix,
    priceSeasons: normalizedPriceSeasons,
    status: values.isActive ? 'published' : 'archived',
  };
}

function toFormValuesFromApartment(
  apartment: Apartment,
  overrides?: Partial<ApartmentFormValues>,
): ApartmentFormValues {
  const defaults = getApartmentFormDefaults(apartment, {
    locations: [],
    galleries: [],
    regions: [],
    defaultType: apartment.type,
  });

  return {
    ...defaults,
    ...overrides,
    seoName:
      overrides?.seoName ?? defaults.seoName ?? createSlug(apartment.name),
    pricingMatrix: overrides?.pricingMatrix ?? defaults.pricingMatrix,
  };
}

export function ApartmentsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('apartments.create');
  const canUpdate = hasPermission('apartments.update');
  const canDelete = hasPermission('apartments.delete');
  const canUpdateStatus = hasPermission('apartments.status');
  const routeContext = useMemo(
    () => getApartmentRouteContext(location.pathname),
    [location.pathname],
  );
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const routeType = useMemo(
    () => getApartmentTypeFromPath(location.pathname),
    [location.pathname],
  );
  const routeTypeDefinition = routeType
    ? getApartmentTypeDefinition(routeType)
    : undefined;
  const currentListRoute = getApartmentListRoute(routeType);
  const routeMode: 'list' | ApartmentPanelMode = routeContext?.mode ?? 'list';
  const defaultType = routeMode === 'create' && routeType ? routeType : '';

  const columnFilterValue = (id: string) =>
    (columnFilters.find((filter) => filter.id === id)?.value as
      | string
      | undefined) || undefined;

  const queryParams = useMemo<ApartmentsListQuery>(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search: search || undefined,
      sortBy: sorting[0]?.id,
      sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
      type: routeType || columnFilterValue('type'),
      isAccommodation:
        columnFilterValue('kind') === 'accommodation'
          ? true
          : columnFilterValue('kind') === 'apartment'
            ? false
            : undefined,
      isActive:
        columnFilterValue('isActive') === 'yes'
          ? true
          : columnFilterValue('isActive') === 'no'
            ? false
            : undefined,
      featured:
        columnFilterValue('featured') === 'yes'
          ? true
          : columnFilterValue('featured') === 'no'
            ? false
            : undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      pagination.pageIndex,
      pagination.pageSize,
      search,
      sorting,
      routeType,
      columnFilters,
    ],
  );

  const {
    data: apartmentsPage,
    isLoading: apartmentsLoading,
    isError: apartmentsError,
  } = useQuery({
    queryKey: [...apartmentsQueryKey, queryParams],
    queryFn: () => getApartments(queryParams),
    placeholderData: (previous) => previous,
  });
  const apartments = apartmentsPage?.items;
  const apartmentId = routeContext?.apartmentId ?? null;
  const {
    data: apartmentDetail,
    isLoading: apartmentDetailLoading,
    isError: apartmentDetailError,
    refetch: refetchApartmentDetail,
  } = useQuery({
    queryKey: ['apartments', apartmentId],
    queryFn: () => getApartmentById(apartmentId as string),
    enabled: Boolean(apartmentId),
  });
  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: ['regions'],
    queryFn: () => getRegions(),
  });
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations(),
  });
  const { data: galleries, isLoading: galleriesLoading } = useQuery({
    queryKey: ['galleries'],
    queryFn: () => getGalleries(),
  });

  useEffect(() => {
    setSearch('');
    setColumnFilters([]);
    setPagination((current) => ({
      ...current,
      pageIndex: 0,
    }));
  }, [routeType]);

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [search, sorting, columnFilters]);

  const createApartmentMutation = useMutation({
    mutationFn: (values: ApartmentFormValues) =>
      createApartment(toMutationInput(values)),
    onError: () => {
      toast.error('Az apartman létrehozása nem sikerült.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apartmentsQueryKey });
      toast.success('Az apartman létrejött.');
      navigate(currentListRoute, { replace: true });
    },
  });

  const updateApartmentMutation = useMutation({
    mutationFn: ({
      apartmentId: targetApartmentId,
      values,
    }: {
      apartmentId: string;
      values: ApartmentFormValues;
    }) => updateApartment(targetApartmentId, toMutationInput(values)),
    onError: () => {
      toast.error('Az apartman mentése nem sikerült.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apartmentsQueryKey });
      toast.success('Az apartman frissítve.');
      navigate(currentListRoute, { replace: true });
    },
  });

  const deleteApartmentMutation = useMutation({
    mutationFn: (targetApartmentId: string) =>
      deleteApartment(targetApartmentId),
    onError: () => {
      toast.error('Az apartman törlése nem sikerült.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apartmentsQueryKey });
      toast.success('Az apartman törölve.');
      navigate(currentListRoute, { replace: true });
    },
  });

  const loading =
    apartmentsLoading || regionsLoading || locationsLoading || galleriesLoading;

  const filteredGalleries = useMemo(
    () =>
      (galleries ?? []).filter((gallery) => gallery.category === 'apartment'),
    [galleries],
  );

  const apartmentRows = useMemo<ApartmentRow[]>(() => {
    if (!apartments || !regions || !locations || !galleries) {
      return [];
    }

    const regionMap = new Map(
      regions.map((region) => [region.id, region.name]),
    );
    const locationMap = new Map(
      locations.map((location) => [location.id, location.name]),
    );
    const galleryMap = new Map(
      galleries.map((gallery) => [gallery.id, gallery.title]),
    );

    return apartments.map((apartment) => ({
      ...apartment,
      regionName: regionMap.get(apartment.regionId) ?? 'Ismeretlen régió',
      locationName: locationMap.get(apartment.locationId) ?? 'Ismeretlen hely',
      galleryTitle: galleryMap.get(apartment.galleryId) ?? 'Nincs galéria',
      apartmentKind: apartment.isAccommodation ? 'accommodation' : 'apartment',
      typeLabel:
        getApartmentTypeDefinition(apartment.type)?.label ?? apartment.type,
    }));
  }, [apartments, galleries, locations, regions]);

  const columns: ColumnDef<ApartmentRow>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            ID
            <ArrowUpDown className="size-4" />
          </Button>
        ),
        filterFn: 'includesString',
      },
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
          <button
            type="button"
            className="text-left"
            onClick={() =>
              navigate(
                getApartmentDetailRoute(
                  row.original.id,
                  routeType ?? row.original.type,
                ),
              )
            }
          >
            <div className="space-y-1">
              <div className="font-medium text-foreground">
                {row.original.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {row.original.code ?? '—'} · {row.original.regionName} ·{' '}
                {row.original.locationName} · {row.original.typeLabel}
              </div>
            </div>
          </button>
        ),
        filterFn: 'includesString',
      },
      {
        accessorKey: 'type',
        header: 'Típus',
        cell: ({ row }) => row.original.typeLabel,
        filterFn: 'equalsString',
      },
      {
        accessorKey: 'apartmentKind',
        id: 'kind',
        header: 'Apartman/Szállás',
        cell: ({ row }) =>
          row.original.apartmentKind === 'accommodation'
            ? 'Szállás'
            : 'Apartman',
        filterFn: 'equalsString',
      },
      {
        id: 'isActive',
        accessorFn: (row) =>
          (row.isActive ?? row.status !== 'archived') ? 'yes' : 'no',
        header: 'Aktív?',
        cell: ({ row }) => (
          <Badge className="border-transparent bg-primary/10 text-primary">
            {(row.original.isActive ?? row.original.status !== 'archived')
              ? 'Igen'
              : 'Nem'}
          </Badge>
        ),
        filterFn: 'equalsString',
      },
      {
        id: 'featured',
        accessorFn: (row) => (row.featured ? 'yes' : 'no'),
        header: 'Kiemelt?',
        cell: ({ row }) => (
          <Badge className="border-transparent bg-primary/10 text-primary">
            {row.original.featured ? 'Igen' : 'Nem'}
          </Badge>
        ),
        filterFn: 'equalsString',
      },
      {
        id: 'actions',
        header: 'Műveletek',
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [navigate, routeType],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: apartmentRows,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
    },
    pageCount: Math.max(
      1,
      Math.ceil((apartmentsPage?.totalCount ?? 0) / pagination.pageSize),
    ),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return <PageLoader />;
  }

  if (apartmentsError || !apartments || !regions || !locations || !galleries) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Az apartmanok adatai nem tölthetők be.
      </div>
    );
  }

  const selectedApartment = apartmentDetail
    ? apartmentDetail
    : apartmentId
      ? apartmentRows.find(
          (apartment) => String(apartment.id) === String(apartmentId),
        )
      : undefined;
  const apartmentNotFound =
    Boolean(apartmentId) &&
    !apartmentDetailLoading &&
    !selectedApartment &&
    (apartmentDetailError || apartmentId !== null);
  const apartmentDetailMessage = apartmentDetailError
    ? 'Az apartman részletei nem tölthetők be.'
    : apartmentNotFound
      ? 'Az apartman nem található vagy még nem töltődött be.'
      : null;

  const title = routeTypeDefinition?.label ?? 'Összes apartman';
  const description = routeTypeDefinition
    ? `A(z) ${routeTypeDefinition.formLabel.toLowerCase()} kategória rekordjai.`
    : 'A teljes apartmanállomány kezelése.';
  const totalCount = apartmentsPage?.totalCount ?? 0;
  const submitting =
    createApartmentMutation.isPending || updateApartmentMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Apartmanok</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>

      <ApartmentsToolbar
        title={title}
        description={`${totalCount} találat a ${totalCount} rekordból`}
        search={search}
        resultCount={totalCount}
        totalCount={totalCount}
        onSearchChange={setSearch}
        onCreateClick={
          canCreate
            ? () => {
                navigate(getApartmentCreateRoute(routeType));
              }
            : undefined
        }
      />

      <ApartmentsTable
        table={table}
        sorting={sorting}
        pagination={pagination}
        totalCount={totalCount}
        onPageSizeChange={(pageSize) =>
          setPagination((currentPagination) => ({
            ...currentPagination,
            pageSize,
            pageIndex: 0,
          }))
        }
        onViewApartment={(apartment) => {
          navigate(getApartmentDetailRoute(apartment.id, routeType));
        }}
        onEditApartment={
          canUpdate
            ? (apartment) => {
                navigate(getApartmentEditRoute(apartment.id, routeType));
              }
            : undefined
        }
        onDeleteApartment={
          canDelete
            ? (apartment) => {
                if (
                  window.confirm(
                    `Biztosan törlöd ezt az apartmant? (${apartment.name})`,
                  )
                ) {
                  deleteApartmentMutation.mutate(apartment.id);
                }
              }
            : undefined
        }
        onToggleActive={
          canUpdateStatus
            ? (apartment) => {
                const isActive =
                  apartment.isActive ?? apartment.status !== 'archived';
                updateApartmentMutation.mutate({
                  apartmentId: apartment.id,
                  values: toFormValuesFromApartment(apartment, {
                    isActive: !isActive,
                    seoName: apartment.seoName ?? createSlug(apartment.name),
                    pricingMatrix:
                      apartment.pricingMatrix ??
                      getApartmentFormDefaults(apartment, {
                        locations: [],
                        galleries: [],
                        regions: [],
                        defaultType: apartment.type,
                      }).pricingMatrix,
                  }),
                });
              }
            : undefined
        }
      />

      <ApartmentSidePanel
        open={routeMode !== 'list'}
        mode={routeMode === 'list' ? 'create' : routeMode}
        apartment={selectedApartment}
        regions={regions}
        locations={locations}
        galleries={filteredGalleries}
        submitting={submitting}
        defaultType={defaultType}
        typeLocked={routeMode === 'create' && Boolean(routeType)}
        isLoading={
          Boolean(apartmentId) && apartmentDetailLoading && !selectedApartment
        }
        errorMessage={routeMode !== 'list' ? apartmentDetailMessage : null}
        onRetry={apartmentId ? () => void refetchApartmentDetail() : undefined}
        onOpenChange={(open) => {
          if (!open) {
            navigate(currentListRoute, { replace: true });
          }
        }}
        onSubmit={(values) => {
          if (routeMode === 'edit' && selectedApartment) {
            updateApartmentMutation.mutate({
              apartmentId: selectedApartment.id,
              values,
            });
            return;
          }

          createApartmentMutation.mutate(values);
        }}
        onEdit={
          selectedApartment && canUpdate
            ? () =>
                navigate(getApartmentEditRoute(selectedApartment.id, routeType))
            : undefined
        }
        onDelete={
          selectedApartment && canDelete
            ? () => {
                if (
                  window.confirm(
                    `Biztosan törlöd ezt az apartmant? (${selectedApartment.name})`,
                  )
                ) {
                  deleteApartmentMutation.mutate(selectedApartment.id);
                }
              }
            : undefined
        }
        onToggleActive={
          selectedApartment && canUpdateStatus
            ? () => {
                const isActive =
                  selectedApartment.isActive ??
                  selectedApartment.status !== 'archived';
                updateApartmentMutation.mutate({
                  apartmentId: selectedApartment.id,
                  values: toFormValuesFromApartment(selectedApartment, {
                    isActive: !isActive,
                    seoName:
                      selectedApartment.seoName ??
                      createSlug(selectedApartment.name),
                    pricingMatrix:
                      selectedApartment.pricingMatrix ??
                      getApartmentFormDefaults(selectedApartment, {
                        locations: [],
                        galleries: [],
                        regions: [],
                        defaultType: selectedApartment.type,
                      }).pricingMatrix,
                  }),
                });
              }
            : undefined
        }
      />
    </div>
  );
}
