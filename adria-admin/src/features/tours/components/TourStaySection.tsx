import type { UseFormReturn } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type { TourFormValues } from '../lib/tours.types';

const FIELDS = [
  {
    name: 'accommodation',
    infoName: 'accommodationInfo',
    label: 'Szállás',
    placeholder: 'Hotel***',
    infoPlaceholder: '2 ágyas szoba',
  },
  {
    name: 'catering',
    infoName: 'cateringInfo',
    label: 'Ellátás',
    placeholder: 'reggeli',
    infoPlaceholder: 'Vacsora igényelhető: 38.900 Ft/fő',
  },
] as const;

/** The accommodation and meals shown on the trip page, each with the note behind its info icon. */
export function TourStaySection({ form }: { form: UseFormReturn<TourFormValues> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {FIELDS.map((item) => (
        <div key={item.name} className="space-y-3">
          <FormField
            control={form.control}
            name={item.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.label}</FormLabel>
                <FormControl>
                  <Input placeholder={item.placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={item.infoName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.label} – információ</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder={item.infoPlaceholder} {...field} />
                </FormControl>
                <FormDescription>Az utazás oldalán az ⓘ ikonra kattintva jelenik meg.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
}
