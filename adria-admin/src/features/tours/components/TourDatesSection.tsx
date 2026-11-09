import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { ArrowDownWideNarrow, Plus, Trash2 } from 'lucide-react';

import { ReorderControls } from '@/components/admin/reorder-controls';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createClientId } from '@/lib/client-id';
import { useDragReorder } from '@/lib/use-drag-reorder';
import { cn } from '@/lib/utils';

import { TOUR_DATE_STATUSES } from '../lib/tours.constants';
import type { Tour, TourFormValues } from '../lib/tours.types';
import { TourDateDeparturePlacesEditor } from './TourDateDeparturePlacesEditor';
import { TourDateExtrasEditor } from './TourDateExtrasEditor';
import { TourDatePartnerXmlFields } from './TourDatePartnerXmlFields';
import { TourStaySection } from './TourStaySection';

type TourDateFormValue = TourFormValues['dates'][number];

type TourDatesSectionProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
};

function emptyTourDate(): TourDateFormValue {
  return {
    id: createClientId(),
    startDate: '',
    endDate: '',
    price: '',
    displayedPrice: '',
    status: 'available',
    departurePlaceIds: [],
    accommodation: '',
    accommodationInfo: '',
    catering: '',
    cateringInfo: '',
    xmlEnabled: true,
    partnerXml: { cesysAccommodation: '', cesysRoom: '' },
    priceBox: {
      price: '',
      displayedPrice: '',
      discountBadge: '',
      originalPrice: '',
      label: '',
      minParticipants: '',
      maxParticipants: '',
      availableSeats: '',
      capacity: '',
    },
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

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <FormField
              control={form.control}
              name={`dates.${index}.startDate`}
              render={({ field: dateField }) => (
                <FormItem>
                  <FormLabel>Indulás</FormLabel>
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
                  <FormLabel>Érkezés</FormLabel>
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
                  <FormLabel>Ár</FormLabel>
                  <FormControl>
                    <Input placeholder="1200" {...dateField} />
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
                  <FormLabel>Státusz</FormLabel>
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
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => dates.remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 border-t pt-3">
            <FormField
              control={form.control}
              name={`dates.${index}.priceBox.price`}
              render={({ field: dateField }) => (
                <FormItem>
                  <FormLabel>Ár</FormLabel>
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
              name={`dates.${index}.priceBox.displayedPrice`}
              render={({ field: dateField }) => (
                <FormItem>
                  <FormLabel>Megjelenített ár</FormLabel>
                  <FormControl>
                    <Input placeholder="199 000 Ft-tól" {...dateField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${index}.priceBox.availableSeats`}
              render={({ field: dateField }) => (
                <FormItem>
                  <FormLabel>Szabad férőhely</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="12"
                      {...dateField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${index}.priceBox.capacity`}
              render={({ field: dateField }) => (
                <FormItem>
                  <FormLabel>Kapacitás</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="49"
                      {...dateField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${index}.priceBox.minParticipants`}
              render={({ field: dateField }) => (
                <FormItem>
                  <FormLabel>Minimum fő</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="1"
                      {...dateField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${index}.priceBox.maxParticipants`}
              render={({ field: dateField }) => (
                <FormItem>
                  <FormLabel>Maximum fő</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="49"
                      {...dateField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${index}.priceBox.discountBadge`}
              render={({ field: dateField }) => (
                <FormItem>
                  <FormLabel>Kedvezmény címke</FormLabel>
                  <FormControl>
                    <Input placeholder="-15%" {...dateField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${index}.priceBox.originalPrice`}
              render={({ field: dateField }) => (
                <FormItem>
                  <FormLabel>Eredeti ár (áthúzva)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="136600"
                      {...dateField}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Akciónál az akció előtti ár; csak az árnál nagyobb érték
                    látszik.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${index}.priceBox.label`}
              render={({ field: dateField }) => (
                <FormItem>
                  <FormLabel>Címke az ár mellett</FormLabel>
                  <FormControl>
                    <Input placeholder="Előfoglalási akció" {...dateField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <TourStaySection form={form} dateIndex={index} />

          <TourDatePartnerXmlFields form={form} dateIndex={index} />

          <TourDateDeparturePlacesEditor
            form={form}
            tour={tour}
            dateIndex={index}
          />

          <TourDateExtrasEditor
            form={form}
            dateIndex={index}
            dateCount={dates.fields.length}
          />
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => dates.append(emptyTourDate())}
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
