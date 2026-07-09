import type { TourBookingDetail } from '../lib/bookings.types';
import { BookingAdminNoteCard } from './booking-detail/booking-admin-note-card';
import { BookingAnalyticsCard } from './booking-detail/booking-analytics-card';
import { BookingContactCard } from './booking-detail/booking-contact-card';
import { BookingDynamicFieldsCard } from './booking-detail/booking-dynamic-fields-card';
import { BookingEmailHistoryCard } from './booking-detail/booking-email-history-card';
import { BookingExportActions } from './booking-detail/booking-export-actions';
import { BookingPassengersCard } from './booking-detail/booking-passengers-card';
import { BookingRawDataAccordion } from './booking-detail/booking-raw-data-accordion';
import { BookingStatusCard } from './booking-detail/booking-status-card';
import { BookingSummaryCard } from './booking-detail/booking-summary-card';
import { BookingTimeline } from './booking-detail/booking-timeline';
import { BookingTourCard } from './booking-detail/booking-tour-card';

export function TourBookingDetailPanel({ booking }: { booking: TourBookingDetail }) {
  return (
    <div className="space-y-4">
      <BookingExportActions booking={booking} />

      <div className="grid items-start gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <BookingSummaryCard booking={booking} />
          <BookingTourCard booking={booking} />
          <BookingContactCard booking={booking} />
          <BookingPassengersCard booking={booking} />
          <BookingDynamicFieldsCard booking={booking} />
          <BookingRawDataAccordion booking={booking} />
        </div>

        <div className="space-y-4">
          <BookingStatusCard booking={booking} />
          <BookingAdminNoteCard booking={booking} />
          <BookingTimeline booking={booking} />
          <BookingEmailHistoryCard booking={booking} />
          <BookingAnalyticsCard booking={booking} />
        </div>
      </div>
    </div>
  );
}
