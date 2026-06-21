import { repositories } from '@/repositories';
import type { Booking } from '@/types/domain';

export async function getBookings(regionId?: string) {
  return repositories.bookingRepository.list(regionId);
}

export async function getBookingById(bookingId: string) {
  return repositories.bookingRepository.getById(bookingId);
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status'],
) {
  return repositories.bookingRepository.updateStatus(bookingId, { status });
}
