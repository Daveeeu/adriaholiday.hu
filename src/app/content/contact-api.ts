import { getPortfolioApiBaseUrl } from './portfolio-api';

export type ContactMessageInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
  privacyAccepted: boolean;
  /** Honeypot: stays empty for people. */
  website: string;
};

export type ContactMessageErrors = Partial<Record<'name' | 'email' | 'phone' | 'message' | 'privacy_accepted', string>>;

export class ContactMessageValidationError extends Error {
  constructor(public readonly errors: ContactMessageErrors) {
    super('Validation failed');
  }
}

export async function sendContactMessage(input: ContactMessageInput): Promise<void> {
  const response = await fetch(`${getPortfolioApiBaseUrl()}/contact-messages`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (response.status === 422) {
    const payload = (await response.json()) as { errors?: Record<string, string[]> };
    const errors = Object.fromEntries(
      Object.entries(payload.errors ?? {}).map(([field, messages]) => [field, messages[0] ?? '']),
    ) as ContactMessageErrors;

    throw new ContactMessageValidationError(errors);
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
}
