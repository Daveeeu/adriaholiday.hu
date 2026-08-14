import type {
  ApartmentBookingStatus,
  BookingStatus,
  InquiryStatus,
  MessageStatus,
} from './bookings.types';

export function getTourBookingStatusLabel(status: BookingStatus) {
  switch (status) {
    case 'new':
      return 'Új';
    case 'contacted':
      return 'Felvéve a kapcsolat';
    case 'confirmed':
      return 'Megerősítve';
    case 'cancelled':
      return 'Lemondva';
    case 'expired':
      return 'Lejárt';
    default:
      return status;
  }
}

export const TOUR_BOOKING_STATUS_OPTIONS: BookingStatus[] = [
  'new',
  'contacted',
  'confirmed',
  'cancelled',
  'expired',
];

const TOUR_BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  new: ['contacted', 'confirmed', 'cancelled', 'expired'],
  contacted: ['confirmed', 'cancelled', 'expired'],
  confirmed: ['cancelled'],
  cancelled: [],
  expired: [],
};

export function getAllowedTourBookingStatusTransitions(status: BookingStatus): BookingStatus[] {
  return TOUR_BOOKING_STATUS_TRANSITIONS[status] ?? [];
}

export function getInquiryStatusLabel(status: InquiryStatus) {
  switch (status) {
    case 'new':
      return 'Új';
    case 'contacted':
      return 'Kapcsolatban';
    case 'quoted':
      return 'Ajánlat kiküldve';
    case 'closed':
      return 'Lezárva';
    default:
      return status;
  }
}

export function getApartmentBookingStatusLabel(status: ApartmentBookingStatus) {
  switch (status) {
    case 'new':
      return 'Új';
    case 'approved':
      return 'Jóváhagyva';
    case 'credited':
      return 'Jóváírva';
    case 'closed':
      return 'Lezárva';
    default:
      return status;
  }
}

export function getMessageStatusLabel(status: MessageStatus) {
  switch (status) {
    case 'new':
      return 'Új';
    case 'read':
      return 'Olvasott';
    case 'archived':
      return 'Archivált';
    default:
      return status;
  }
}
