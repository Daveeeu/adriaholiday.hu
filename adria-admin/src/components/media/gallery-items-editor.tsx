import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { ReorderControls } from '@/components/admin/reorder-controls';
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
import { useDragReorder, type DragHandleProps } from '@/lib/use-drag-reorder';

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
  dragHandleProps,
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
  dragHandleProps: DragHandleProps;
  defaultCategory: MediaCategory;
  sourceContext: string;
  showCaption: boolean;
}) {
  return (
    <div className="grid gap-4 rounded-2xl border bg-background p-4 shadow-sm lg:grid-cols-[minmax(0,320px)_1fr_auto]">
      <div className="space-y-3">
        <ReorderControls
          position={position}
          count={count}
          itemLabel="kép"
          onMove={onMove}
          dragHandleProps={dragHandleProps}
        />

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

  const { draggingKey, handleProps, itemProps } = useDragReorder(move);

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
          return (
            <div
              key={row.fieldId}
              {...itemProps(row.clientId, position)}
              className={draggingKey === row.clientId ? 'opacity-60' : ''}
            >
              <GalleryCard
                form={form}
                row={row}
                position={position}
                count={orderedRows.length}
                onMove={(toPosition) => move(row.clientId, toPosition)}
                dragHandleProps={handleProps(row.clientId)}
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
