import { useRef, useState, type DragEvent } from 'react';
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react';

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
import type { MediaCategory } from '@/components/media/media.constants';
import { createClientId } from '@/lib/client-id';

import type { GalleryItemsFormValues } from './gallery-items';

type GalleryRow = {
  fieldId: string;
  index: number;
  clientId: string;
  sortOrder: number;
  mediaId: string;
  image: string;
  title: string;
  alt: string;
  caption: string;
  active: boolean;
};

function sortRows(rows: GalleryRow[]) {
  return [...rows].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.index - b.index,
  );
}

function GalleryCard({
  form,
  row,
  position,
  count,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
  defaultCategory,
  sourceContext,
  showCaption,
}: {
  form: UseFormReturn<GalleryItemsFormValues>;
  row: GalleryRow;
  /** The image's place in the gallery, from 0. */
  position: number;
  count: number;
  onDelete: () => void;
  onMove: (toPosition: number) => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
  defaultCategory: MediaCategory;
  sourceContext: string;
  showCaption: boolean;
}) {
  return (
    <div className="grid gap-4 rounded-2xl border bg-background p-4 shadow-sm lg:grid-cols-[minmax(0,320px)_1fr_auto]">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className="cursor-grab rounded-lg border bg-muted/60 p-2 text-muted-foreground active:cursor-grabbing"
            aria-label="Áthúzás máshová"
            title="Fogd meg és húzd a kép új helyére"
          >
            <GripVertical className="size-4" />
          </button>

          <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {position + 1}. kép
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onMove(position - 1)}
              disabled={position === 0}
              aria-label="Feljebb"
              title="Feljebb"
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onMove(position + 1)}
              disabled={position === count - 1}
              aria-label="Lejjebb"
              title="Lejjebb"
            >
              <ArrowDown className="size-4" />
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name={`gallery.${row.index}.image`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MediaPicker
                  label="Kép"
                  value={field.value || null}
                  onChange={(value, media) => {
                    field.onChange(value ?? '');
                    form.setValue(
                      `gallery.${row.index}.mediaId`,
                      media ? String(media.id) : '',
                      {
                        shouldDirty: true,
                        shouldTouch: true,
                      },
                    );

                    if (media) {
                      if (
                        !form.getValues(`gallery.${row.index}.title`) &&
                        media.title
                      ) {
                        form.setValue(
                          `gallery.${row.index}.title`,
                          media.title,
                          {
                            shouldDirty: true,
                            shouldTouch: true,
                          },
                        );
                      }
                      if (
                        !form.getValues(`gallery.${row.index}.alt`) &&
                        media.alt
                      ) {
                        form.setValue(`gallery.${row.index}.alt`, media.alt, {
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      }
                    }
                  }}
                  description="Médiatárból kiválasztott kép."
                  defaultCategory={defaultCategory}
                  allowedTypes={['image']}
                  sourceContext={sourceContext}
                  uploadAlt={row.alt || row.title || undefined}
                  uploadTitle={row.title || undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`gallery.${row.index}.active`}
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

      <div className="grid gap-4">
        <FormField
          control={form.control}
          name={`gallery.${row.index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cím</FormLabel>
              <FormControl>
                <Input placeholder="Tengerparti panoráma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`gallery.${row.index}.alt`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alt szöveg</FormLabel>
              <FormControl>
                <Input placeholder="Bibione tengerpart" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCaption ? (
          <FormField
            control={form.control}
            name={`gallery.${row.index}.caption`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Képaláírás</FormLabel>
                <FormControl>
                  <Input placeholder="Naplemente a tengerparton" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
      </div>

      <div className="flex items-start justify-end">
        <Button type="button" variant="outline" size="icon" onClick={onDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

type GalleryItemsEditorProps = {
  form: UseFormReturn<GalleryItemsFormValues>;
  /** The media library category new uploads go to. */
  defaultCategory: MediaCategory;
  sourceContext: string;
  showCaption?: boolean;
  addLabel?: string;
};

/**
 * The images of a gallery: picked from (or uploaded to) the media library,
 * with title and alt text, shown in their order and reordered by dragging
 * or with the up and down buttons.
 */
export function GalleryItemsEditor({
  form,
  defaultCategory,
  sourceContext,
  showCaption = true,
  addLabel = 'Galéria kép hozzáadása',
}: GalleryItemsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'gallery',
  });
  const watchedItems =
    useWatch({
      control: form.control,
      name: 'gallery',
    }) ?? [];
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const cardElements = useRef<Record<string, HTMLDivElement | null>>({});

  const rows: GalleryRow[] = fields.map((field, index) => {
    const value = watchedItems[index];

    return {
      fieldId: field.id,
      index,
      clientId: value?.clientId ?? field.id,
      sortOrder: value?.sortOrder ?? index + 1,
      mediaId: value?.mediaId ?? '',
      image: value?.image ?? '',
      title: value?.title ?? '',
      alt: value?.alt ?? '',
      caption: value?.caption ?? '',
      active: value?.active ?? true,
    };
  });

  const orderedRows = sortRows(rows);

  const move = (clientId: string, toPosition: number) => {
    const fromPosition = orderedRows.findIndex(
      (row) => row.clientId === clientId,
    );

    if (
      fromPosition < 0 ||
      toPosition < 0 ||
      toPosition >= orderedRows.length ||
      fromPosition === toPosition
    ) {
      return;
    }

    const next = [...orderedRows];
    const [moved] = next.splice(fromPosition, 1);
    next.splice(toPosition, 0, moved);

    next.forEach((row, orderIndex) => {
      form.setValue(`gallery.${row.index}.sortOrder`, orderIndex + 1, {
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  };

  const appendItem = () => {
    const nextSortOrder = Math.max(0, ...rows.map((row) => row.sortOrder)) + 1;

    append({
      clientId: createClientId(),
      mediaId: '',
      image: '',
      title: '',
      alt: '',
      caption: '',
      sortOrder: nextSortOrder,
      active: true,
    });
  };

  return (
    <>
      <div className="space-y-3">
        {orderedRows.map((row, position) => {
          const isDragging = draggingId === row.clientId;

          return (
            <div
              key={row.fieldId}
              ref={(element) => {
                cardElements.current[row.clientId] = element;
              }}
              onDragOver={(event) => {
                if (draggingId) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (draggingId) {
                  move(draggingId, position);
                }
                setDraggingId(null);
              }}
              className={isDragging ? 'opacity-60' : ''}
            >
              <GalleryCard
                form={form}
                row={row}
                position={position}
                count={orderedRows.length}
                onMove={(toPosition) => move(row.clientId, toPosition)}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', row.clientId);
                  const card = cardElements.current[row.clientId];
                  if (card) {
                    event.dataTransfer.setDragImage(card, 24, 24);
                  }
                  setDraggingId(row.clientId);
                }}
                onDragEnd={() => setDraggingId(null)}
                onDelete={() => remove(row.index)}
                defaultCategory={defaultCategory}
                sourceContext={sourceContext}
                showCaption={showCaption}
              />
            </div>
          );
        })}
      </div>

      <Button type="button" variant="outline" onClick={appendItem}>
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </>
  );
}
