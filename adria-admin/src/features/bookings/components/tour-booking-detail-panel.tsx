import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import {
  changeTourBookingStatus,
  getTourBookingActivities,
  updateTourBookingRecord,
} from '../lib/bookings.api';
import {
  getAllowedTourBookingStatusTransitions,
  getTourBookingStatusLabel,
} from '../lib/bookings.constants';
import { formatDate } from '../lib/bookings.utils';
import type { BookingStatus, TourBookingDetail, TourBookingFormValues } from '../lib/bookings.types';
import { FormSection } from './form-section';
import { StatusBadge } from './status-badge';

function statusTone(status: BookingStatus) {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'contacted':
      return 'info';
    case 'cancelled':
    case 'expired':
      return 'danger';
    case 'new':
    default:
      return 'warning';
  }
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value ?? '—'}</div>
    </div>
  );
}

export function TourBookingDetailPanel({ booking }: { booking: TourBookingDetail }) {
  const queryClient = useQueryClient();
  const [adminNoteDraft, setAdminNoteDraft] = useState(booking.adminNote);
  const [nextStatus, setNextStatus] = useState('');

  const activitiesQuery = useQuery({
    queryKey: ['bookings', 'tour-bookings', 'activities', booking.id],
    queryFn: () => getTourBookingActivities(booking.id),
  });

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

  const adminNoteMutation = useMutation({
    mutationFn: (values: TourBookingFormValues) => updateTourBookingRecord(booking.id, values),
    onSuccess: () => {
      toast.success('Admin megjegyzés mentve.');
      queryClient.invalidateQueries({ queryKey: ['bookings', 'tour-bookings'] });
    },
  });

  const allowedTransitions = getAllowedTourBookingStatusTransitions(booking.status);

  return (
    <div className="space-y-4">
      <FormSection title="Utazás" description="A foglaláshoz tartozó ajánlat és időpont.">
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <DetailItem label="Ajánlat" value={booking.offerName} />
          <DetailItem label="Indulás dátuma" value={formatDate(booking.departureDate)} />
          {booking.tourDate ? (
            <>
              <DetailItem label="Időpont státusza" value={booking.tourDate.status} />
              <DetailItem
                label="Szabad helyek"
                value={
                  booking.tourDate.availableSeats !== null
                    ? `${booking.tourDate.availableSeats} / ${booking.tourDate.capacity ?? '—'}`
                    : 'Nincs korlátozva'
                }
              />
            </>
          ) : null}
          <DetailItem label="Résztvevők száma" value={`${booking.passengerCount} fő`} />
          <DetailItem
            label="Helyek lefoglalva?"
            value={<StatusBadge label={booking.seatsReserved ? 'Igen' : 'Nem'} tone={booking.seatsReserved ? 'success' : 'neutral'} />}
          />
        </div>
      </FormSection>

      <FormSection title="Kapcsolattartó adatok" description="A foglalást leadó személy elérhetőségei.">
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <DetailItem label="Név" value={booking.partnerName} />
          <DetailItem label="Email" value={booking.partnerEmail} />
          <DetailItem label="Telefon" value={booking.partnerPhone} />
          <DetailItem label="Város" value={booking.partnerCity} />
        </div>
      </FormSection>

      {booking.passengerFields.length > 0 ? (
        <FormSection title="Utas adatok" description="A foglaláshoz megadott utasok részletei.">
          <div className="space-y-3">
            {booking.passengerFields.map((passenger, index) => (
              <div key={index} className="rounded-xl border bg-muted/20 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {index + 1}. utas
                </div>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  {passenger.map((field) => (
                    <DetailItem key={field.key} label={field.label} value={field.value} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      ) : null}

      {booking.formDataFields.length > 0 ? (
        <FormSection title="Foglalási űrlap adatai" description="A publikus űrlapon dinamikusan bekért mezők.">
          <div className="grid gap-3 text-sm md:grid-cols-2">
            {booking.formDataFields.map((field) => (
              <DetailItem key={field.key} label={field.label} value={field.value} />
            ))}
          </div>
        </FormSection>
      ) : null}

      <FormSection title="Státusz" description="A foglalás állapotának kezelése.">
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

      <FormSection title="Admin megjegyzés" description="Belső megjegyzés, az ügyfél nem látja.">
        <div className="space-y-3">
          <Textarea
            value={adminNoteDraft}
            onChange={(event) => setAdminNoteDraft(event.target.value)}
            rows={3}
            placeholder="Belső megjegyzés..."
          />
          <Button
            type="button"
            variant="outline"
            disabled={adminNoteMutation.isPending || adminNoteDraft === booking.adminNote}
            onClick={() =>
              adminNoteMutation.mutate({
                partnerName: booking.partnerName,
                partnerEmail: booking.partnerEmail,
                partnerPhone: booking.partnerPhone,
                partnerAddress: booking.partnerAddress,
                partnerCity: booking.partnerCity,
                partnerCountry: booking.partnerCountry,
                partnerNote: booking.partnerNote,
                adminNote: adminNoteDraft,
                offerName: booking.offerName,
                departureDate: booking.departureDate,
                passengerCount: booking.passengerCount,
                paymentStatus: booking.paymentStatus,
                status: booking.status,
                cancelled: booking.cancelled,
                appointmentTime: booking.appointmentTime,
                applicationDate: booking.applicationDate,
              })
            }
          >
            Megjegyzés mentése
          </Button>
        </div>
      </FormSection>

      <FormSection title="Idővonal" description="A foglalás módosítási előzményei.">
        {activitiesQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Betöltés...</p>
        ) : activitiesQuery.data && activitiesQuery.data.length > 0 ? (
          <div className="space-y-3">
            {activitiesQuery.data.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 rounded-xl border bg-background p-3">
                <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">{activity.description}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleString('hu-HU')}
                    {activity.causerName ? ` · ${activity.causerName}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nincs még rögzített esemény.</p>
        )}
      </FormSection>
    </div>
  );
}
