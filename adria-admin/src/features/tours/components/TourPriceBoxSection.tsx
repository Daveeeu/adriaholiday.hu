import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { TourFormValues } from '../lib/tours.types';
import { TourFormLabel } from './TourFieldHelp';

type PriceBoxField = keyof TourFormValues['priceBox'];

const PRICE_BOX_FIELDS: Array<{
  name: PriceBoxField;
  label: string;
  placeholder: string;
  type?: 'number';
}> = [
  { name: 'price', label: 'Alapár', placeholder: '199000', type: 'number' },
  { name: 'currency', label: 'Pénznem', placeholder: 'HUF' },
  { name: 'priceSuffix', label: 'Ár utótag', placeholder: '/ fő' },
  { name: 'discountBadge', label: 'Kedvezmény címke', placeholder: '-15%' },
  {
    name: 'discountText',
    label: 'Ár alatti szöveg',
    placeholder: 'Előfoglalási kedvezmény',
  },
];

/** The price the offer card and the trip page show, with its texts. */
export function TourPriceBoxSection({
  form,
}: {
  form: UseFormReturn<TourFormValues>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {PRICE_BOX_FIELDS.map((priceBoxField) => (
        <FormField
          key={priceBoxField.name}
          control={form.control}
          name={`priceBox.${priceBoxField.name}`}
          render={({ field }) => (
            <FormItem>
              <TourFormLabel>{priceBoxField.label}</TourFormLabel>
              <FormControl>
                <Input
                  type={priceBoxField.type}
                  min={priceBoxField.type === 'number' ? 0 : undefined}
                  placeholder={priceBoxField.placeholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
