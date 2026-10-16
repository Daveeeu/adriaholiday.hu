import type { UseFormReturn } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { GalleryItemsFormValues } from '@/components/media/gallery-items';
import { GalleryItemsEditor } from '@/components/media/gallery-items-editor';

import type { TourFormValues } from '../lib/tours.types';

type TourGallerySectionProps = {
  form: UseFormReturn<TourFormValues>;
};

export function TourGallerySection({ form }: TourGallerySectionProps) {
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

      <GalleryItemsEditor
        form={form as unknown as UseFormReturn<GalleryItemsFormValues>}
        defaultCategory="tours"
        sourceContext="tour_gallery"
      />
    </section>
  );
}
