import { createId } from '@/data/generators/core-generators';
import type { Booking, Guest } from '@/types/domain';

export function createGuestsFromBookings(bookings: Booking[]): Guest[] {
  const seen = new Map<string, Guest>();

  bookings.forEach((booking) => {
    if (!seen.has(booking.email)) {
      seen.set(booking.email, {
        id: createId('gst', booking.reference.toLowerCase()),
        name: booking.guestName,
        email: booking.email,
        phone: booking.phone,
        country: booking.country,
        preferredProperty: booking.propertyName,
      });
    }
  });

  return Array.from(seen.values());
}
