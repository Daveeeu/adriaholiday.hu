import type { TourBookingDetail } from '../../lib/bookings.types';
import { formatCurrency } from '../../lib/booking-utils';
import { FormSection } from '../form-section';

type PriceRow = {
  key: string;
  label: string;
  detail: string | null;
  amount: number;
};

export function BookingPricingCard({
  booking,
}: {
  booking: TourBookingDetail;
}) {
  const pricing = booking.pricing;

  if (!pricing) {
    return null;
  }

  const format = (amount: number) => formatCurrency(amount, pricing.currency);
  const rows: PriceRow[] = [];

  if (pricing.basePrice !== null && pricing.baseTotal !== null) {
    rows.push({
      key: 'base',
      label: 'Részvételi díj',
      detail: `${pricing.passengers} fő × ${format(pricing.basePrice)}`,
      amount: pricing.baseTotal,
    });
  }

  if (pricing.departurePlace) {
    rows.push({
      key: 'departure',
      label: `Felszállás: ${pricing.departurePlace.name}`,
      detail:
        pricing.departurePlace.fee > 0
          ? `${pricing.passengers} fő × ${format(pricing.departurePlace.fee)}`
          : null,
      amount: pricing.departurePlace.total,
    });
  }

  pricing.extras.forEach((extra) => {
    rows.push({
      key: `extra-${extra.id}`,
      label: extra.mandatory ? `${extra.name} (kötelező)` : extra.name,
      detail: `${extra.quantity} × ${format(extra.price)}`,
      amount: extra.total,
    });
  });

  return (
    <FormSection
      title="Árösszesítő"
      description="A foglalás pillanatában a szerver által számolt tételes ár."
    >
      <div className="space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.key} className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-foreground">{row.label}</div>
              {row.detail ? (
                <div className="text-xs text-muted-foreground">
                  {row.detail}
                </div>
              ) : null}
            </div>
            <div className="whitespace-nowrap font-medium">
              {format(row.amount)}
            </div>
          </div>
        ))}

        {pricing.total !== null ? (
          <div className="flex items-center justify-between gap-4 border-t pt-2 font-semibold">
            <span>Végösszeg</span>
            <span className="whitespace-nowrap">{format(pricing.total)}</span>
          </div>
        ) : null}
      </div>
    </FormSection>
  );
}
