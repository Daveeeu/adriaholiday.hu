import { formatCurrency } from '../../lib/booking-utils';
import { formatDate, formatDateTime } from '../../lib/bookings.utils';
import type { TourBookingDetail, TourBookingInstalment } from '../../lib/bookings.types';
import { FormSection } from '../form-section';
import { StatusBadge } from '../status-badge';

function instalmentBadge(instalment: TourBookingInstalment) {
  if (instalment.paid) {
    return <StatusBadge label="Befizetve" tone="success" />;
  }

  if (instalment.overdue) {
    return <StatusBadge label="Lejárt" tone="danger" />;
  }

  return instalment.paidAmount > 0
    ? <StatusBadge label="Részben befizetve" tone="info" />
    : <StatusBadge label="Esedékes" tone="neutral" />;
}

export function BookingPaymentScheduleCard({ booking }: { booking: TourBookingDetail }) {
  const schedule = booking.paymentSchedule;

  if (!schedule || schedule.length === 0) {
    return null;
  }

  const currency = booking.pricing?.currency ?? 'HUF';
  const total = schedule.reduce((sum, instalment) => sum + instalment.amount, 0);
  const paid = schedule.reduce((sum, instalment) => sum + instalment.paidAmount, 0);

  return (
    <FormSection
      title="Fizetési ütemezés"
      description="Az indulásig hátralévő napok szerinti részletek, ahogy az utas a visszaigazolásban megkapta."
    >
      <div className="space-y-2">
        {schedule.map((instalment) => (
          <div
            key={instalment.number}
            className={`rounded-xl border bg-background p-3 text-sm ${instalment.overdue ? 'border-destructive/40' : ''}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-foreground">{instalment.title}</span>
              {instalmentBadge(instalment)}
            </div>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {instalment.percent}%{instalment.includesInsurance ? ' + biztosítás' : ''} · {instalment.dueRule}
              </span>
              <span className="font-semibold text-foreground">{formatCurrency(instalment.amount, currency)}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Határidő: {instalment.dueWithinHours ? formatDateTime(instalment.dueAt) : formatDate(instalment.dueAt)}
              {!instalment.paid && instalment.paidAmount > 0
                ? ` · befizetve ${formatCurrency(instalment.paidAmount, currency)}`
                : null}
            </div>
          </div>
        ))}

        <div className="flex justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Befizetve / hátralék</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(paid, currency)} / {formatCurrency(Math.max(0, total - paid), currency)}
          </span>
        </div>
      </div>
    </FormSection>
  );
}
