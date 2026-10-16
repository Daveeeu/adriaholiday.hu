import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Location, Region } from '@/types/domain';

import type { ApartmentFormValues } from '../lib/apartments.types';

type ApartmentLocationSectionProps = {
  form: UseFormReturn<ApartmentFormValues>;
  regions: Region[];
  locations: Location[];
};

export function ApartmentLocationSection({
  form,
  regions,
  locations,
}: ApartmentLocationSectionProps) {
  const regionId = form.watch('regionId');

  const availableLocations = locations.filter(
    (location) => location.regionId === regionId,
  );

  useEffect(() => {
    const currentLocationId = form.getValues('locationId');

    if (
      availableLocations.length > 0 &&
      !availableLocations.some((location) => location.id === currentLocationId)
    ) {
      const nextLocationId = availableLocations[0].id;
      form.setValue('locationId', nextLocationId, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue('place_id', nextLocationId, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [availableLocations, form]);

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="text-base font-semibold">Elhelyezkedés</h3>
        <p className="text-sm text-muted-foreground">
          Régió, hely, cím és koordináta adatok.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="regionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Régió</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  value={field.value}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    field.onChange(nextValue);
                    form.setValue('region_id', nextValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                >
                  <option value="">-- Válasszon --</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hely</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  value={field.value}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    field.onChange(nextValue);
                    form.setValue('place_id', nextValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                >
                  <option value="">-- Válasszon --</option>
                  {availableLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Cím</FormLabel>
              <FormControl>
                <Input placeholder="Ulica Grisia 12, Rovinj" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mapAddress"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Térkép cím</FormLabel>
              <FormControl>
                <Input
                  placeholder="Bellavista Rovinj Suite, Rovinj"
                  value={field.value}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    field.onChange(nextValue);
                    form.setValue('map_address', nextValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coordinates"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Koordináták</FormLabel>
              <FormControl>
                <Input
                  placeholder="46.12345, 18.12345"
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
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Szélesség</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.0001"
                  value={field.value}
                  onChange={(event) => {
                    const nextLatitude = Number(event.target.value);
                    field.onChange(nextLatitude);
                    form.setValue(
                      'coordinates',
                      `${String(nextLatitude)}, ${String(form.getValues('longitude'))}`,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hosszúság</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.0001"
                  value={field.value}
                  onChange={(event) => {
                    const nextLongitude = Number(event.target.value);
                    field.onChange(nextLongitude);
                    form.setValue(
                      'coordinates',
                      `${String(form.getValues('latitude'))}, ${String(nextLongitude)}`,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
