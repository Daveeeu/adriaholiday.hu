import { Pencil, Power, Copy, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { EntitySidePanel } from '@/components/admin/entity-side-panel';
import { RichTextPreview } from '@/components/editor/rich-text-editor';

import { TourForm } from './TourForm';
import { getTourFormDefaults } from '../lib/tours.types';
import type { Tour, TourFormValues } from '../lib/tours.types';

type TourSidePanelProps = {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  tour?: Tour;
  loading?: boolean;
  error?: string | null;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TourFormValues) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
  onDuplicate?: () => void;
};

function DetailItem({
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
          : typeof value === 'string'
            ? value.trim() !== ''
              ? value
              : '—'
            : value ?? '—'}
      </div>
    </div>
  );
}

function DetailChips({
  label,
  items,
}: {
  label: string;
  items: Array<{ id: string; label: string }> | undefined;
}) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items && items.length > 0 ? (
          items.map((item) => (
            <Badge key={item.id} className="bg-muted text-foreground">
              {item.label}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

function PriceItemsDetail({
  items,
}: {
  items: Tour['priceItems'] | undefined;
}) {
  const included = (items ?? [])
    .filter((item) => item.type === 'included')
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const excluded = (items ?? [])
    .filter((item) => item.type === 'excluded')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (included.length === 0 && excluded.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {included.length > 0 ? (
        <div className="rounded-xl border bg-background p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Az ár tartalmazza
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {included.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <span className="mt-1 text-emerald-600">•</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {excluded.length > 0 ? (
        <div className="rounded-xl border bg-background p-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Az ár nem tartalmazza
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {excluded.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <span className="mt-1 text-rose-600">•</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ProgramDaysDetail({
  days,
}: {
  days: Tour['programDays'] | undefined;
}) {
  const programDays = (days ?? [])
    .filter((day) => day.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.dayNumber - b.dayNumber);

  if (programDays.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="space-y-3">
      {programDays.map((day) => (
        <div key={day.id} className="rounded-xl border bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {day.dayNumber}. nap
              </div>
              <div className="mt-1 text-base font-semibold">{day.title}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {day.experienceType || 'Élmény'}
            </div>
          </div>

          {day.badges.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {day.badges.map((badge) => (
                <Badge key={badge} className="bg-muted text-foreground">
                  {badge}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-3">
            <RichTextPreview
              value={day.description || ''}
              className="border-0 bg-transparent p-0 rounded-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TourDetailView({ tour }: { tour: Tour }) {
  const priceBox = tour.priceBox;

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{tour.name}</h3>
            <p className="text-sm text-muted-foreground">{tour.seoName}</p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              tour.active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-700',
            )}
          >
            {tour.active ? 'Aktív' : 'Inaktív'}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Sorrend" value={tour.sortOrder} />
          <DetailItem label="Régió" value={tour.regionLabel} />
          <DetailItem label="Főoldali ajánlat" value={tour.homepageOfferLabel} />
          <DetailItem label="Csoport" value={tour.groupLabel} />
          <DetailItem label="Ajánlat csoport" value={tour.seasonalGroupLabel} />
          <DetailItem label="FIT" value={tour.fitLabel} />
          <DetailItem label="Program típus" value={tour.programTypeLabel} />
          <DetailItem label="Közlekedés" value={tour.travelModeLabel} />
          <DetailItem label="Nehézségi szint" value={tour.difficultyLabel} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Állapotok</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <DetailItem label="Kiemelt" value={tour.featured} />
          <DetailItem label="Ajánlott" value={tour.recommended} />
          <DetailItem label="Partner ajánlat" value={tour.partnerOffer} />
          <DetailItem label="Képes ajánlat" value={tour.imageOffer} />
          <DetailItem label="XML" value={tour.xmlEnabled} />
          <DetailItem label="Slider kép" value={tour.sliderImageEnabled} />
          <DetailItem label="Slider szöveg" value={tour.sliderTextEnabled} />
          <DetailItem
            label="Megjelenített ár"
            value={priceBox?.displayedPrice ?? tour.displayedPrice}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Ár / PriceBox</h4>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Alapár" value={priceBox?.price ?? tour.price} />
          <DetailItem label="Pénznem" value={priceBox?.currency} />
          <DetailItem label="Ár utótag" value={priceBox?.priceSuffix} />
          <DetailItem label="Kedvezmény badge" value={priceBox?.discountBadge} />
          <DetailItem label="Kedvezmény szöveg" value={priceBox?.discountText} />
          <DetailItem label="Urgency szöveg" value={priceBox?.urgencyText} />
          <DetailItem label="Értékelés szöveg" value={priceBox?.ratingText} />
          <DetailItem label="Minimum fő" value={priceBox?.minParticipants} />
          <DetailItem label="Maximum fő" value={priceBox?.maxParticipants} />
          <DetailItem label="Szabad férőhely" value={priceBox?.availableSeats} />
          <DetailItem label="Kapacitás" value={priceBox?.capacity} />
          <DetailItem label="Elsődleges CTA" value={priceBox?.ctaPrimaryLabel} />
          <DetailItem label="Másodlagos CTA" value={priceBox?.ctaSecondaryLabel} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Kapcsolatok</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <DetailChips label="Országok" items={tour.countries} />
          <DetailChips label="Címkék" items={tour.tags} />
          <DetailChips label="Kategóriák" items={tour.categories} />
          <DetailChips
            label="Felszállási helyek"
            items={tour.departurePlaces?.map((place) => ({
              id: place.id,
              label: place.name,
            }))}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Szöveges tartalom</h4>
        <div className="grid gap-3">
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Lista leírás
            </div>
            <RichTextPreview
              value={tour.listDescription || ''}
              className="mt-2 border-0 bg-transparent p-0 rounded-none"
            />
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Rövid ismertető
            </div>
            <RichTextPreview
              value={tour.shortDescription || ''}
              className="mt-2 border-0 bg-transparent p-0 rounded-none"
            />
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Program előtt
            </div>
            <RichTextPreview
              value={tour.programBefore || ''}
              className="mt-2 border-0 bg-transparent p-0 rounded-none"
            />
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Program
            </div>
            <RichTextPreview
              value={tour.program || ''}
              className="mt-2 border-0 bg-transparent p-0 rounded-none"
            />
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              További szolgáltatási információk
            </div>
            <RichTextPreview
              value={tour.inclusions || ''}
              className="mt-2 border-0 bg-transparent p-0 rounded-none"
            />
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Fizetési program
            </div>
            <RichTextPreview
              value={tour.paymentProgram || ''}
              className="mt-2 border-0 bg-transparent p-0 rounded-none"
            />
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Árak
            </div>
            <RichTextPreview
              value={tour.prices || ''}
              className="mt-2 border-0 bg-transparent p-0 rounded-none"
            />
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Kedvezmények
            </div>
            <RichTextPreview
              value={tour.discounts || ''}
              className="mt-2 border-0 bg-transparent p-0 rounded-none"
            />
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Jegyzet
            </div>
            <RichTextPreview
              value={tour.notes || ''}
              className="mt-2 border-0 bg-transparent p-0 rounded-none"
            />
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Program napok
            </div>
            <div className="mt-2">
              <ProgramDaysDetail days={tour.programDays} />
            </div>
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Ár tartalma
            </div>
            <div className="mt-2">
              <PriceItemsDetail items={tour.priceItems} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function TourSidePanel({
  open,
  mode,
  tour,
  loading = false,
  error = null,
  submitting = false,
  onOpenChange,
  onSubmit,
  onEdit,
  onDelete,
  onToggleActive,
  onDuplicate,
}: TourSidePanelProps) {
  const form = useForm<TourFormValues>({
    defaultValues: getTourFormDefaults(tour),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(getTourFormDefaults(tour));
  }, [form, open, tour]);

  if (!open) {
    return null;
  }

  if (mode !== 'create' && loading) {
    return (
      <EntitySidePanel
        open={open}
        title={mode === 'edit' ? 'Körutazás szerkesztése' : 'Körutazás részletei'}
        description="A körutazás teljes adminisztrációs felülete."
        onOpenChange={onOpenChange}
      >
        <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
          Körutazás adatok betöltése...
        </div>
      </EntitySidePanel>
    );
  }

  if (mode !== 'create' && error) {
    return (
      <EntitySidePanel
        open={open}
        title={mode === 'edit' ? 'Körutazás szerkesztése' : 'Körutazás részletei'}
        description="A körutazás teljes adminisztrációs felülete."
        onOpenChange={onOpenChange}
      >
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Nem sikerült betölteni a körutazás adatait.
        </div>
      </EntitySidePanel>
    );
  }

  const title =
    mode === 'create'
      ? 'Körutazás hozzáadása'
      : mode === 'edit'
        ? 'Körutazás szerkesztése'
        : 'Körutazás részletei';

  return (
    <EntitySidePanel
      open={open}
      title={title}
      description="A körutazás teljes adminisztrációs felülete."
      onOpenChange={onOpenChange}
      headerActions={
        mode === 'detail' && tour ? (
          <>
            {onToggleActive ? (
              <Button type="button" variant="outline" onClick={onToggleActive}>
                <Power className="size-4" />
                {tour.active ? 'Deaktiválás' : 'Aktiválás'}
              </Button>
            ) : null}
            {onDuplicate ? (
              <Button type="button" variant="outline" onClick={onDuplicate}>
                <Copy className="size-4" />
                Másolás
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
        ) : null
      }
      footer={
        mode === 'detail' ? null : (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {mode === 'edit' && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={submitting}
              >
                <Trash2 className="size-4" />
                Törlés
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Mégse
            </Button>
            <Button type="submit" disabled={submitting} form="tour-panel-form">
              {submitting ? 'Mentés...' : 'Mentés'}
            </Button>
          </div>
        )
      }
    >
      {mode === 'detail' && tour ? (
        <TourDetailView tour={tour} />
      ) : (
        <Form {...form}>
          <form
            id="tour-panel-form"
            className="flex min-h-full flex-col"
            onSubmit={form.handleSubmit((values) => onSubmit(values))}
          >
            <TourForm form={form} tour={tour} />
          </form>
        </Form>
      )}
    </EntitySidePanel>
  );
}
