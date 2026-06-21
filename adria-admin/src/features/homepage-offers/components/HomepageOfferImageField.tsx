import type { UseFormReturn } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { HomepageOfferFormValues } from '../lib/homepage-offers.types';

type HomepageOfferImageFieldProps = {
  form: UseFormReturn<HomepageOfferFormValues>;
};

export function HomepageOfferImageField({ form }: HomepageOfferImageFieldProps) {
  const image = form.watch('image');

  return (
    <div className="space-y-4 rounded-2xl border bg-muted/20 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-background">
          {image ? (
            <img
              src={image}
              alt={form.watch('imageTitle') || 'Ajánlat kép'}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-muted-foreground">Nincs kép</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Az ajánlat főoldali képe és a hozzá tartozó képcím.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Kép</FormLabel>
              <FormControl>
                <Input
                  placeholder="/uploads/homepage-offers/korutazasok.jpg"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
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
            <FormItem className="md:col-span-2">
              <FormLabel>Kép címe</FormLabel>
              <FormControl>
                <Input placeholder="Körutazások" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
