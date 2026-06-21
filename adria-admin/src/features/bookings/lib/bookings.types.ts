export type CrudSortDirection = 'asc' | 'desc';

export type CrudListQuery = {
  page: number;
  perPage: number;
  search: string;
  sortBy: string;
  sortDirection: CrudSortDirection;
};

export type CrudListResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'cancelled'
  | 'completed';

export type InquiryStatus = 'new' | 'contacted' | 'quoted' | 'closed';

export type ApartmentBookingStatus = 'new' | 'approved' | 'credited' | 'closed';

export type FinanceStatus = 'pending' | 'approved' | 'paid' | 'settled';

export type FinanceType =
  | 'commission_credit'
  | 'commission_payout'
  | 'location_credit'
  | 'commission_list'
  | 'travelable_commission';

export type BannerStatus = 'draft' | 'active' | 'archived';

export type MessageStatus = 'new' | 'read' | 'archived';

export type CouponStatus = 'active' | 'used' | 'expired';

export interface TourBooking {
  id: string;
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
  partnerAddress: string;
  partnerCity: string;
  partnerCountry: string;
  partnerNote: string;
  offerName: string;
  departureDate: string;
  passengerCount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  status: BookingStatus;
  cancelled: boolean;
  appointmentTime: string;
  applicationDate: string;
  createdAt: string;
}

export interface TourInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  offerName: string;
  appointmentTime: string;
  createdAt: string;
  status: InquiryStatus;
}

export interface ApartmentBooking {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  address: string;
  apartmentName: string;
  arrival: string;
  departure: string;
  passengers: number;
  applicationTime: string;
  bookingDate: string;
  offerCode: string;
  credited: boolean;
  status: ApartmentBookingStatus;
  createdAt: string;
}

export interface PartnerFinanceRecord {
  id: string;
  partnerName: string;
  date: string;
  amount: number;
  type: FinanceType;
  status: FinanceStatus;
  balance: number;
  note: string;
  createdAt: string;
}

export interface PartnerBanner {
  id: string;
  name: string;
  url: string;
  image: string;
  width: number;
  height: number;
  embedCode: string;
  status: BannerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  status: MessageStatus;
}

export interface Coupon {
  id: string;
  active: boolean;
  name: string;
  email: string;
  code: string;
  value: number;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export type TourBookingFormValues = Omit<
  TourBooking,
  'id' | 'createdAt' | 'cancelled'
> & {
  cancelled: boolean;
};

export type TourInquiryFormValues = Omit<TourInquiry, 'id' | 'createdAt'>;

export type ApartmentBookingFormValues = Omit<
  ApartmentBooking,
  'id' | 'createdAt'
>;

export type PartnerFinanceFormValues = Omit<
  PartnerFinanceRecord,
  'id' | 'createdAt'
>;

export type PartnerBannerFormValues = Omit<
  PartnerBanner,
  'id' | 'createdAt' | 'updatedAt'
>;

export type ContactMessageFormValues = Omit<ContactMessage, 'id'>;

export type CouponFormValues = Omit<Coupon, 'id' | 'createdAt'>;

export type BookingModuleKey =
  | 'tourBookings'
  | 'tourInquiries'
  | 'apartmentBookings'
  | 'partnerFinances'
  | 'bannerGenerator'
  | 'messages'
  | 'coupons';

