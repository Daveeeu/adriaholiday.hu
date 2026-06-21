import { t } from '@/i18n';
import type { Booking } from '@/types/domain';

export const bookingStatusOptions: Array<{
  value: Booking['status'];
  label: string;
}> = [
  { value: 'pending', label: t('status.booking.pending') },
  { value: 'confirmed', label: t('status.booking.confirmed') },
  { value: 'cancelled', label: t('status.booking.cancelled') },
  { value: 'completed', label: t('status.booking.completed') },
];

export const bookingStatusLabels: Record<Booking['status'], string> = {
  pending: t('status.booking.pending'),
  confirmed: t('status.booking.confirmed'),
  cancelled: t('status.booking.cancelled'),
  completed: t('status.booking.completed'),
};

export function formatBookingStatus(status: Booking['status']) {
  return bookingStatusLabels[status];
}

export function formatCurrency(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}
