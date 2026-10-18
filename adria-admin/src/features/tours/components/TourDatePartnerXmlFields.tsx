import type { UseFormReturn } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { TourFormValues } from '../lib/tours.types';

type TourDatePartnerXmlFieldsProps = {
  form: UseFormReturn<TourFormValues>;
  dateIndex: number;
};

/**
 * A date's partner XML fields: whether the feeds list it, and the
 * accommodation and room the Cesys feed shows for it.
 */
export function TourDatePartnerXmlFields({ form, dateIndex }: TourDatePartnerXmlFieldsProps) {
  return (
    <div className="grid gap-4 rounded-xl border border-dashed p-4 md:grid-cols-3">
      <FormField
        control={form.control}
        name={`dates.${dateIndex}.xmlEnabled`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Partner XML</FormLabel>
            <label className="flex h-10 items-center gap-2 rounded-xl border bg-background px-3 text-sm">
              <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
              XML-ben szerepel
            </label>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`dates.${dateIndex}.partnerXml.cesysAccommodation`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Szállás – Cesys</FormLabel>
            <FormControl>
              <Input placeholder="Hotel***" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`dates.${dateIndex}.partnerXml.cesysRoom`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Szobatípus – Cesys</FormLabel>
            <FormControl>
              <Input placeholder="2 ágyas szoba" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
