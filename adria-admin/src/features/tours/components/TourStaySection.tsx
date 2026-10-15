import { useWatch, type FieldPath, type UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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

type StayField = (typeof FIELDS)[number]['name' | 'infoName'];

const STAY_FIELDS: StayField[] = [
  'accommodation',
  'accommodationInfo',
  'catering',
  'cateringInfo',
];

type TourStaySectionProps = {
  form: UseFormReturn<TourFormValues>;
  /** One date's own stay instead of the tour's; left empty, the date shows the tour's. */
  dateIndex?: number;
};

/** The accommodation and meals shown on the trip page, each with the note behind its info icon. */
export function TourStaySection({ form, dateIndex }: TourStaySectionProps) {
  const tourStay = useWatch({ control: form.control, name: STAY_FIELDS });
  const forDate = dateIndex !== undefined;
  const fieldName = (name: StayField) =>
    (forDate
      ? `dates.${dateIndex}.${name}`
      : name) as FieldPath<TourFormValues>;
  // A date's empty field shows what the tour's says instead.
  const tourValue = (name: StayField) =>
    tourStay[STAY_FIELDS.indexOf(name)] || '';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {FIELDS.map((item) => (
        <div key={item.name} className="space-y-3">
          <FormField
            control={form.control}
            name={fieldName(item.name)}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {forDate ? `${item.label} ennél az időpontnál` : item.label}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      forDate
                        ? tourValue(item.name) || item.placeholder
                        : item.placeholder
                    }
                    {...field}
                    value={typeof field.value === 'string' ? field.value : ''}
                  />
                </FormControl>
                {forDate ? (
                  <FormDescription>
                    Üresen az utazás szállása, ellátása érvényes.
                  </FormDescription>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={fieldName(item.infoName)}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.label} – információ</FormLabel>
                <FormControl>
                  <Textarea
                    rows={forDate ? 2 : 3}
                    placeholder={
                      forDate
                        ? tourValue(item.infoName) || item.infoPlaceholder
                        : item.infoPlaceholder
                    }
                    {...field}
                    value={typeof field.value === 'string' ? field.value : ''}
                  />
                </FormControl>
                {forDate ? null : (
                  <FormDescription>
                    Az utazás oldalán az ⓘ ikonra kattintva jelenik meg.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
}
