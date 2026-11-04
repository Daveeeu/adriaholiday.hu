import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

import { resendTourBookingDetailsRequest } from '../../lib/bookings.api';
import type { TourBookingDetail } from '../../lib/bookings.types';
import { FormSection } from '../form-section';

/**
 * The deferred details the customer has not given yet; they were e-mailed a
 * link after booking, which the office can send again.
 */
export function BookingPendingDetailsCard({ booking }: { booking: TourBookingDetail }) {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const mutation = useMutation({
    mutationFn: () => resendTourBookingDetailsRequest(booking.id),
    onSuccess: () => {
      toast.success('Az adatbekérő e-mailt újra elküldtük az ügyfélnek.');
      queryClient.invalidateQueries({ queryKey: ['bookings', 'tour-bookings', 'emails', booking.id] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Az e-mail küldése nem sikerült.');
    },
  });

  if (booking.pendingDetails.length === 0) {
    return null;
  }

  return (
    <FormSection
      title="Hiányzó adatok"
      description="Ezeket az ügyfél a foglaláskor üresen hagyta. A foglalás után e-mailben kapott egy linket, ahol megadhatja őket."
    >
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {booking.pendingDetails.map((group) => (
          <div key={group.title}>
            <div className="font-semibold">{group.title}</div>
            <div>{group.fields.join(', ')}</div>
          </div>
        ))}
      </div>
      {hasPermission('bookings.update') ? (
        <Button type="button" variant="outline" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          <Send className="size-4" />
          {mutation.isPending ? 'Küldés...' : 'Adatbekérő e-mail újraküldése'}
        </Button>
      ) : null}
    </FormSection>
  );
}
