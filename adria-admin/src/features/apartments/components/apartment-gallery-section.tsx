import type { UseFormReturn } from 'react-hook-form';

import type { GalleryItemsFormValues } from '@/components/media/gallery-items';
import { GalleryItemsEditor } from '@/components/media/gallery-items-editor';

import type { ApartmentFormValues } from '../lib/apartments.types';

type ApartmentGallerySectionProps = {
  form: UseFormReturn<ApartmentFormValues>;
};

export function ApartmentGallerySection({ form }: ApartmentGallerySectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="text-base font-semibold">Képek</h3>
        <p className="text-sm text-muted-foreground">
          Az apartman oldalán és listakártyáján látható képek. Az első kép a borítókép.
        </p>
      </div>

      <GalleryItemsEditor
        form={form as unknown as UseFormReturn<GalleryItemsFormValues>}
        defaultCategory="apartments"
        sourceContext="apartment_gallery"
        showCaption={false}
        addLabel="Kép hozzáadása"
      />
    </section>
  );
}
