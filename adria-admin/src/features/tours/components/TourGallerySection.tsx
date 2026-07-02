import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MediaPicker } from '@/components/media/media-picker';

import type { TourFormValues } from '../lib/tours.types';

type TourGallerySectionProps = {
  form: UseFormReturn<TourFormValues>;
};

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
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.index - b.index);
}

function GalleryCard({
  form,
  row,
  onDelete,
  isDragging,
}: {
  form: UseFormReturn<TourFormValues>;
  row: GalleryRow;
  onDelete: () => void;
  isDragging: boolean;
}) {
  return (
    <div
      className={`grid gap-4 rounded-2xl border bg-background p-4 shadow-sm lg:grid-cols-[minmax(0,320px)_1fr_auto] ${
        isDragging ? 'opacity-60' : ''
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
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
                    form.setValue(`gallery.${row.index}.mediaId`, media ? String(media.id) : '', {
                      shouldDirty: true,
                      shouldTouch: true,
                    });

                    if (media) {
                      if (!form.getValues(`gallery.${row.index}.title`) && media.title) {
                        form.setValue(`gallery.${row.index}.title`, media.title, {
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      }
                      if (!form.getValues(`gallery.${row.index}.alt`) && media.alt) {
                        form.setValue(`gallery.${row.index}.alt`, media.alt, {
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      }
                    }
                  }}
                  description="Médiatárból kiválasztott kép."
                  defaultCategory="tours"
                  allowedTypes={['image']}
                  sourceContext="tour_gallery"
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
      </div>

      <div className="flex items-start justify-end">
        <Button type="button" variant="outline" size="icon" onClick={onDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function TourGallerySection({ form }: TourGallerySectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'gallery',
  });
  const watchedItems = useWatch({
    control: form.control,
    name: 'gallery',
  }) ?? [];
  const [draggingId, setDraggingId] = useState<string | null>(null);

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
      form.setValue(`gallery.${row.index}.sortOrder`, orderIndex + 1, {
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  };

  const appendItem = () => {
    const nextSortOrder = Math.max(0, ...rows.map((row) => row.sortOrder)) + 1;

    append({
      clientId: crypto.randomUUID(),
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
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="font-semibold">Galéria</h3>
        <p className="text-sm text-muted-foreground">
          Ajánlathoz kötött képek a publikus detail oldalra.
        </p>
      </div>

      <div className="space-y-3">
        <FormField
          control={form.control}
          name="galleryTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Galéria cím</FormLabel>
              <FormControl>
                <Input placeholder="Képek az utazás hangulatából" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gallerySubtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Galéria alcím</FormLabel>
              <FormControl>
                <Input placeholder="Tengerpart, városnézés és élmények egy helyen." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <GalleryCard
                form={form}
                row={row}
                isDragging={isDragging}
                onDelete={() => remove(row.index)}
              />
            </div>
          );
        })}
      </div>

      <Button type="button" variant="outline" onClick={appendItem}>
        <Plus className="size-4" />
        Galéria kép hozzáadása
      </Button>
    </section>
  );
}
