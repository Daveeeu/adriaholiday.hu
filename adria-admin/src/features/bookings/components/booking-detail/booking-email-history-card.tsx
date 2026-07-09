import { useQuery } from '@tanstack/react-query';

import { Skeleton } from '@/components/ui/skeleton';

import { getTourBookingEmails } from '../../lib/bookings.api';
import { formatDateTime } from '../../lib/bookings.utils';
import type { TourBookingDetail } from '../../lib/bookings.types';
import { FormSection } from '../form-section';
import { StatusBadge } from '../status-badge';

export function BookingEmailHistoryCard({ booking }: { booking: TourBookingDetail }) {
  const emailsQuery = useQuery({
    queryKey: ['bookings', 'tour-bookings', 'emails', booking.id],
    queryFn: () => getTourBookingEmails(booking.id),
  });

  return (
    <FormSection title="Email előzmények" description="A foglaláshoz kapcsolódó kimenő értesítések.">
      {emailsQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !emailsQuery.data || emailsQuery.data.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">Nincs email előzmény.</p>
      ) : (
        <div className="space-y-2">
          {emailsQuery.data.map((email) => (
            <div key={email.id} className="rounded-xl border bg-background p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">{email.subject}</span>
                <StatusBadge
                  label={email.status === 'sent' ? 'Kiküldve' : 'Sikertelen'}
                  tone={email.status === 'sent' ? 'success' : 'danger'}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Címzett: {email.to} · {formatDateTime(email.sentAt ?? email.createdAt)}
              </div>
              {email.error ? <div className="mt-1 text-xs text-destructive">{email.error}</div> : null}
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}
