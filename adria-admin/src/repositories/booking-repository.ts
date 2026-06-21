import type { BookingStatusMutationInput } from '@/api/admin-api';
import type { Booking, BookingDetail } from '@/types/domain';

export interface BookingRepository {
  list(regionId?: string): Promise<Booking[]>;
  getById(bookingId: string): Promise<BookingDetail | null>;
  updateStatus(
    bookingId: string,
    input: BookingStatusMutationInput,
  ): Promise<Booking>;
}
