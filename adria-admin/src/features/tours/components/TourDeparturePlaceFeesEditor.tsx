import { useQuery } from '@tanstack/react-query';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { getDeparturePlaceOptions } from '../lib/tour-select-options.api';
import type { Tour, TourFormValues } from '../lib/tours.types';

type TourDeparturePlaceFeesEditorProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
};

/**
 * Per-tour surcharge of the selected departure places (e.g. "Budapest BOK
 * csarnok" +4 700 Ft/fő on one tour only). Left empty, the place's general
 * fee applies.
 */
export function TourDeparturePlaceFeesEditor({
  form,
  tour,
}: TourDeparturePlaceFeesEditorProps) {
  const selectedIds =
    useWatch({ control: form.control, name: 'departurePlaceIds' }) ?? [];
  const { data: options = [] } = useQuery({
    queryKey: ['tour-select-options', 'departure-places'],
    queryFn: () => getDeparturePlaceOptions(),
  });

  if (selectedIds.length === 0) {
    return null;
  }

  const labelOf = (id: string) =>
    options.find((option) => option.value === id)?.label ??
    tour?.departurePlaces?.find((place) => String(place.id) === id)?.name ??
    id;
  const generalFeeOf = (id: string) =>
    tour?.departurePlaces?.find((place) => String(place.id) === id)?.fee;

  return (
    <div className="space-y-3 rounded-xl border bg-background p-3">
      <div>
        <h4 className="text-sm font-semibold">
          Felszállási helyek felára ennél az útnál
        </h4>
        <p className="text-xs text-muted-foreground">
          Ft/fő. Üresen hagyva a felszállási hely általános díja érvényes.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {selectedIds.map((id) => {
          const generalFee = generalFeeOf(id);

          return (
            <FormField
              key={id}
              control={form.control}
              name={`departurePlaceFees.${id}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labelOf(id)}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder={
                        generalFee ? `Általános: ${generalFee} Ft` : '0'
                      }
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
