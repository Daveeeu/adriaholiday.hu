import type { TourBookingDetail } from '../../lib/bookings.types';
import { FormSection } from '../form-section';
import { DetailField } from './detail-field';

export function BookingContactCard({ booking }: { booking: TourBookingDetail }) {
  return (
    <FormSection title="Kapcsolattartó" description="A foglalást leadó személy elérhetőségei.">
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <DetailField label="Teljes név" value={booking.partnerName} />
        <DetailField label="Email" value={booking.partnerEmail} />
        <DetailField label="Telefon" value={booking.partnerPhone} />
        <DetailField label="Város" value={booking.partnerCity} />
        <DetailField label="Ország" value={booking.partnerCountry} />
        <DetailField label="Cím" value={booking.partnerAddress} className="md:col-span-2" />
        <DetailField label="Irányítószám" value={null} />
      </div>
    </FormSection>
  );
}
