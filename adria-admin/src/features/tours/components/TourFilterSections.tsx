import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { TourFormValues } from '../lib/tours.types';

type TourFilterSectionsProps = {
  form: UseFormReturn<TourFormValues>;
};

function CommaListField({
  form,
  name,
  label,
  placeholder,
}: {
  form: UseFormReturn<TourFormValues>;
  name:
    | 'departurePlaceIds'
    | 'countryIds'
    | 'tagIds'
    | 'categoryIds';
  label: string;
  placeholder?: string;
}) {
  const value = form.watch(name);

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              value={value.join(', ')}
              placeholder={placeholder ?? 'értékek vesszővel elválasztva'}
              onChange={(event) =>
                form.setValue(
                  name,
                  event.target.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TourFilterSections({ form }: TourFilterSectionsProps) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="font-semibold">Szűrők / kapcsolatok</h3>
        <p className="text-sm text-muted-foreground">
          Kapcsolódó régiók, csoportok, címkék és program besorolások.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="regionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Régiók</FormLabel>
              <FormControl>
                <Input placeholder="region-id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Csoportok</FormLabel>
              <FormControl>
                <Input placeholder="group-id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seasonalGroupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ajánlat csoportok</FormLabel>
              <FormControl>
                <Input placeholder="seasonal-group-id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>FIT</FormLabel>
              <FormControl>
                <Input placeholder="fit-id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="programTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program típus</FormLabel>
              <FormControl>
                <Input placeholder="program-type-id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="travelModeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Közlekedés</FormLabel>
              <FormControl>
                <Input placeholder="travel-mode-id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="difficultyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nehézségi szint</FormLabel>
              <FormControl>
                <Input placeholder="difficulty-id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CommaListField
          form={form}
          name="departurePlaceIds"
          label="Felszállási helyek"
        />
        <CommaListField form={form} name="countryIds" label="Országok" />
        <CommaListField form={form} name="tagIds" label="Címkék" />
        <CommaListField form={form} name="categoryIds" label="Kategóriák" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                Kiemelt?
              </label>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="recommended"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                Kiemelés a pozitív kiemelt ajánlatok között
              </label>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="partnerOffer"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                Kiemelés csempéző ajánlat
              </label>
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
