import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { TourFormValues } from '../lib/tours.types';

type TourCitiesSectionProps = {
  form: UseFormReturn<TourFormValues>;
};

type CityRow = {
  fieldId: string;
  index: number;
  clientId: string;
  sortOrder: number;
  name: string;
};

function sortRows(rows: CityRow[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.index - b.index);
}

export function TourCitiesSection({ form }: TourCitiesSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'cities',
  });
  const watchedItems = useWatch({
    control: form.control,
    name: 'cities',
  }) ?? [];
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const rows: CityRow[] = fields.map((field, index) => {
    const value = watchedItems[index];

    return {
      fieldId: field.id,
      index,
      clientId: value?.clientId ?? field.id,
      sortOrder: value?.sortOrder ?? index + 1,
      name: value?.name ?? '',
    };
  });

  const reorder = (fromId: string, toId: string) => {
    const ordered = sortRows(rows);
    const fromIndex = ordered.findIndex((row) => row.clientId === fromId);
    const toIndex = ordered.findIndex((row) => row.clientId === toId);

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }

    const next = [...ordered];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    next.forEach((row, orderIndex) => {
      form.setValue(`cities.${row.index}.sortOrder`, orderIndex + 1, {
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  };

  const appendItem = () => {
    const nextSortOrder = Math.max(0, ...rows.map((row) => row.sortOrder)) + 1;

    append({
      clientId: crypto.randomUUID(),
      sortOrder: nextSortOrder,
      name: '',
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="font-semibold">Érintett városok</h3>
        <p className="text-sm text-muted-foreground">
          Opcionális lista a program útvonalán érintett városokról. Ha üres, a blokk nem jelenik
          meg a publikus oldalon.
        </p>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const isDragging = draggingId === row.clientId;

          return (
            <div
              key={row.fieldId}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', row.clientId);
                setDraggingId(row.clientId);
              }}
              onDragEnd={() => setDraggingId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (draggingId) {
                  reorder(draggingId, row.clientId);
                }
                setDraggingId(null);
              }}
              className={`flex items-center gap-2 rounded-xl border bg-background p-2 ${
                isDragging ? 'opacity-60' : ''
              }`}
            >
              <button
                type="button"
                className="cursor-grab rounded-lg border bg-muted/60 p-2 text-muted-foreground active:cursor-grabbing"
                aria-label="Átrendezés"
              >
                <GripVertical className="size-4" />
              </button>

              <FormField
                control={form.control}
                name={`cities.${row.index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Város neve" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="button" variant="outline" size="icon" onClick={() => remove(row.index)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="outline" onClick={appendItem}>
        <Plus className="size-4" />
        Új város
      </Button>
    </section>
  );
}
