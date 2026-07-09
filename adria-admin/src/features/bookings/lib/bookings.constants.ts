import type {
  ApartmentBookingStatus,
  BannerStatus,
  BookingStatus,
  FinanceStatus,
  FinanceType,
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

export function getFinanceStatusLabel(status: FinanceStatus) {
  switch (status) {
    case 'pending':
      return 'Függőben';
    case 'approved':
      return 'Jóváhagyva';
    case 'paid':
      return 'Kifizetve';
    case 'settled':
      return 'Elszámolva';
    default:
      return status;
  }
}

export function getFinanceTypeLabel(type: FinanceType) {
  switch (type) {
    case 'commission_credit':
      return 'Jutalék jóváírás';
    case 'commission_payout':
      return 'Jutalék kifizetés';
    case 'location_credit':
      return 'Hely jóváírás';
    case 'commission_list':
      return 'Jutalék lista';
    case 'travelable_commission':
      return 'Leutazható jutalék';
    default:
      return type;
  }
}

export function getBannerStatusLabel(status: BannerStatus) {
  switch (status) {
    case 'draft':
      return 'Piszkozat';
    case 'active':
      return 'Aktív';
    case 'archived':
      return 'Archivált';
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
