import { useQuery } from '@tanstack/react-query';

import { AccordionItem } from '@/components/ui/accordion';

import { getTourBookingAnalytics } from '../../lib/bookings.api';
import { getTourBookingStatusLabel } from '../../lib/bookings.constants';
import { formatDateTime } from '../../lib/bookings.utils';
import type { TourBookingDetail } from '../../lib/bookings.types';
import { FormSection } from '../form-section';
import { StatusBadge } from '../status-badge';
import { DetailField } from './detail-field';
import { statusTone } from './status-tone';

export function BookingSummaryCard({ booking }: { booking: TourBookingDetail }) {
  const analyticsQuery = useQuery({
    queryKey: ['bookings', 'tour-bookings', 'analytics', booking.id],
    queryFn: () => getTourBookingAnalytics(booking.id),
  });

  const primaryEvent =
    analyticsQuery.data?.find((event) => event.eventName === 'booking_success') ?? analyticsQuery.data?.[0] ?? null;

  return (
    <FormSection title="Foglalás információ" description="Alapadatok és a foglalás forrása.">
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <DetailField label="Foglalás azonosító" value={`#${booking.id}`} />
        <DetailField label="Foglalás típusa" value="Körutazás foglalás" />
        <DetailField
          label="Aktuális státusz"
          value={<StatusBadge label={getTourBookingStatusLabel(booking.status)} tone={statusTone(booking.status)} />}
        />
        <DetailField label="Létrehozás dátuma" value={formatDateTime(booking.createdAt)} />
        <DetailField label="Utolsó módosítás" value={formatDateTime(booking.updatedAt)} />
        <DetailField label="Analytics Event ID" value={primaryEvent?.eventId ?? null} />
        <DetailField label="Source" value={primaryEvent?.source ?? null} />
        <DetailField
          label="UTM"
          value={
            primaryEvent && (primaryEvent.utmSource || primaryEvent.utmMedium || primaryEvent.utmCampaign)
              ? [primaryEvent.utmSource, primaryEvent.utmMedium, primaryEvent.utmCampaign].filter(Boolean).join(' / ')
              : null
          }
        />
        <DetailField label="IP cím (hash)" value={primaryEvent?.ipHash ?? null} />
      </div>

      {primaryEvent?.userAgent ? (
        <AccordionItem title="User Agent" className="mt-3">
          <p className="break-all text-xs text-muted-foreground">{primaryEvent.userAgent}</p>
        </AccordionItem>
      ) : null}
    </FormSection>
  );
}
