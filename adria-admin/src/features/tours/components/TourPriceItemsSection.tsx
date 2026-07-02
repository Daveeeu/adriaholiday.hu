import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { TourFormValues, TourPriceItemType } from '../lib/tours.types';

type TourPriceItemsSectionProps = {
  form: UseFormReturn<TourFormValues>;
};

type PriceItemRow = {
  fieldId: string;
  index: number;
  clientId: string;
  type: TourPriceItemType;
  text: string;
  sortOrder: number;
  active: boolean;
};

function sortPriceRows(rows: PriceItemRow[]) {
  return [...rows].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.index - b.index,
  );
}

export function TourPriceItemsSection({ form }: TourPriceItemsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'priceItems',
  });
  const watchedItems = useWatch({
    control: form.control,
    name: 'priceItems',
  }) ?? [];
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const rows: PriceItemRow[] = fields.map((field, index) => {
    const value = watchedItems[index];

    return {
      fieldId: field.id,
      index,
      clientId: value?.clientId ?? field.id,
      type: value?.type ?? 'included',
      text: value?.text ?? '',
      sortOrder: value?.sortOrder ?? index + 1,
      active: value?.active ?? true,
    };
  });

  const reorder = (type: TourPriceItemType, fromId: string, toId: string) => {
    const ordered = sortPriceRows(rows.filter((row) => row.type === type));
    const fromIndex = ordered.findIndex((row) => row.clientId === fromId);
    const toIndex = ordered.findIndex((row) => row.clientId === toId);

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }

    const next = [...ordered];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    next.forEach((row, orderIndex) => {
      form.setValue(`priceItems.${row.index}.sortOrder`, orderIndex + 1, {
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  };

  const appendItem = (type: TourPriceItemType) => {
    const nextSortOrder =
      Math.max(
        0,
        ...rows.filter((row) => row.type === type).map((row) => row.sortOrder),
      ) + 1;

    append({
      clientId: crypto.randomUUID(),
      type,
      text: '',
      sortOrder: nextSortOrder,
      active: true,
    });
  };

  const removeItem = (index: number) => {
    remove(index);
  };

  const renderList = (type: TourPriceItemType, title: string, description: string) => {
    const items = sortPriceRows(rows.filter((row) => row.type === type));

    return (
      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <Button type="button" variant="outline" onClick={() => appendItem(type)}>
            <Plus className="size-4" />
            Új elem
          </Button>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nincs még megadott elem.
            </p>
          ) : (
            items.map((item) => {
              const isDragging = draggingId === item.clientId;

              return (
                <div
                  key={item.fieldId}
                  draggable
                  onDragStart={() => setDraggingId(item.clientId)}
                  onDragEnd={() => setDraggingId(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggingId) {
                      reorder(type, draggingId, item.clientId);
                    }
                    setDraggingId(null);
                  }}
                  className={`grid gap-3 rounded-xl border bg-background p-3 md:grid-cols-[auto_1fr_auto] md:items-start ${
                    isDragging ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 pt-2">
                    <button
                      type="button"
                      className="cursor-grab rounded-lg border bg-muted/60 p-2 text-muted-foreground active:cursor-grabbing"
                      aria-label="Átrendezés"
                    >
                      <GripVertical className="size-4" />
                    </button>

                    <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      #{item.sortOrder}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <FormField
                      control={form.control}
                      name={`priceItems.${item.index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Szöveg</FormLabel>
                          <FormControl>
                            <Input placeholder="Elem szövege" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`priceItems.${item.index}.active`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aktív</FormLabel>
                          <label className="flex h-10 items-center gap-2 rounded-xl border bg-background px-3 text-sm">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(event) => field.onChange(event.target.checked)}
                            />
                            Megjelenik
                          </label>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-end justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeItem(item.index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Ár tartalma</h3>
        <p className="text-sm text-muted-foreground">
          Az árban szereplő és az árban nem szereplő tételek külön, rendezhető listákban.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {renderList(
          'included',
          'Az ár tartalmazza',
          'A publikus részletező bal oldali kártyája.',
        )}
        {renderList(
          'excluded',
          'Az ár nem tartalmazza',
          'A publikus részletező jobb oldali kártyája.',
        )}
      </div>
    </div>
  );
}
