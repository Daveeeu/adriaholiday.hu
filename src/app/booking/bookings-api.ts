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
  type?: 'tour_booking' | 'tour_inquiry';
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

export async function submitBooking(payload: SubmitBookingPayload): Promise<SubmitBookingResponse> {
  const response = await fetch(`${getPortfolioApiBaseUrl()}/bookings`, {
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
        : `A foglalás beküldése sikertelen volt (${response.status}).`;

    if (response.status === 422 && body?.errors && typeof body.errors === 'object') {
      throw new BookingValidationError(response.status, message, body.errors as Record<string, string[]>);
    }

    throw new BookingApiError(response.status, message);
  }

  return (await response.json()) as SubmitBookingResponse;
}
