import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

import { changeTourBookingStatus } from '../../lib/bookings.api';
import { getAllowedTourBookingStatusTransitions, getTourBookingStatusLabel } from '../../lib/bookings.constants';
import type { TourBookingDetail } from '../../lib/bookings.types';
import { FormSection } from '../form-section';
import { StatusBadge } from '../status-badge';
import { statusTone } from './status-tone';

export function BookingStatusCard({ booking }: { booking: TourBookingDetail }) {
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState('');

  const statusMutation = useMutation({
    mutationFn: (status: string) => changeTourBookingStatus(booking.id, status),
    onSuccess: () => {
      toast.success('Foglalás státusza frissítve.');
      setNextStatus('');
      queryClient.invalidateQueries({ queryKey: ['bookings', 'tour-bookings'] });
    },
    onError: () => {
      toast.error('A státuszváltás nem sikerült. Ellenőrizd, hogy a lépés engedélyezett-e.');
    },
  });

  const allowedTransitions = getAllowedTourBookingStatusTransitions(booking.status);

  return (
    <FormSection title="Státuszváltás" description="A foglalás állapotának kezelése az engedélyezett workflow szerint.">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge label={getTourBookingStatusLabel(booking.status)} tone={statusTone(booking.status)} />

        {allowedTransitions.length > 0 ? (
          <>
            <Select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>
              <option value="">Válassz új státuszt...</option>
              {allowedTransitions.map((status) => (
                <option key={status} value={status}>
                  {getTourBookingStatusLabel(status)}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              disabled={!nextStatus || statusMutation.isPending}
              onClick={() => nextStatus && statusMutation.mutate(nextStatus)}
            >
              Alkalmaz
            </Button>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Ebből az állapotból nincs további váltás.</span>
        )}
      </div>
    </FormSection>
  );
}
