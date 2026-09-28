import { getPortfolioApiBaseUrl } from '../content/portfolio-api';

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
  extraIds?: number[];
  extraChoices?: Record<number, string>;
  travelInsurance?: boolean;
  cancellationInsurance?: boolean;
  type?: 'tour_booking' | 'tour_inquiry';
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
  return post('/bookings', payload);
}

/** Group quote request for a custom date (min. 20 passengers). */
export function submitTourInquiry(payload: SubmitTourInquiryPayload): Promise<SubmitBookingResponse> {
  return post('/tour-inquiries', payload);
}

async function post(path: string, payload: unknown): Promise<SubmitBookingResponse> {
  const response = await fetch(`${getPortfolioApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body?.message === 'string' && body.message.trim() !== ''
        ? body.message
        : `A beküldés sikertelen volt (${response.status}).`;

    if (response.status === 422 && body?.errors && typeof body.errors === 'object') {
      throw new BookingValidationError(response.status, message, body.errors as Record<string, string[]>);
    }

    throw new BookingApiError(response.status, message);
  }

  return (await response.json()) as SubmitBookingResponse;
}
