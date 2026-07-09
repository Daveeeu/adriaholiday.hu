import type { TourBookingDetail } from '../../lib/bookings.types';
import { formatDate } from '../../lib/bookings.utils';
import { FormSection } from '../form-section';
import { DetailField } from './detail-field';

export function BookingTourCard({ booking }: { booking: TourBookingDetail }) {
  const tour = booking.tour;

  return (
    <FormSection title="Utazás" description="A foglaláshoz tartozó ajánlat és időpont adatai.">
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <DetailField label="Tour neve" value={tour?.name ?? booking.offerName} />
        <DetailField label="SEO URL" value={tour?.seoName ? `/ajanlat/${tour.seoName}` : null} />
        <DetailField
          label="Kategória"
          value={tour?.categories?.length ? tour.categories.map((category) => category.label).join(', ') : null}
        />
        <DetailField label="Régió" value={tour?.regionLabel} />
        <DetailField label="Ország" value={booking.tourCountry} />
        <DetailField label="Buszos / Repülős" value={booking.tourTransportLabel} />
        <DetailField label="Partner" value={booking.partnerName} />
        <DetailField label="Ár" value={tour?.displayedPrice ?? (tour?.price ? `${tour.price} Ft` : null)} />
        <DetailField label="Foglalt időpont" value={booking.tourDate ? formatDate(booking.tourDate.startDate) : null} />
        <DetailField label="Indulás dátuma" value={formatDate(booking.tourDate?.startDate ?? booking.departureDate)} />
        <DetailField label="Érkezés dátuma" value={formatDate(booking.tourDate?.endDate ?? null)} />
        <DetailField
          label="Szabad helyek"
          value={booking.tourDate?.availableSeats !== null && booking.tourDate?.availableSeats !== undefined
            ? `${booking.tourDate.availableSeats} fő`
            : null}
        />
        <DetailField
          label="Maximum létszám"
          value={booking.tourDate?.maxParticipants ? `${booking.tourDate.maxParticipants} fő` : null}
        />
      </div>
    </FormSection>
  );
}
