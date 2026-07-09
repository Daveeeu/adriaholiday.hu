import { AccordionItem } from '@/components/ui/accordion';

import type { TourBookingDetail } from '../../lib/bookings.types';

export function BookingRawDataAccordion({ booking }: { booking: TourBookingDetail }) {
  if (!booking.payload || Object.keys(booking.payload).length === 0) {
    return null;
  }

  return (
    <AccordionItem title="Nyers adatok">
      <pre className="max-h-96 overflow-auto rounded-lg bg-muted/40 p-3 text-xs">
        {JSON.stringify(booking.payload, null, 2)}
      </pre>
    </AccordionItem>
  );
}
