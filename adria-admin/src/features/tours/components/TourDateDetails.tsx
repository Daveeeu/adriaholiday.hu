import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useFormState, useWatch, type UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { Tour, TourFormValues } from '../lib/tours.types';
import { TourDateDeparturePlacesEditor } from './TourDateDeparturePlacesEditor';
import { TourDateExtrasEditor } from './TourDateExtrasEditor';
import { TourDatePartnerXmlFields } from './TourDatePartnerXmlFields';
import { TourFormLabel } from './TourFieldHelp';
import { TourStaySection } from './TourStaySection';

type TourDateDetailsProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
  dateIndex: number;
  dateCount: number;
};

/** What a date sets beyond its dates, price and seats, as a short list ("akció, 2 felár"). */
function filledParts(
  date: TourFormValues['dates'][number] | undefined,
): string[] {
  if (!date) {
    return [];
  }

  const parts: string[] = [];

  if (
    date.priceBox.discountBadge ||
    date.priceBox.originalPrice ||
    date.priceBox.label
  ) {
    parts.push('akció');
  }

  if (
    date.accommodation ||
    date.accommodationInfo ||
    date.catering ||
    date.cateringInfo
  ) {
    parts.push('saját szállás/ellátás');
  }

  if (date.departurePlaceIds.length > 0) {
    parts.push(`${date.departurePlaceIds.length} felszállási hely`);
  }

  if (date.extras.length > 0) {
    parts.push(`${date.extras.length} felár`);
  }

  if (
    !date.xmlEnabled ||
    date.partnerXml.cesysAccommodation ||
    date.partnerXml.cesysRoom
  ) {
    parts.push('partnerportál');
  }

  return parts;
}

/**
 * A date's less frequent settings — promotion, own stay, departure places,
 * extras, partner portals — folded away; open when any of them is set or
 * has an error.
 */
export function TourDateDetails({
  form,
  tour,
  dateIndex,
  dateCount,
}: TourDateDetailsProps) {
  const date = useWatch({ control: form.control, name: `dates.${dateIndex}` });
  const { errors } = useFormState({
    control: form.control,
    name: `dates.${dateIndex}`,
  });
  const parts = filledParts(date);
  const [open, setOpen] = useState(parts.length > 0);
  const hasError = Boolean(errors.dates?.[dateIndex]);
  const isOpen = open || hasError;

  return (
    <div className="border-t pt-3">
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 text-left text-sm font-medium text-foreground/80 hover:text-foreground"
      >
        <ChevronRight
          className={cn('size-4 transition-transform', isOpen && 'rotate-90')}
        />
        További beállítások
        <span className="font-normal text-muted-foreground">
          {parts.length > 0
            ? `(${parts.join(', ')})`
            : '(akció, szállás, felszállás, felárak, partnerportálok)'}
        </span>
      </button>

      {isOpen ? (
        <div className="mt-4 space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <FormField
              control={form.control}
              name={`dates.${dateIndex}.priceBox.originalPrice`}
              render={({ field }) => (
                <FormItem>
                  <TourFormLabel>Eredeti ár (áthúzva)</TourFormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Akció előtti ár"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${dateIndex}.priceBox.label`}
              render={({ field }) => (
                <FormItem>
                  <TourFormLabel>Címke az ár mellett</TourFormLabel>
                  <FormControl>
                    <Input placeholder="Előfoglalási akció" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dates.${dateIndex}.priceBox.discountBadge`}
              render={({ field }) => (
                <FormItem>
                  <TourFormLabel>Kedvezmény címke</TourFormLabel>
                  <FormControl>
                    <Input placeholder="-15%" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <TourStaySection form={form} dateIndex={dateIndex} />
          <TourDateDeparturePlacesEditor
            form={form}
            tour={tour}
            dateIndex={dateIndex}
          />
          <TourDateExtrasEditor
            form={form}
            dateIndex={dateIndex}
            dateCount={dateCount}
          />
          <TourDatePartnerXmlFields form={form} dateIndex={dateIndex} />
        </div>
      ) : null}
    </div>
  );
}
