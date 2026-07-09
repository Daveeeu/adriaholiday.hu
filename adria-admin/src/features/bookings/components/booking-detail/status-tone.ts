import type { BookingStatus } from '../../lib/bookings.types';

export function statusTone(status: BookingStatus) {
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
