import { useQuery } from '@tanstack/react-query';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { getTourBookingActivities, getTourBookingEmails } from '../../lib/bookings.api';
import { formatDateTime } from '../../lib/bookings.utils';
import type { TourBookingDetail } from '../../lib/bookings.types';
import { FormSection } from '../form-section';

type TimelineEntry = {
  id: string;
  time: string;
  title: string;
  kind: 'activity' | 'email';
};

export function BookingTimeline({ booking }: { booking: TourBookingDetail }) {
  const activitiesQuery = useQuery({
    queryKey: ['bookings', 'tour-bookings', 'activities', booking.id],
    queryFn: () => getTourBookingActivities(booking.id),
  });

  const emailsQuery = useQuery({
    queryKey: ['bookings', 'tour-bookings', 'emails', booking.id],
    queryFn: () => getTourBookingEmails(booking.id),
  });

  const isLoading = activitiesQuery.isLoading || emailsQuery.isLoading;

  const entries: TimelineEntry[] = [
    ...(activitiesQuery.data ?? []).map((activity) => ({
      id: `activity-${activity.id}`,
      time: activity.createdAt,
      title: activity.description,
      kind: 'activity' as const,
    })),
    ...(emailsQuery.data ?? []).map((email) => ({
      id: `email-${email.id}`,
      time: email.createdAt,
      title:
        email.status === 'sent'
          ? `Email kiküldve: ${email.subject} (${email.to})`
          : `Email küldése sikertelen: ${email.subject} (${email.to})`,
      kind: 'email' as const,
    })),
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <FormSection title="Activity Timeline" description="Létrejövés, státuszváltások, email küldés és admin módosítások.">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">Nincs még rögzített esemény.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 rounded-xl border bg-background p-3">
              <div
                className={cn(
                  'mt-1 size-2 shrink-0 rounded-full',
                  entry.kind === 'email' ? 'bg-sky-500' : 'bg-primary',
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{entry.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(entry.time)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}
