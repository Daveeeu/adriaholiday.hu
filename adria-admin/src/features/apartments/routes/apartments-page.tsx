import {
  getCoreRowModel,
  getFilteredRowModel,
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

import type { ApartmentMutationInput } from '@/api/admin-api';
import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getApartmentCreateRoute,
  getApartmentDetailRoute,
  getApartmentDimensions,
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
  const services = values.services.length > 0 ? values.services : values.amenities;
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
    seoName: values.autoGenerateSeoName ? createSlug(values.name) : values.seoName,
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
    apartmentTypeContent: values.apartmentTypeContent || values.apartment_type_content || values.typeDescription,
    apartment_type_content: values.apartment_type_content || values.apartmentTypeContent || values.typeDescription,
    apartment_type_description: values.apartment_type_description,
    apartment_type_text_description: values.apartment_type_text_description,
    apartment_type_text_description_2: values.apartment_type_text_description_2,
    allInclusiveDescription: values.allInclusiveDescription || values.all_inclusive_content,
    allInclusiveContent: values.allInclusiveContent || values.all_inclusive_content || values.allInclusiveDescription,
    all_inclusive_content: values.all_inclusive_content || values.allInclusiveContent || values.allInclusiveDescription,
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

function createOptimisticApartment(values: ApartmentFormValues): Apartment {
  const mutationInput = toMutationInput(values);
  const dimensions = getApartmentDimensions(mutationInput.type);

  return {
    id: `tmp_${crypto.randomUUID()}`,
    ...dimensions,
    ...mutationInput,
    slug: mutationInput.slug || createSlug(mutationInput.name),
    shortDescription:
      mutationInput.shortDescription ||
      `${mutationInput.name} helyi mentésként készült el a kérés befejezéséig.`,
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
  const routeMode: 'list' | ApartmentPanelMode =
    routeContext?.mode ?? 'list';
  const defaultType = routeMode === 'create' && routeType ? routeType : '';

  const {
    data: apartments,
    isLoading: apartmentsLoading,
    isError: apartmentsError,
  } = useQuery({
    queryKey: [...apartmentsQueryKey, routeType ?? 'all'],
    queryFn: () => getApartments(),
  });
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

  const createApartmentMutation = useMutation({
    mutationFn: (values: ApartmentFormValues) =>
      createApartment(toMutationInput(values)),
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: apartmentsQueryKey });
      const previousApartments =
        queryClient.getQueryData<Apartment[]>(apartmentsQueryKey) ?? [];
      const optimisticApartment = createOptimisticApartment(values);

      queryClient.setQueryData<Apartment[]>(apartmentsQueryKey, [
        optimisticApartment,
        ...previousApartments,
      ]);

      return { previousApartments, optimisticId: optimisticApartment.id };
    },
    onError: (_error, _values, context) => {
      queryClient.setQueryData(apartmentsQueryKey, context?.previousApartments);
      toast.error('Az apartman létrehozása nem sikerült.');
    },
    onSuccess: (createdApartment, _values, context) => {
      queryClient.setQueryData<Apartment[]>(
        apartmentsQueryKey,
        (currentApartments = []) =>
          currentApartments.map((apartment) =>
            apartment.id === context?.optimisticId
              ? createdApartment
              : apartment,
          ),
      );
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
    onMutate: async ({ apartmentId: targetApartmentId, values }) => {
      await queryClient.cancelQueries({ queryKey: apartmentsQueryKey });
      const previousApartments =
        queryClient.getQueryData<Apartment[]>(apartmentsQueryKey) ?? [];
      const mutationInput = toMutationInput(values);

      queryClient.setQueryData<Apartment[]>(
        apartmentsQueryKey,
        (currentApartments = []) =>
          currentApartments.map((apartment) =>
            apartment.id === targetApartmentId
              ? {
                  ...apartment,
                  ...mutationInput,
                  slug: mutationInput.slug || createSlug(mutationInput.name),
                }
              : apartment,
          ),
      );

      return { previousApartments };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(apartmentsQueryKey, context?.previousApartments);
      toast.error('Az apartman mentése nem sikerült.');
    },
    onSuccess: (updatedApartment) => {
      queryClient.setQueryData<Apartment[]>(
        apartmentsQueryKey,
        (currentApartments = []) =>
          currentApartments.map((apartment) =>
            apartment.id === updatedApartment.id ? updatedApartment : apartment,
          ),
      );
      toast.success('Az apartman frissítve.');
      navigate(currentListRoute, { replace: true });
    },
  });

  const deleteApartmentMutation = useMutation({
    mutationFn: (targetApartmentId: string) => deleteApartment(targetApartmentId),
    onMutate: async (targetApartmentId) => {
      await queryClient.cancelQueries({ queryKey: apartmentsQueryKey });
      const previousApartments =
        queryClient.getQueryData<Apartment[]>(apartmentsQueryKey) ?? [];

      queryClient.setQueryData<Apartment[]>(
        apartmentsQueryKey,
        (currentApartments = []) =>
          currentApartments.filter((apartment) => apartment.id !== targetApartmentId),
      );

      return { previousApartments };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(apartmentsQueryKey, context?.previousApartments);
      toast.error('Az apartman törlése nem sikerült.');
    },
    onSuccess: () => {
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
      regionName:
        regionMap.get(apartment.regionId) ?? 'Ismeretlen régió',
      locationName:
        locationMap.get(apartment.locationId) ?? 'Ismeretlen hely',
      galleryTitle: galleryMap.get(apartment.galleryId) ?? 'Nincs galéria',
      apartmentKind: apartment.isAccommodation ? 'accommodation' : 'apartment',
      typeLabel: getApartmentTypeDefinition(apartment.type)?.label ?? apartment.type,
    }));
  }, [apartments, galleries, locations, regions]);

  const visibleApartments = useMemo(
    () =>
    routeType
      ? apartmentRows.filter((apartment) => apartment.type === routeType)
      : apartmentRows,
    [apartmentRows, routeType],
  );

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
          row.original.apartmentKind === 'accommodation' ? 'Szállás' : 'Apartman',
        filterFn: 'equalsString',
      },
      {
        id: 'isActive',
        accessorFn: (row) => ((row.isActive ?? row.status !== 'archived') ? 'yes' : 'no'),
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
    data: visibleApartments,
    columns,
    state: {
      sorting,
      globalFilter: search,
      pagination,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase();
      return [
        row.original.name,
        row.original.code ?? '',
        row.original.address,
        row.original.seoName ?? '',
        row.original.regionName,
        row.original.locationName,
        row.original.typeLabel,
      ].some((value) => value.toLowerCase().includes(query));
    },
    filterFns: {
      includesString: (row, columnId, filterValue) => {
        const value = String(row.getValue(columnId) ?? '').toLowerCase();
        return value.includes(String(filterValue).toLowerCase());
      },
      equalsString: (row, columnId, filterValue) => {
        if (!filterValue) {
          return true;
        }

        return String(row.getValue(columnId)) === String(filterValue);
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
      ? apartmentRows.find((apartment) => String(apartment.id) === String(apartmentId))
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
  const searchResultCount = table.getFilteredRowModel().rows.length;
  const submitting =
    createApartmentMutation.isPending || updateApartmentMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Apartmanok</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <ApartmentsToolbar
        title={title}
        description={`${searchResultCount} találat a ${visibleApartments.length} rekordból`}
        search={search}
        resultCount={searchResultCount}
        totalCount={visibleApartments.length}
        onSearchChange={(value) => {
          setSearch(value);
          setPagination((current) => ({ ...current, pageIndex: 0 }));
        }}
        onCreateClick={() => {
          navigate(getApartmentCreateRoute(routeType));
        }}
      />

      <ApartmentsTable
        table={table}
        sorting={sorting}
        pagination={pagination}
        totalCount={visibleApartments.length}
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
        onEditApartment={(apartment) => {
          navigate(getApartmentEditRoute(apartment.id, routeType));
        }}
        onDeleteApartment={(apartment) => {
          if (
            window.confirm(`Biztosan törlöd ezt az apartmant? (${apartment.name})`)
          ) {
            deleteApartmentMutation.mutate(apartment.id);
          }
        }}
        onToggleActive={(apartment) => {
          const isActive = apartment.isActive ?? apartment.status !== 'archived';
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
        }}
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
        isLoading={Boolean(apartmentId) && apartmentDetailLoading && !selectedApartment}
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
          selectedApartment
            ? () =>
                navigate(
                  getApartmentEditRoute(selectedApartment.id, routeType),
                )
            : undefined
        }
        onDelete={
          selectedApartment
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
          selectedApartment
            ? () => {
                const isActive =
                  selectedApartment.isActive ?? selectedApartment.status !== 'archived';
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
