import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { GalleryItemsFormValues } from '@/components/media/gallery-items';
import { GalleryItemsEditor } from '@/components/media/gallery-items-editor';

import type { TourFormValues } from '../lib/tours.types';
import { TourFieldHelp, TourFormLabel } from './TourFieldHelp';

type TourGallerySectionProps = {
  form: UseFormReturn<TourFormValues>;
};

export function TourGallerySection({ form }: TourGallerySectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold">Galéria</h3>
          <TourFieldHelp name="gallery" />
        </div>
        <p className="text-sm text-muted-foreground">
          Az út képei a publikus oldalon ebben a sorrendben jelennek meg; az
          első aktív kép a borítókép. A sorrendet a fogantyúval húzva vagy a
          fel–le nyilakkal állíthatod.
        </p>
      </div>

      <div className="space-y-3">
        <FormField
          control={form.control}
          name="galleryTitle"
          render={({ field }) => (
            <FormItem>
              <TourFormLabel>Galéria cím</TourFormLabel>
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
              <TourFormLabel>Galéria alcím</TourFormLabel>
              <FormControl>
                <Input
                  placeholder="Tengerpart, városnézés és élmények egy helyen."
                  {...field}
                />
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
