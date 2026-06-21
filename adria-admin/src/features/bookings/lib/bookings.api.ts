import { apiClient } from '@/lib/api-client';

import type {
  ApartmentBooking,
  ApartmentBookingFormValues,
  ContactMessage,
  ContactMessageFormValues,
  Coupon,
  CouponFormValues,
  CrudListQuery,
  CrudListResponse,
  FinanceType,
  PartnerBanner,
  PartnerBannerFormValues,
  PartnerFinanceFormValues,
  PartnerFinanceRecord,
  TourBooking,
  TourBookingFormValues,
  TourInquiry,
  TourInquiryFormValues,
} from './bookings.types';

type BookingResource = {
  id: string;
  bookingType: 'tour_booking' | 'tour_inquiry' | 'apartment_booking';
  status: string;
  paymentStatus: string | null;
  regionId: string | null;
  locationId: string | null;
  offerId: string | null;
  offerDateId: string | null;
  apartmentId: string | null;
  tourId: string | null;
  customerName: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  adults: number;
  children: number;
  passengerCount: number | null;
  checkIn: string | null;
  checkOut: string | null;
  departureDate: string | null;
  arrival: string | null;
  departure: string | null;
  appointmentTime: string | null;
  applicationDate: string | null;
  bookingDate: string | null;
  propertyNameSnapshot: string | null;
  offerName: string | null;
  apartmentName: string | null;
  partnerName: string | null;
  offerCode: string | null;
  totalAmount: number | null;
  paidAmount: number | null;
  currency: string;
  credited: boolean;
  cancelled: boolean;
  notes: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

type BookingDetailResource = BookingResource & {
  region?: unknown;
  location?: unknown;
  apartment?: unknown;
  tour?: unknown;
};

function mapTourBooking(resource: BookingResource): TourBooking {
  return {
    id: resource.id,
    partnerName: resource.partnerName ?? resource.customerName ?? '',
    partnerEmail: resource.email ?? '',
    partnerPhone: resource.phone ?? '',
    partnerAddress: resource.address ?? '',
    partnerCity: resource.city ?? '',
    partnerCountry: resource.country ?? '',
    partnerNote: resource.notes ?? '',
    offerName: resource.offerName ?? resource.propertyNameSnapshot ?? '',
    departureDate: resource.departureDate ?? '',
    passengerCount: resource.passengerCount ?? 0,
    paymentStatus: (resource.paymentStatus as TourBooking['paymentStatus']) ?? 'unpaid',
    status:
      resource.status === 'in_progress'
        ? 'in_progress'
        : (resource.status as TourBooking['status']),
    cancelled: resource.cancelled,
    appointmentTime: resource.appointmentTime ?? '',
    applicationDate: resource.applicationDate ?? resource.createdAt.slice(0, 10),
    createdAt: resource.createdAt,
  };
}

function mapTourInquiry(resource: BookingResource): TourInquiry {
  return {
    id: resource.id,
    name: resource.customerName ?? '',
    email: resource.email ?? '',
    phone: resource.phone ?? '',
    message: resource.message ?? resource.notes ?? '',
    offerName: resource.offerName ?? '',
    appointmentTime: resource.appointmentTime ?? '',
    createdAt: resource.createdAt,
    status: resource.status as TourInquiry['status'],
  };
}

function mapApartmentBooking(resource: BookingResource): ApartmentBooking {
  return {
    id: resource.id,
    guestName: resource.customerName ?? '',
    email: resource.email ?? '',
    phone: resource.phone ?? '',
    address: resource.address ?? '',
    apartmentName: resource.apartmentName ?? resource.propertyNameSnapshot ?? '',
    arrival: resource.arrival ?? '',
    departure: resource.departure ?? '',
    passengers: resource.passengerCount ?? 0,
    applicationTime: resource.applicationDate ?? resource.createdAt,
    bookingDate: resource.bookingDate ?? resource.createdAt.slice(0, 10),
    offerCode: resource.offerCode ?? '',
    credited: resource.credited,
    status: resource.status as ApartmentBooking['status'],
    createdAt: resource.createdAt,
  };
}

function listQuery(query: CrudListQuery & { type?: FinanceType }) {
  return {
    page: query.page,
    perPage: query.perPage,
    search: query.search,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
    type: query.type,
  };
}

async function listBookingsByType<T>(
  path: string,
  query: CrudListQuery,
  mapper: (resource: BookingResource) => T,
): Promise<CrudListResponse<T>> {
  const response = await apiClient.get<CrudListResponse<BookingResource>>(path, {
    query: listQuery(query),
  });

  return {
    ...response,
    items: response.items.map(mapper),
  };
}

export function getTourBookings(query: CrudListQuery) {
  return listBookingsByType('/api/admin/bookings/tour-bookings', query, mapTourBooking);
}

export function createTourBookingRecord(values: TourBookingFormValues) {
  return apiClient.post<TourBooking>('/api/admin/bookings/tour-bookings', {
    bookingType: 'tour_booking',
    status: values.status,
    paymentStatus: values.paymentStatus,
    customerName: values.partnerName,
    email: values.partnerEmail,
    phone: values.partnerPhone,
    address: values.partnerAddress,
    city: values.partnerCity,
    country: values.partnerCountry,
    notes: values.partnerNote,
    offerName: values.offerName,
    departureDate: values.departureDate,
    passengerCount: values.passengerCount,
    appointmentTime: values.appointmentTime,
    applicationDate: values.applicationDate,
    cancelled: values.cancelled,
  });
}

export function updateTourBookingRecord(
  id: string,
  values: TourBookingFormValues,
) {
  return apiClient.patch<TourBooking>(`/api/admin/bookings/tour-bookings/${id}`, {
    bookingType: 'tour_booking',
    status: values.status,
    paymentStatus: values.paymentStatus,
    customerName: values.partnerName,
    email: values.partnerEmail,
    phone: values.partnerPhone,
    address: values.partnerAddress,
    city: values.partnerCity,
    country: values.partnerCountry,
    notes: values.partnerNote,
    offerName: values.offerName,
    departureDate: values.departureDate,
    passengerCount: values.passengerCount,
    appointmentTime: values.appointmentTime,
    applicationDate: values.applicationDate,
    cancelled: values.cancelled,
  });
}

export function deleteTourBookingRecord(id: string) {
  return apiClient.delete<void>(`/api/admin/bookings/tour-bookings/${id}`);
}

export async function getTourBookingRecord(id: string) {
  const response = await apiClient.get<BookingDetailResource>(
    `/api/admin/bookings/tour-bookings/${id}`,
  );
  return mapTourBooking(response);
}

export function getTourInquiries(query: CrudListQuery) {
  return listBookingsByType('/api/admin/bookings/tour-inquiries', query, mapTourInquiry);
}

export function createTourInquiryRecord(values: TourInquiryFormValues) {
  return apiClient.post<TourInquiry>('/api/admin/bookings/tour-inquiries', {
    bookingType: 'tour_inquiry',
    status: values.status,
    customerName: values.name,
    email: values.email,
    phone: values.phone,
    message: values.message,
    offerName: values.offerName,
    appointmentTime: values.appointmentTime,
  });
}

export function updateTourInquiryRecord(
  id: string,
  values: TourInquiryFormValues,
) {
  return apiClient.patch<TourInquiry>(`/api/admin/bookings/tour-inquiries/${id}`, {
    bookingType: 'tour_inquiry',
    status: values.status,
    customerName: values.name,
    email: values.email,
    phone: values.phone,
    message: values.message,
    offerName: values.offerName,
    appointmentTime: values.appointmentTime,
  });
}

export function deleteTourInquiryRecord(id: string) {
  return apiClient.delete<void>(`/api/admin/bookings/tour-inquiries/${id}`);
}

export async function getTourInquiryRecord(id: string) {
  const response = await apiClient.get<BookingDetailResource>(
    `/api/admin/bookings/tour-inquiries/${id}`,
  );
  return mapTourInquiry(response);
}

export function getApartmentBookings(query: CrudListQuery) {
  return listBookingsByType(
    '/api/admin/bookings/apartment-bookings',
    query,
    mapApartmentBooking,
  );
}

export function createApartmentBookingRecord(
  values: ApartmentBookingFormValues,
) {
  return apiClient.post<ApartmentBooking>(
    '/api/admin/bookings/apartment-bookings',
    {
      bookingType: 'apartment_booking',
      status: values.status,
      customerName: values.guestName,
      email: values.email,
      phone: values.phone,
      address: values.address,
      apartmentName: values.apartmentName,
      arrival: values.arrival,
      departure: values.departure,
      passengerCount: values.passengers,
      applicationDate: values.applicationTime,
      bookingDate: values.bookingDate,
      offerCode: values.offerCode,
      credited: values.credited,
    },
  );
}

export function updateApartmentBookingRecord(
  id: string,
  values: ApartmentBookingFormValues,
) {
  return apiClient.patch<ApartmentBooking>(
    `/api/admin/bookings/apartment-bookings/${id}`,
    {
      bookingType: 'apartment_booking',
      status: values.status,
      customerName: values.guestName,
      email: values.email,
      phone: values.phone,
      address: values.address,
      apartmentName: values.apartmentName,
      arrival: values.arrival,
      departure: values.departure,
      passengerCount: values.passengers,
      applicationDate: values.applicationTime,
      bookingDate: values.bookingDate,
      offerCode: values.offerCode,
      credited: values.credited,
    },
  );
}

export function deleteApartmentBookingRecord(id: string) {
  return apiClient.delete<void>(
    `/api/admin/bookings/apartment-bookings/${id}`,
  );
}

export async function getApartmentBookingRecord(id: string) {
  const response = await apiClient.get<BookingDetailResource>(
    `/api/admin/bookings/apartment-bookings/${id}`,
  );
  return mapApartmentBooking(response);
}

export function getPartnerFinances(
  query: CrudListQuery & { type?: FinanceType },
) {
  return apiClient.get<CrudListResponse<PartnerFinanceRecord>>(
    '/api/admin/bookings/partner-finances',
    { query: listQuery(query) },
  );
}

export function createPartnerFinanceRecord(values: PartnerFinanceFormValues) {
  return apiClient.post<PartnerFinanceRecord>(
    '/api/admin/bookings/partner-finances',
    values,
  );
}

export function updatePartnerFinanceRecord(
  id: string,
  values: PartnerFinanceFormValues,
) {
  return apiClient.patch<PartnerFinanceRecord>(
    `/api/admin/bookings/partner-finances/${id}`,
    values,
  );
}

export function deletePartnerFinanceRecord(id: string) {
  return apiClient.delete<void>(
    `/api/admin/bookings/partner-finances/${id}`,
  );
}

export function getPartnerFinanceRecord(id: string) {
  return apiClient.get<PartnerFinanceRecord>(
    `/api/admin/bookings/partner-finances/${id}`,
  );
}

export function getBanners(query: CrudListQuery) {
  return apiClient.get<CrudListResponse<PartnerBanner>>(
    '/api/admin/bookings/banners',
    { query: listQuery(query) },
  );
}

export function createBannerRecord(values: PartnerBannerFormValues) {
  return apiClient.post<PartnerBanner>('/api/admin/bookings/banners', values);
}

export function updateBannerRecord(
  id: string,
  values: PartnerBannerFormValues,
) {
  return apiClient.patch<PartnerBanner>(
    `/api/admin/bookings/banners/${id}`,
    values,
  );
}

export function deleteBannerRecord(id: string) {
  return apiClient.delete<void>(`/api/admin/bookings/banners/${id}`);
}

export function getBannerRecord(id: string) {
  return apiClient.get<PartnerBanner>(`/api/admin/bookings/banners/${id}`);
}

export function getMessages(query: CrudListQuery) {
  return apiClient.get<CrudListResponse<ContactMessage>>(
    '/api/admin/bookings/messages',
    { query: listQuery(query) },
  );
}

export function createMessageRecord(values: ContactMessageFormValues) {
  return apiClient.post<ContactMessage>('/api/admin/bookings/messages', values);
}

export function updateMessageRecord(
  id: string,
  values: ContactMessageFormValues,
) {
  return apiClient.patch<ContactMessage>(
    `/api/admin/bookings/messages/${id}`,
    values,
  );
}

export function deleteMessageRecord(id: string) {
  return apiClient.delete<void>(`/api/admin/bookings/messages/${id}`);
}

export function getMessageRecord(id: string) {
  return apiClient.get<ContactMessage>(`/api/admin/bookings/messages/${id}`);
}

export function updateMessageStatusRecord(id: string, status: string) {
  return apiClient.patch<ContactMessage>(
    `/api/admin/bookings/messages/${id}/status`,
    { status },
  );
}

export function getCoupons(query: CrudListQuery) {
  return apiClient.get<CrudListResponse<Coupon>>('/api/admin/bookings/coupons', {
    query: listQuery(query),
  });
}

export function createCouponRecord(values: CouponFormValues) {
  return apiClient.post<Coupon>('/api/admin/bookings/coupons', values);
}

export function updateCouponRecord(id: string, values: CouponFormValues) {
  return apiClient.patch<Coupon>(`/api/admin/bookings/coupons/${id}`, values);
}

export function deleteCouponRecord(id: string) {
  return apiClient.delete<void>(`/api/admin/bookings/coupons/${id}`);
}

export function getCouponRecord(id: string) {
  return apiClient.get<Coupon>(`/api/admin/bookings/coupons/${id}`);
}

export function updateCouponStatusRecord(id: string, status: string) {
  return apiClient.patch<Coupon>(`/api/admin/bookings/coupons/${id}/status`, {
    status,
  });
}
