import { formatCurrency } from '../../lib/booking-utils';
import { formatDateTime } from '../../lib/bookings.utils';
import type { TourBookingDetail, TourBookingPayment } from '../../lib/bookings.types';
import { FormSection } from '../form-section';
import { StatusBadge } from '../status-badge';

const STATUS_BADGES: Record<
  TourBookingPayment['status'],
  { label: string; tone: 'neutral' | 'info' | 'success' | 'danger' }
> = {
  pending: { label: 'Előkészítve', tone: 'neutral' },
  started: { label: 'Fizetésre vár', tone: 'info' },
  succeeded: { label: 'Sikeres', tone: 'success' },
  failed: { label: 'Sikertelen', tone: 'danger' },
};

const KIND_LABELS: Record<TourBookingPayment['kind'], string> = {
  full: 'Teljes összeg',
  deposit: 'Előleg',
};

export function BookingPaymentsCard({ booking }: { booking: TourBookingDetail }) {
  if (booking.payments.length === 0) {
    return null;
  }

  return (
    <FormSection title="Online fizetések" description="Barion fizetési kísérletek, a legújabb elöl.">
      <div className="space-y-2">
        {booking.payments.map((payment) => {
          const badge = STATUS_BADGES[payment.status];

          return (
            <div key={payment.id} className="rounded-xl border bg-background p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  {formatCurrency(payment.amount, payment.currency)} · {KIND_LABELS[payment.kind]}
                </span>
                <StatusBadge label={badge.label} tone={badge.tone} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(payment.completedAt ?? payment.createdAt)}
                {payment.providerPaymentId ? ` · Barion azonosító: ${payment.providerPaymentId}` : null}
                {payment.providerStatus ? ` · ${payment.providerStatus}` : null}
              </div>
            </div>
          );
        })}
      </div>
    </FormSection>
  );
}
