import { Pencil, Power, Copy, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { EntitySidePanel } from '@/components/admin/entity-side-panel';

import { TourForm } from './TourForm';
import { getTourFormDefaults } from '../lib/tours.types';
import type { Tour, TourFormValues } from '../lib/tours.types';

type TourSidePanelProps = {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  tour?: Tour;
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
        {typeof value === 'boolean' ? (value ? 'Igen' : 'Nem') : value || '—'}
      </div>
    </div>
  );
}

function TourDetailView({ tour }: { tour: Tour }) {
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
          <DetailItem label="ID" value={tour.id} />
          <DetailItem label="Sorrend" value={tour.sortOrder} />
          <DetailItem label="Régió" value={tour.regionId} />
          <DetailItem label="Csoport" value={tour.groupId} />
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
          <DetailItem label="Megjelenített ár" value={tour.displayedPrice} />
        </div>
      </section>
    </div>
  );
}

export function TourSidePanel({
  open,
  mode,
  tour,
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
            <TourForm form={form} />
          </form>
        </Form>
      )}
    </EntitySidePanel>
  );
}
