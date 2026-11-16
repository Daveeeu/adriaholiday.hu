import { useWatch, type UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { TourDate, TourFormValues } from '../lib/tours.types';

type TourDateCapacityFieldProps = {
  form: UseFormReturn<TourFormValues>;
  index: number;
  /** The tour's dates as saved, with the seats their bookings hold. */
  storedDates?: TourDate[];
};

/**
 * The most passengers a date takes, with the passengers already booked on it
 * and the seats the typed limit leaves free: the free seats the trip page
 * shows are worked out from these, never typed in.
 */
export function TourDateCapacityField({ form, index, storedDates }: TourDateCapacityFieldProps) {
  const [dateId, capacity] = useWatch({
    control: form.control,
    name: [`dates.${index}.id`, `dates.${index}.capacity`],
  });
  const seatsHeld = storedDates?.find((date) => String(date.id) === String(dateId))?.seatsHeld ?? 0;

  return (
    <FormField
      control={form.control}
      name={`dates.${index}.capacity`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Maximum létszám</FormLabel>
          <FormControl>
            <Input type="number" min={seatsHeld} step={1} placeholder="49" {...field} />
          </FormControl>
          <FormDescription>{seatsSummary(capacity, seatsHeld)}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function seatsSummary(capacity: string, seatsHeld: number): string {
  const booked = `Foglalt: ${seatsHeld} fő`;

  if (capacity.trim() === '') {
    return `${booked} · nincs létszámkorlát`;
  }

  return `${booked} · szabad: ${Math.max(0, Number(capacity) - seatsHeld)} hely`;
}
