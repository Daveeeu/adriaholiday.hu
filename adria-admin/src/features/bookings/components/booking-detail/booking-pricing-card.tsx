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

  if (pricing.discount) {
    rows.push({
      key: 'discount',
      label: `${pricing.discount.label} (-${pricing.discount.percent}%)`,
      detail: null,
      amount: -pricing.discount.amount,
    });
  }

  pricing.extras.forEach((extra) => {
    rows.push({
      key: `extra-${extra.id}`,
      label:
        extra.chargeRule === 'mandatory'
          ? `${extra.name} (kötelező)`
          : extra.name,
      detail: [`${extra.quantity} × ${format(extra.price)}`, extra.choice]
        .filter(Boolean)
        .join(' – '),
      amount: extra.total,
    });
  });

  // After the supplements, which the server lists in its fixed order.
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

  if (pricing.coupon) {
    rows.push({
      key: 'coupon',
      label: `Kupon (${pricing.coupon.code})`,
      detail: null,
      amount: -pricing.coupon.amount,
    });
  }

  // Insurances are always invoiced apart from the trip.
  const insuranceRows: PriceRow[] = pricing.insurances.map((insurance) => ({
    key: `insurance-${insurance.key}`,
    label: insurance.name,
    detail: insurance.detail,
    amount: insurance.total,
  }));

  return (
    <FormSection
      title="Árösszesítő"
      description="A foglalás pillanatában a szerver által számolt tételes ár."
    >
      <div className="space-y-2 text-sm">
        <PriceRows rows={rows} format={format} />

        {insuranceRows.length > 0 ? (
          <>
            {pricing.tripTotal !== null ? (
              <SubtotalRow
                label="Utazás díja"
                amount={format(pricing.tripTotal)}
              />
            ) : null}
            <div className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Biztosítás – külön számlázandó
            </div>
            <PriceRows rows={insuranceRows} format={format} />
            <SubtotalRow
              label="Biztosítás díja"
              amount={format(pricing.insuranceTotal)}
            />
          </>
        ) : null}

        {pricing.total !== null ? (
          <div className="flex items-center justify-between gap-4 border-t pt-2 font-semibold">
            <span>Végösszeg</span>
            <span className="whitespace-nowrap">{format(pricing.total)}</span>
          </div>
        ) : null}

        {(pricing.onSiteExtras ?? []).map((extra) => (
          <div
            key={`on-site-${extra.id}`}
            className="flex items-start justify-between gap-4 text-muted-foreground"
          >
            <div>
              <div className="font-medium">
                {extra.name} (helyszínen fizetendő)
              </div>
              <div className="text-xs">
                {extra.quantity} ×{' '}
                {formatCurrency(
                  extra.price,
                  extra.currency ?? pricing.currency,
                )}
              </div>
            </div>
            <div className="whitespace-nowrap font-medium">
              {formatCurrency(extra.total, extra.currency ?? pricing.currency)}
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}

function PriceRows({
  rows,
  format,
}: {
  rows: PriceRow[];
  format: (amount: number) => string;
}) {
  return rows.map((row) => (
    <div key={row.key} className="flex items-start justify-between gap-4">
      <div>
        <div className="font-medium text-foreground">{row.label}</div>
        {row.detail ? (
          <div className="text-xs text-muted-foreground">{row.detail}</div>
        ) : null}
      </div>
      <div className="whitespace-nowrap font-medium">{format(row.amount)}</div>
    </div>
  ));
}

function SubtotalRow({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t pt-2 font-medium">
      <span>{label}</span>
      <span className="whitespace-nowrap">{amount}</span>
    </div>
  );
}
