import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { getTourBookingActivities, updateTourBookingRecord } from '../../lib/bookings.api';
import { formatDateTime } from '../../lib/bookings.utils';
import type { TourBookingDetail } from '../../lib/bookings.types';
import { FormSection } from '../form-section';

export function BookingAdminNoteCard({ booking }: { booking: TourBookingDetail }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(booking.adminNote);

  const activitiesQuery = useQuery({
    queryKey: ['bookings', 'tour-bookings', 'activities', booking.id],
    queryFn: () => getTourBookingActivities(booking.id),
  });

  const lastNoteChange = activitiesQuery.data?.find(
    (activity) => activity.description === 'Admin megjegyzés frissítve',
  );

  const mutation = useMutation({
    mutationFn: () =>
      updateTourBookingRecord(booking.id, {
        partnerName: booking.partnerName,
        partnerEmail: booking.partnerEmail,
        partnerPhone: booking.partnerPhone,
        partnerAddress: booking.partnerAddress,
        partnerCity: booking.partnerCity,
        partnerCountry: booking.partnerCountry,
        partnerNote: booking.partnerNote,
        adminNote: draft,
        offerName: booking.offerName,
        departureDate: booking.departureDate,
        passengerCount: booking.passengerCount,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
        cancelled: booking.cancelled,
        appointmentTime: booking.appointmentTime,
        applicationDate: booking.applicationDate,
      }),
    onSuccess: () => {
      toast.success('Admin megjegyzés mentve.');
      queryClient.invalidateQueries({ queryKey: ['bookings', 'tour-bookings'] });
    },
    onError: () => {
      toast.error('A megjegyzés mentése nem sikerült.');
    },
  });

  return (
    <FormSection title="Admin megjegyzések" description="Belső megjegyzés — az ügyfél nem látja.">
      <div className="space-y-3">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={5}
          placeholder="Belső megjegyzés az ügyintézők számára..."
          className="min-h-[120px]"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending || draft === booking.adminNote}
            onClick={() => mutation.mutate()}
          >
            Megjegyzés mentése
          </Button>
          {lastNoteChange ? (
            <p className="text-xs text-muted-foreground">
              Utoljára módosította: {lastNoteChange.causerName ?? 'Rendszer'} · {formatDateTime(lastNoteChange.createdAt)}
            </p>
          ) : null}
        </div>
      </div>
    </FormSection>
  );
}
