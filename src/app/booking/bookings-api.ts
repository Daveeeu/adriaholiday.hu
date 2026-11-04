import { getBookingAnalyticsContext } from '../analytics/google-tag-manager';
import { getStoredConsent } from '../analytics/storage';
import { getPortfolioApiBaseUrl } from '../content/portfolio-api';
import type { BookingFormField } from './booking-form-fields';
import type { PassengerOptions } from './booking-pricing';

export type BookingFormData = Record<string, string>;
export type BookingPassenger = Record<string, string>;

export type SubmitBookingPayload = {
  tourId: number | string;
  tourDateId?: number | string | null;
  participants?: number | null;
  formData: BookingFormData;
  passengers: BookingPassenger[];
  note?: string;
  couponCode?: string;
  departurePlaceId?: number | string | null;
  /** Extras charged once per booking, with a choice where one is offered. */
  extraIds?: number[];
  extraChoices?: Record<number, string>;
  /** Each passenger's own extras and insurances, in passenger order. */
  passengerOptions?: PassengerOptions[];
  type?: 'tour_booking' | 'tour_inquiry';
  /** The customer accepted the terms (ÁSZF) and the privacy policy. */
  termsAccepted: boolean;
  /** Also subscribe the contact e-mail to the newsletter (and its coupon). */
  newsletterSubscribe?: boolean;
};

export type SubmitTourInquiryPayload = {
  tourId: number | string;
  name: string;
  email: string;
  phone?: string;
  postalCode?: string;
  city?: string;
  street?: string;
  dateFrom: string;
  dateTo: string;
  passengerCount: number;
  message?: string;
  privacyAccepted: boolean;
};

/** A booking request from an apartment's page; the office confirms it. */
export type SubmitApartmentBookingPayload = {
  customerName: string;
  email: string;
  phone?: string;
  postalCode?: string;
  city?: string;
  address?: string;
  arrival: string;
  departure: string;
  apartmentType?: string;
  passengers: Array<{ name: string; birthDate: string; address?: string; documentNumber?: string }>;
  travelInsurance: boolean;
  cancellationInsurance: boolean;
  message?: string;
  termsAccepted: boolean;
  newsletterSubscribe?: boolean;
};

export type SubmitBookingResponse = {
  id: number | string;
  status: string;
  /** Barion gateway to send the customer to; null when there is nothing to pay online. */
  paymentUrl?: string | null;
};

export type BookingPaymentStatus = "pending" | "started" | "succeeded" | "failed";

export type BookingPaymentResult = {
  paymentId: string;
  status: BookingPaymentStatus;
  kind: "full" | "deposit";
  amount: number;
  currency: string;
  bookingId: number;
  tourName: string | null;
  canRetry: boolean;
};

/** A booking's details left for later, as the e-mailed link's page asks them. */
export type PendingBookingDetails = {
  bookingId: number;
  tourName: string | null;
  departureDate: string | null;
  customerName: string | null;
  formDataFields: BookingFormField[];
  passengers: Array<{ index: number; title: string; fields: BookingFormField[] }>;
};

export class BookingApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'BookingApiError';
    this.status = status;
  }
}

export class BookingValidationError extends BookingApiError {
  errors: Record<string, string[]>;

  constructor(status: number, message: string, errors: Record<string, string[]>) {
    super(status, message);
    this.name = 'BookingValidationError';
    this.errors = errors;
  }
}

export function submitBooking(payload: SubmitBookingPayload): Promise<SubmitBookingResponse> {
  return request('POST', '/bookings', { ...payload, analytics: getBookingAnalyticsContext(getStoredConsent()) });
}

export function submitApartmentBooking(slug: string, payload: SubmitApartmentBookingPayload): Promise<SubmitBookingResponse> {
  return request('POST', `/portfolio/apartments/${encodeURIComponent(slug)}/bookings`, payload);
}

/** Group quote request for a custom date (min. 20 passengers). */
export function submitTourInquiry(payload: SubmitTourInquiryPayload): Promise<SubmitBookingResponse> {
  return request('POST', '/tour-inquiries', payload);
}

/** Current state of a Barion payment, identified by the id Barion appends to the return URL. */
export async function fetchBookingPayment(paymentId: string): Promise<BookingPaymentResult> {
  const response = await request<{ data: BookingPaymentResult }>(
    'GET',
    `/payments/barion/${encodeURIComponent(paymentId)}`,
  );

  return response.data;
}

/** Starts a new payment in place of a failed one and returns the Barion gateway URL. */
export async function retryBookingPayment(paymentId: string): Promise<string> {
  const response = await request<{ paymentUrl: string }>(
    'POST',
    `/payments/barion/${encodeURIComponent(paymentId)}/retry`,
  );

  return response.paymentUrl;
}

/** The details still to be given for the booking the e-mailed link belongs to. */
export async function fetchPendingBookingDetails(token: string): Promise<PendingBookingDetails> {
  const response = await request<{ data: PendingBookingDetails }>('GET', `/booking-details/${encodeURIComponent(token)}`);

  return response.data;
}

/** Gives the pending details; passengers are keyed by their position in the booking. */
export async function completeBookingDetails(
  token: string,
  payload: { formData: BookingFormData; passengers: Record<number, BookingPassenger> },
): Promise<void> {
  await request('POST', `/booking-details/${encodeURIComponent(token)}`, payload);
}

async function request<T>(method: 'GET' | 'POST', path: string, payload?: unknown): Promise<T> {
  const response = await fetch(`${getPortfolioApiBaseUrl()}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(payload !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    credentials: 'include',
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body?.message === 'string' && body.message.trim() !== ''
        ? body.message
        : `A kérés sikertelen volt (${response.status}).`;

    if (response.status === 422 && body?.errors && typeof body.errors === 'object') {
      throw new BookingValidationError(response.status, message, body.errors as Record<string, string[]>);
    }

    throw new BookingApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
