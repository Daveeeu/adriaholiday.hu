import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Power, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { createSlug } from '@/data/generators/core-generators';
import { cn } from '@/lib/utils';
import type { Gallery, Location, Region, Apartment } from '@/types/domain';

import { ApartmentForm } from './apartment-form';
import { APARTMENT_SERVICE_GROUPS, getApartmentServiceLabel } from '@/features/apartments/constants/apartment-services';
import {
  apartmentFormSchema,
  getApartmentFormDefaults,
} from '../lib/apartment-schema';
import type { ApartmentFormValues, ApartmentPanelMode } from '../lib/apartments.types';
import { getApartmentTypeDefinition } from '@/features/apartments/constants/apartmentTypes';

type ApartmentSidePanelProps = {
  open: boolean;
  mode: ApartmentPanelMode;
  apartment?: Apartment;
  regions: Region[];
  locations: Location[];
  galleries: Gallery[];
  submitting?: boolean;
  defaultType?: Apartment['type'] | '';
  typeLocked?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ApartmentFormValues) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
};

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">
        {typeof value === 'boolean'
          ? value
            ? 'Igen'
            : 'Nem'
          : value ?? '—'}
      </div>
    </div>
  );
}

function DetailChips({
  items,
}: {
  items: string[];
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Nincs megadott elem.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border bg-muted px-3 py-1 text-xs font-medium"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function PricingMatrixPreview({ apartment }: { apartment: Apartment }) {
  const matrix = apartment.pricingMatrix;

  if (!matrix) {
    return <p className="text-sm text-muted-foreground">Nincs kitöltött ár mátrix.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[900px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 border bg-card px-3 py-2 text-left">
              {apartment.priceInnerHeader || 'Kategória / ágyszám'}
            </th>
            {matrix.columns.map((column) => (
              <th key={column.id} className="border bg-card px-3 py-2 text-left">
                <div className="font-medium">{column.startDate || 'Kezdő dátum'}</div>
                <div className="text-xs text-muted-foreground">
                  {column.endDate || 'Vég dátum'}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.id}>
              <td className="sticky left-0 z-10 border bg-card px-3 py-2">
                <div className="font-medium">{row.category || 'Kategória'}</div>
                <div className="text-xs text-muted-foreground">
                  {row.beds || 'Ágyszám'}
                </div>
              </td>
              {row.prices.map((price, index) => (
                <td key={`${row.id}-${index}`} className="border px-3 py-2">
                  {price || '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApartmentDetailView({
  apartment,
  regions,
  locations,
  galleries,
}: {
  apartment: Apartment;
  regions: Region[];
  locations: Location[];
  galleries: Gallery[];
}) {
  const active = apartment.active ?? apartment.isActive ?? apartment.status !== 'archived';
  const selectedServices = apartment.services ?? apartment.amenities ?? [];
  const regionRef = apartment.regionId ?? apartment.region_id ?? '';
  const locationRef = apartment.locationId ?? apartment.place_id ?? '';
  const galleryRef = apartment.galleryId ?? apartment.gallery_id ?? '';
  const regionName = regions.find((region) => region.id === regionRef)?.name ?? regionRef;
  const locationName = locations.find((location) => location.id === locationRef)?.name ?? locationRef;
  const galleryTitle = galleries.find((gallery) => gallery.id === galleryRef)?.title ?? galleryRef;
  const typeLabel =
    getApartmentTypeDefinition(apartment.type)?.label ?? apartment.type;
  const groupedServices = APARTMENT_SERVICE_GROUPS.map((group) => ({
    ...group,
    services: group.services.filter((service) =>
      selectedServices.includes(service.value),
    ),
  }));

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{apartment.name}</h3>
            <p className="text-sm text-muted-foreground">
              {apartment.address}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold',
                active
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700',
              )}
            >
              {active ? 'Aktív' : 'Inaktív'}
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {apartment.featured ? 'Kiemelt' : 'Normál'}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
              {apartment.accommodation ?? apartment.isAccommodation ? 'Szállás' : 'Apartman'}
            </span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <DetailField label="ID" value={apartment.id} />
          <DetailField label="Kód" value={apartment.code} />
          <DetailField label="SEO név" value={apartment.seoName ?? apartment.seo_name} />
          <DetailField label="Slug" value={apartment.slug} />
          <DetailField
            label="Csillagok"
            value={apartment.stars ? `${apartment.stars} csillag` : '—'}
          />
          <DetailField label="Hálószobák" value={apartment.bedrooms} />
          <DetailField label="Fürdőszobák" value={apartment.bathrooms} />
          <DetailField label="Max. vendégek" value={apartment.maxGuests} />
          <DetailField label="Terület" value={apartment.sizeM2 ? `${apartment.sizeM2} m²` : '—'} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">SEO és tartalom</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <DetailField label="Típus" value={typeLabel} />
          <DetailField label="Régió" value={regionName} />
          <DetailField label="Hely" value={locationName} />
          <DetailField label="Galéria" value={galleryTitle} />
          <DetailField label="Koordináták" value={apartment.coordinates} />
        </div>
        <div className="grid gap-3">
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Rövid ismertető
            </div>
            <div className="mt-2 text-sm">{apartment.shortDescription || '—'}</div>
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Ismertető
            </div>
            <div className="mt-2 text-sm">{apartment.description || '—'}</div>
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Kiegészítő információk
            </div>
            <div className="mt-2 text-sm">
              {apartment.additionalInformation || '—'}
            </div>
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Típus tartalom
            </div>
            <div className="mt-2 text-sm">
              {apartment.apartmentTypeContent ||
                apartment.apartment_type_content ||
                apartment.typeDescription ||
                '—'}
            </div>
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Típus leírás
            </div>
            <div className="mt-2 text-sm">
              {apartment.apartment_type_description ||
                apartment.apartment_type_text_description ||
                apartment.apartment_type_text_description_2 ||
                '—'}
            </div>
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              All-inclusive
            </div>
            <div className="mt-2 text-sm">
              {apartment.allInclusiveContent ||
                apartment.all_inclusive_content ||
                apartment.allInclusiveDescription ||
                '—'}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Elhelyezkedés</h4>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <DetailField label="Cím" value={apartment.address} />
          <DetailField label="Térkép cím" value={apartment.mapAddress ?? apartment.map_address} />
          <DetailField label="Koordináták" value={apartment.coordinates} />
          <DetailField label="Szélesség" value={apartment.latitude} />
          <DetailField label="Hosszúság" value={apartment.longitude} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Szolgáltatások</h4>
        <div className="space-y-3">
          {groupedServices.some((group) => group.services.length > 0) ? (
            groupedServices.map((group) =>
              group.services.length > 0 ? (
                <div key={group.key} className="space-y-2">
                  <div className="text-sm font-medium">{group.label}</div>
                  <DetailChips
                    items={group.services.map((service) =>
                      getApartmentServiceLabel(service.value),
                    )}
                  />
                </div>
              ) : null,
            )
          ) : (
            <p className="text-sm text-muted-foreground">Nincs megadott szolgáltatás.</p>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">
          {apartment.priceHeader || 'Árak'}
        </h4>
        <PricingMatrixPreview apartment={apartment} />
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Árazási szezonok</h4>
        {apartment.priceSeasons && apartment.priceSeasons.length > 0 ? (
          <div className="space-y-2">
            {apartment.priceSeasons.map((season) => (
              <div key={season.id} className="rounded-xl border bg-background p-3 text-sm">
                <div className="font-medium">
                  {season.startDate || season.start_date || '—'} -{' '}
                  {season.endDate || season.end_date || '—'}
                </div>
                <div className="text-muted-foreground">
                  {season.category || 'Kategória'} · {season.beds || 'Ágyszám'} · {season.price || '—'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nincs megadott árazási szezon.</p>
        )}
      </section>
    </div>
  );
}

export function ApartmentSidePanel({
  open,
  mode,
  apartment,
  regions,
  locations,
  galleries,
  submitting = false,
  defaultType = '',
  typeLocked = false,
  onOpenChange,
  onSubmit,
  onEdit,
  onDelete,
  onToggleActive,
  isLoading = false,
  errorMessage = null,
  onRetry,
}: ApartmentSidePanelProps) {
  const form = useForm<ApartmentFormValues, undefined, ApartmentFormValues>({
    resolver: zodResolver(apartmentFormSchema),
    defaultValues: getApartmentFormDefaults(apartment, {
      locations,
      galleries,
      regions,
      defaultType,
    }),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(
      getApartmentFormDefaults(apartment, {
        locations,
        galleries,
        regions,
        defaultType,
      }),
    );
  }, [apartment, defaultType, form, galleries, locations, open, regions]);

  const selectedType = useWatch({ control: form.control, name: 'type' });

  if (!open) {
    return null;
  }

  const title =
    mode === 'create'
      ? 'Apartman hozzáadása'
      : mode === 'edit'
        ? 'Apartman szerkesztése'
        : 'Apartman részletei';

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Bezárás"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[min(100vw,1100px)] flex-col bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'detail'
                ? 'Részletek, szolgáltatások és árak áttekintése.'
                : 'Az alapadatok, SEO blokkok és ár mátrix kezelése.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'detail' && apartment ? (
              <>
                {onToggleActive ? (
                  <Button type="button" variant="outline" onClick={onToggleActive}>
                    <Power className="size-4" />
                    {apartment.isActive ?? apartment.status !== 'archived'
                      ? 'Inaktiválás'
                      : 'Aktiválás'}
                  </Button>
                ) : null}
                {onEdit ? (
                  <Button type="button" variant="outline" onClick={onEdit}>
                    <Pencil className="size-4" />
                    Szerkesztés
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button type="button" variant="destructive" onClick={onDelete}>
                    <Trash2 className="size-4" />
                    Törlés
                  </Button>
                ) : null}
              </>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-6 py-5">
            {mode !== 'create' && isLoading ? (
              <div className="space-y-4">
                <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
                <div className="h-24 animate-pulse rounded-2xl bg-muted" />
                <div className="h-64 animate-pulse rounded-2xl bg-muted" />
              </div>
            ) : mode !== 'create' && errorMessage ? (
              <div className="space-y-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                <p>{errorMessage}</p>
                <div className="flex gap-3">
                  {onRetry ? (
                    <Button type="button" variant="outline" onClick={onRetry}>
                      Újrapróbálás
                    </Button>
                  ) : null}
                  <Button type="button" onClick={() => onOpenChange(false)}>
                    Vissza a listához
                  </Button>
                </div>
              </div>
            ) : mode !== 'create' && !apartment ? (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
                Az apartman nem található vagy még nem töltődött be.
              </div>
            ) : mode === 'detail' && apartment ? (
              <ApartmentDetailView
                apartment={apartment}
                regions={regions}
                locations={locations}
                galleries={galleries}
              />
            ) : (
              <Form {...form}>
                <form
                  className="flex min-h-full flex-col"
                  onSubmit={form.handleSubmit((values: ApartmentFormValues) =>
                    onSubmit({
                      ...values,
                      seoName: values.autoGenerateSeoName
                        ? createSlug(values.name)
                        : values.seoName,
                    }),
                  )}
                >
                  <ApartmentForm
                    form={form}
                    regions={regions}
                    locations={locations}
                    galleries={galleries}
                    typeLocked={typeLocked}
                  />

                  <div className="sticky bottom-0 mt-6 border-t bg-background/95 px-0 py-4 backdrop-blur">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                      >
                        Mégse
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting || (mode === 'create' && !selectedType)}
                      >
                        {submitting ? 'Mentés...' : 'Mentés'}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
