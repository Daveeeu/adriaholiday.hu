import { getTourBookingStatusLabel } from '../../lib/bookings.constants';
import { formatDateTime } from '../../lib/bookings.utils';
import type { TourBookingDetail } from '../../lib/bookings.types';
import { FormSection } from '../form-section';
import { StatusBadge } from '../status-badge';
import { DetailField } from './detail-field';
import { statusTone } from './status-tone';

export function BookingSummaryCard({ booking }: { booking: TourBookingDetail }) {
  return (
    <FormSection title="Foglalás információ" description="Alapadatok és a foglalás forrása.">
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <DetailField label="Foglalásszám" value={`#${booking.id}`} />
        <DetailField label="Foglalás típusa" value="Körutazás foglalás" />
        <DetailField label="Kuponkód" value={booking.couponCode || null} />
        <DetailField
          label="Aktuális státusz"
          value={<StatusBadge label={getTourBookingStatusLabel(booking.status)} tone={statusTone(booking.status)} />}
        />
        <DetailField label="Létrehozás dátuma" value={formatDateTime(booking.createdAt)} />
        <DetailField label="Utolsó módosítás" value={formatDateTime(booking.updatedAt)} />
      </div>
    </FormSection>
  );
}
