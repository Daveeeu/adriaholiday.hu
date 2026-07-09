import type { TourBookingDetail } from '../../lib/bookings.types';
import { FormSection } from '../form-section';
import { DetailField } from './detail-field';

export function BookingDynamicFieldsCard({ booking }: { booking: TourBookingDetail }) {
  const fields = booking.formDataFields ?? [];

  if (fields.length === 0) {
    return null;
  }

  return (
    <FormSection title="Foglalási űrlap adatai" description="A publikus űrlapon dinamikusan bekért mezők a sablon szerint.">
      <div className="grid gap-3 text-sm md:grid-cols-2">
        {fields.map((field) => (
          <DetailField key={field.key} label={field.label} value={field.value} />
        ))}
      </div>
    </FormSection>
  );
}
