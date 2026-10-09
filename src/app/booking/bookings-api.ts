import { getPortfolioApiBaseUrl } from '../content/portfolio-api';
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
  return request('POST', '/bookings', payload);
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

  return (await response.json()) as T;
}
