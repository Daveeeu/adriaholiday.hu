import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MediaPicker } from '@/components/media/media-picker';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import type { HomepageOfferFormValues } from '../lib/homepage-offers.types';

type HomepageOfferImageFieldProps = {
  form: UseFormReturn<HomepageOfferFormValues>;
};

export function HomepageOfferImageField({ form }: HomepageOfferImageFieldProps) {
  const imageTitle = useWatch({
    control: form.control,
    name: 'imageTitle',
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <MediaPicker
                label="Kép"
                value={field.value || null}
                onChange={(value) => field.onChange(value ?? '')}
                description="Kép feltöltése vagy kiválasztása a médiatárból."
                defaultCategory="homepage_offers"
                sourceContext="homepage_offer"
                uploadAlt={imageTitle || undefined}
                uploadTitle={imageTitle || undefined}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="imageTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kép címe</FormLabel>
            <FormControl>
              <input
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                placeholder="Körutazások"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
