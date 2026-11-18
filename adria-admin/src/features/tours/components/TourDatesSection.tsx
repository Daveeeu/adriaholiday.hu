import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { ArrowDownWideNarrow, Plus, Trash2 } from 'lucide-react';

import { ReorderControls } from '@/components/admin/reorder-controls';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createClientId } from '@/lib/client-id';
import { useDragReorder } from '@/lib/use-drag-reorder';
import { cn } from '@/lib/utils';

import { defaultTourDateCapacity } from '../lib/tour-date-capacity';
import { TOUR_DATE_STATUSES } from '../lib/tours.constants';
import type { Tour, TourFormValues } from '../lib/tours.types';
import { TourDateCapacityField } from './TourDateCapacityField';
import { TourDateDetails } from './TourDateDetails';
import { TourFormLabel } from './TourFieldHelp';

type TourDateFormValue = TourFormValues['dates'][number];

type TourDatesSectionProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
};

function emptyTourDate(travelModeId: string): TourDateFormValue {
  return {
    id: createClientId(),
    startDate: '',
    endDate: '',
    price: '',
    status: 'available',
    departurePlaceIds: [],
    accommodation: '',
    accommodationInfo: '',
    catering: '',
    cateringInfo: '',
    xmlEnabled: true,
    partnerXml: { cesysAccommodation: '', cesysRoom: '' },
    priceBox: {
      discountBadge: '',
      originalPrice: '',
      label: '',
    },
    capacity: defaultTourDateCapacity(travelModeId).toString(),
    extras: [],
  };
}

/** Dates in chronological order; dates without a start date keep their place at the end. */
function byStartDate(dates: TourDateFormValue[]): TourDateFormValue[] {
  return [...dates].sort((a, b) => {
    if (!a.startDate || !b.startDate) {
      return Number(!a.startDate) - Number(!b.startDate);
    }

    return a.startDate.localeCompare(b.startDate);
  });
}

/**
 * The tour's dates with their prices, stay, departure places and extras, in
 * the order the trip page and its date picker show them: reordered by
 * dragging, with the up and down buttons, or sorted by start date at once.
 */
export function TourDatesSection({ form, tour }: TourDatesSectionProps) {
  const dates = useFieldArray({
    control: form.control,
    name: 'dates',
  });

  const move = (key: string, toPosition: number) => {
    const fromPosition = dates.fields.findIndex((field) => field.id === key);

    if (
      fromPosition < 0 ||
      toPosition < 0 ||
      toPosition >= dates.fields.length ||
      fromPosition === toPosition
    ) {
      return;
    }

    dates.move(fromPosition, toPosition);
  };

  const { draggingKey, handleProps, itemProps } = useDragReorder(move);

  return (
    <div className="space-y-3">
      {dates.fields.map((field, index) => (
        <div
          key={field.id}
          {...itemProps(field.id, index)}
          className={cn(
            'space-y-3 rounded-xl border bg-background p-3',
            draggingKey === field.id && 'opacity-60',
          )}
        >
          <ReorderControls
            position={index}
            count={dates.fields.length}
            itemLabel="időpont"
            onMove={(toPosition) => move(field.id, toPosition)}
            dragHandleProps={handleProps(field.id)}
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
            <FormField
              control={form.control}
              name={`dates.${index}.startDate`}
              render={({ field: dateField }) => (
                <FormItem>
                  <TourFormLabel>Indulás</TourFormLabel>
                  <FormControl>
                    <Input type="date" {...dateField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${index}.endDate`}
              render={({ field: dateField }) => (
                <FormItem>
                  <TourFormLabel>Érkezés</TourFormLabel>
                  <FormControl>
                    <Input type="date" {...dateField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${index}.price`}
              render={({ field: dateField }) => (
                <FormItem>
                  <TourFormLabel>Ár</TourFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="199000"
                      {...dateField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${index}.status`}
              render={({ field: dateField }) => (
                <FormItem>
                  <TourFormLabel>Státusz</TourFormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      {...dateField}
                    >
                      {TOUR_DATE_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TourDateCapacityField
              form={form}
              index={index}
              storedDates={tour?.dates}
            />
            <div className="flex items-end">
              <Button
                title="Törlés"
                aria-label="Törlés"
                type="button"
                variant="outline"
                size="icon"
                onClick={() => dates.remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <TourDateDetails
            form={form}
            tour={tour}
            dateIndex={index}
            dateCount={dates.fields.length}
          />
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            dates.append(emptyTourDate(form.getValues('travelModeId')))
          }
        >
          <Plus className="size-4" />
          Időpont hozzáadása
        </Button>

        {dates.fields.length > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => dates.replace(byStartDate(form.getValues('dates')))}
          >
            <ArrowDownWideNarrow className="size-4" />
            Rendezés dátum szerint
          </Button>
        ) : null}
      </div>
    </div>
  );
}
