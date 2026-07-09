import { useQuery } from '@tanstack/react-query';

import { Skeleton } from '@/components/ui/skeleton';

import { getTourBookingAnalytics } from '../../lib/bookings.api';
import { formatDateTime } from '../../lib/bookings.utils';
import type { TourBookingDetail } from '../../lib/bookings.types';
import { FormSection } from '../form-section';
import { DetailField } from './detail-field';

export function BookingAnalyticsCard({ booking }: { booking: TourBookingDetail }) {
  const analyticsQuery = useQuery({
    queryKey: ['bookings', 'tour-bookings', 'analytics', booking.id],
    queryFn: () => getTourBookingAnalytics(booking.id),
  });

  return (
    <FormSection title="Analytics" description="A foglaláshoz kapcsolódó mérési események.">
      {analyticsQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
        </div>
      ) : !analyticsQuery.data || analyticsQuery.data.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">Nincs analytics esemény.</p>
      ) : (
        <div className="space-y-3">
          {analyticsQuery.data.map((event) => (
            <div key={event.id} className="rounded-xl border bg-background p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{event.eventName}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</span>
              </div>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <DetailField label="Event ID" value={event.eventId} />
                <DetailField label="UTM Source" value={event.utmSource} />
                <DetailField label="UTM Medium" value={event.utmMedium} />
                <DetailField label="UTM Campaign" value={event.utmCampaign} />
                <DetailField label="Referrer" value={event.referrer} className="md:col-span-2" />
              </div>
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}
