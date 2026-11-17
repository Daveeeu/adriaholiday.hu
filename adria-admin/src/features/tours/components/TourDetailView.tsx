import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { RichTextPreview } from '@/components/editor/rich-text-editor';
import { cn } from '@/lib/utils';

import type { Tour } from '../lib/tours.types';

const RICH_TEXT_FIELDS: Array<{ key: keyof Tour; label: string }> = [
  { key: 'listDescription', label: 'Lista leírás' },
  { key: 'shortDescription', label: 'Rövid ismertető' },
  { key: 'programBefore', label: 'Program előtt' },
  { key: 'program', label: 'Program' },
  { key: 'inclusions', label: 'További szolgáltatási információk' },
  { key: 'paymentProgram', label: 'Fizetési program' },
  { key: 'teaser', label: 'Kedvcsináló' },
  { key: 'optionalPrograms', label: 'Fakultatív programok' },
  { key: 'tickets', label: 'Belépőjegyek' },
  { key: 'prices', label: 'Árak' },
  { key: 'discounts', label: 'Kedvezmények' },
  { key: 'notes', label: 'Jegyzet' },
];

function formatValue(value?: string | number | boolean | null): ReactNode {
  if (typeof value === 'boolean') {
    return value ? 'Igen' : 'Nem';
  }

  if (typeof value === 'string') {
    return value.trim() !== '' ? value : '—';
  }

  return value ?? '—';
}

function DetailCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  return (
    <DetailCard label={label}>
      <div className="mt-1 text-sm font-medium">{formatValue(value)}</div>
    </DetailCard>
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
    <DetailCard label={label}>
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
    </DetailCard>
  );
}

function PriceItemList({
  title,
  items,
  bulletClassName,
}: {
  title: string;
  items: Tour['priceItems'];
  bulletClassName: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <DetailCard label={title}>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <span className={cn('mt-1', bulletClassName)}>•</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </DetailCard>
  );
}

function PriceItemsDetail({
  items,
}: {
  items: Tour['priceItems'] | undefined;
}) {
  const sorted = [...(items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const included = sorted.filter((item) => item.type === 'included');
  const excluded = sorted.filter((item) => item.type === 'excluded');

  if (included.length === 0 && excluded.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <PriceItemList
        title="Az ár tartalmazza"
        items={included}
        bulletClassName="text-emerald-600"
      />
      <PriceItemList
        title="Az ár nem tartalmazza"
        items={excluded}
        bulletClassName="text-rose-600"
      />
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
              className="rounded-none border-0 bg-transparent p-0"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Everything a saved tour holds, read-only. */
export function TourDetailView({ tour }: { tour: Tour }) {
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
          <DetailItem label="Program típus" value={tour.programTypeLabel} />
          <DetailItem label="Közlekedés" value={tour.travelModeLabel} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Állapotok</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <DetailItem label="Kiemelt" value={tour.featured} />
          <DetailItem label="Ajánlott" value={tour.recommended} />
          <DetailItem label="Partnerportálokon" value={tour.xmlEnabled} />
          <DetailItem
            label="Megjelenített ár"
            value={priceBox?.displayedPrice ?? tour.displayedPrice}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Árdoboz</h4>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Alapár" value={priceBox?.price ?? tour.price} />
          <DetailItem label="Pénznem" value={priceBox?.currency} />
          <DetailItem label="Ár utótag" value={priceBox?.priceSuffix} />
          <DetailItem
            label="Kedvezmény címke"
            value={priceBox?.discountBadge}
          />
          <DetailItem label="Ár alatti szöveg" value={priceBox?.discountText} />
          <DetailItem label="Sürgető felirat" value={priceBox?.urgencyText} />
          <DetailItem label="Értékelés szöveg" value={priceBox?.ratingText} />
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
          {RICH_TEXT_FIELDS.map(({ key, label }) => {
            const value = tour[key];

            return (
              <DetailCard key={key} label={label}>
                <RichTextPreview
                  value={typeof value === 'string' ? value : ''}
                  className="mt-2 rounded-none border-0 bg-transparent p-0"
                />
              </DetailCard>
            );
          })}
          <DetailCard label="Program napok">
            <div className="mt-2">
              <ProgramDaysDetail days={tour.programDays} />
            </div>
          </DetailCard>
          <DetailCard label="Ár tartalma">
            <div className="mt-2">
              <PriceItemsDetail items={tour.priceItems} />
            </div>
          </DetailCard>
        </div>
      </section>
    </div>
  );
}
