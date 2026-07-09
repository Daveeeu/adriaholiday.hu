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
  | 'new'
  | 'contacted'
  | 'confirmed'
  | 'cancelled'
  | 'expired';

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

export type BookingDynamicField = {
  key: string;
  label: string;
  value: string;
};

export type BookingActivity = {
  id: string;
  event: string;
  description: string;
  causerName: string | null;
  createdAt: string;
};

export type TourBookingTourDate = {
  id: string;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  availableSeats: number | null;
  capacity: number | null;
  maxParticipants: number | null;
};

export type TourBookingTourSummary = {
  id: string;
  name: string;
  seoName: string | null;
  regionLabel: string | null;
  categories: Array<{ id: string; label: string }>;
  price: number | null;
  displayedPrice: string | null;
};

export type BookingAnalyticsEvent = {
  id: string;
  eventId: string;
  eventName: string;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
  ipHash: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type BookingEmailLog = {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed';
  error: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type TourBookingDetail = TourBooking & {
  tourId: string | null;
  tour: TourBookingTourSummary | null;
  tourTransportLabel: string | null;
  tourCountry: string | null;
  tourDateId: string | null;
  tourDate: TourBookingTourDate | null;
  adminNote: string;
  seatsReserved: boolean;
  formDataFields: BookingDynamicField[];
  passengerFields: BookingDynamicField[][];
  payload: Record<string, unknown> | null;
  updatedAt: string;
};

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
  adminNote: string;
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

