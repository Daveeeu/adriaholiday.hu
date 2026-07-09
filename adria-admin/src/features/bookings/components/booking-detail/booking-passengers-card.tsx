import { AccordionItem } from '@/components/ui/accordion';

import type { TourBookingDetail } from '../../lib/bookings.types';
import { FormSection } from '../form-section';
import { DetailField } from './detail-field';

function passengerTitle(passenger: TourBookingDetail['passengerFields'][number], index: number) {
  const nameField = passenger.find((field) => field.key === 'passenger_name');
  return nameField?.value ? `${index + 1}. utas — ${nameField.value}` : `${index + 1}. utas`;
}

function PassengerFields({ passenger }: { passenger: TourBookingDetail['passengerFields'][number] }) {
  return (
    <div className="grid gap-2 text-sm md:grid-cols-2">
      {passenger.map((field) => (
        <DetailField key={field.key} label={field.label} value={field.value} />
      ))}
    </div>
  );
}

export function BookingPassengersCard({ booking }: { booking: TourBookingDetail }) {
  const passengers = booking.passengerFields ?? [];

  return (
    <FormSection title="Utasok" description="A foglaláshoz megadott utasok részletei.">
      {passengers.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">Nincs rögzített utas adat.</p>
      ) : passengers.length === 1 ? (
        <PassengerFields passenger={passengers[0]} />
      ) : (
        <div className="space-y-2">
          {passengers.map((passenger, index) => (
            <AccordionItem key={index} title={passengerTitle(passenger, index)} defaultOpen={index === 0}>
              <PassengerFields passenger={passenger} />
            </AccordionItem>
          ))}
        </div>
      )}
    </FormSection>
  );
}
