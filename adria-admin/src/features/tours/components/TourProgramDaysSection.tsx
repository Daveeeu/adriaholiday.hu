import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { Copy, GripVertical, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MediaPicker } from '@/components/media/media-picker';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

import { renderProgramDayIcon } from '../lib/program-day-icon-map';
import type { TourFormValues, TourProgramDayFormValue } from '../lib/tours.types';

type TourProgramDaysSectionProps = {
  form: UseFormReturn<TourFormValues>;
};

type ProgramDayRow = {
  fieldId: string;
  index: number;
  clientId: string;
  sortOrder: number;
  dayNumber: number;
  title: string;
  description: string;
  image: string;
  icon: string;
  experienceType: string;
  active: boolean;
  badges: TourProgramDayFormValue['badges'];
};

function sortRows(rows: ProgramDayRow[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.index - b.index);
}

function ProgramDayBadgesField({
  form,
  dayIndex,
}: {
  form: UseFormReturn<TourFormValues>;
  dayIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `programDays.${dayIndex}.badges` as const,
  });

  return (
    <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Badge-ek</div>
          <div className="text-xs text-muted-foreground">Városnézés, fotómegálló stb.</div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              clientId: crypto.randomUUID(),
              text: '',
            })
          }
        >
          <Plus className="size-4" />
          Badge
        </Button>
      </div>

      <div className="space-y-2">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nincs még badge megadva.</p>
        ) : (
          fields.map((field, badgeIndex) => (
            <div key={field.id} className="grid gap-2 md:grid-cols-[1fr_auto]">
              <FormField
                control={form.control}
                name={`programDays.${dayIndex}.badges.${badgeIndex}.text` as const}
                render={({ field: badgeField }) => (
                  <FormItem>
                    <FormLabel>Badge szöveg</FormLabel>
                    <FormControl>
                      <Input placeholder="Városnézés" {...badgeField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(badgeIndex)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ProgramDayCard({
  form,
  row,
  onCopy,
  onDelete,
  isDragging,
}: {
  form: UseFormReturn<TourFormValues>;
  row: ProgramDayRow;
  onCopy: () => void;
  onDelete: () => void;
  isDragging: boolean;
}) {
  return (
    <div
      className={`grid gap-4 rounded-2xl border bg-background p-4 shadow-sm md:grid-cols-[auto_1fr_auto] md:items-start ${
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
          #{row.sortOrder}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            control={form.control}
            name={`programDays.${row.index}.dayNumber`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nap száma</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`programDays.${row.index}.experienceType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Élmény típusa</FormLabel>
                <FormControl>
                  <Input placeholder="Utazás, Kultúra..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`programDays.${row.index}.icon`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ikon kulcs</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input placeholder="bus, beach, camera..." {...field} />
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted/30 text-foreground">
                      {renderProgramDayIcon(field.value, 'size-4')}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`programDays.${row.index}.active`}
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

        <FormField
          control={form.control}
          name={`programDays.${row.index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cím</FormLabel>
              <FormControl>
                <Input placeholder="Nap címe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`programDays.${row.index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leírás</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={typeof field.value === 'string' ? field.value : ''}
                  onChange={(next) => field.onChange(next)}
                  placeholder="Napi program leírása"
                  minHeight={200}
                  allowPreview
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`programDays.${row.index}.image`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MediaPicker
                  label="Kép"
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? '')}
                  description="Közös médiatárból választott kép."
                  defaultCategory="tours"
                  allowedTypes={['image']}
                  sourceContext="tour_program_day"
                  uploadAlt={row.title || undefined}
                  uploadTitle={row.title || undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ProgramDayBadgesField form={form} dayIndex={row.index} />
      </div>

      <div className="flex items-start justify-end gap-2">
        <Button type="button" variant="outline" size="icon" onClick={onCopy}>
          <Copy className="size-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={onDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function TourProgramDaysSection({ form }: TourProgramDaysSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'programDays',
  });
  const watchedItems = useWatch({
    control: form.control,
    name: 'programDays',
  }) ?? [];
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const rows: ProgramDayRow[] = fields.map((field, index) => {
    const value = watchedItems[index];

    return {
      fieldId: field.id,
      index,
      clientId: value?.clientId ?? field.id,
      sortOrder: value?.sortOrder ?? index + 1,
      dayNumber: value?.dayNumber ?? index + 1,
      title: value?.title ?? '',
      description: value?.description ?? '',
      image: value?.image ?? '',
      icon: value?.icon ?? '',
      experienceType: value?.experienceType ?? '',
      active: value?.active ?? true,
      badges: value?.badges ?? [],
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
      form.setValue(`programDays.${row.index}.sortOrder`, orderIndex + 1, {
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
      dayNumber: rows.length + 1,
      title: '',
      description: '',
      image: '',
      icon: '',
      experienceType: '',
      badges: [],
      active: true,
    });
  };

  const copyItem = (item: ProgramDayRow) => {
    append({
      clientId: crypto.randomUUID(),
      sortOrder: rows.length + 1,
      dayNumber: item.dayNumber,
      title: `${item.title} másolat`,
      description: item.description,
      image: item.image,
      icon: item.icon,
      experienceType: item.experienceType,
      badges: item.badges.map((badge, index) => ({
        clientId: `${crypto.randomUUID()}-${index}`,
        text: badge.text,
      })),
      active: item.active,
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="font-semibold">Program napok</h3>
        <p className="text-sm text-muted-foreground">
          Napokra bontott timeline, amely a publikus oldal részletes programját adja.
        </p>
      </div>

      <div className="space-y-3">
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
              className={isDragging ? 'opacity-60' : ''}
            >
              <ProgramDayCard
                form={form}
                row={row}
                isDragging={isDragging}
                onCopy={() => copyItem(row)}
                onDelete={() => remove(row.index)}
              />
            </div>
          );
        })}
      </div>

      <Button type="button" variant="outline" onClick={appendItem}>
        <Plus className="size-4" />
        Új programnap
      </Button>
    </section>
  );
}
