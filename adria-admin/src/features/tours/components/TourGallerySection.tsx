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
    <div className="space-y-5">
      <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
        <span>
          A képek ebben a sorrendben jelennek meg az utazás oldalán; az első
          aktív kép a borítókép. A sorrendet a fogantyúval húzva vagy a fel–le
          nyilakkal állíthatod.
        </span>
        <TourFieldHelp name="gallery" />
      </p>

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
    </div>
  );
}
