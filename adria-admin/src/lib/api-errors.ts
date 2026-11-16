import { ApiError } from '@/lib/api-client';

/** How many validation messages are listed before the summary gets too long to read. */
const MAX_LISTED_ERRORS = 3;

/**
 * Why the server rejected a form (422): its own validation messages, the
 * first few of them, or nothing for any other failure.
 */
export function getValidationSummary(error: unknown): string | undefined {
  if (!(error instanceof ApiError) || error.status !== 422) {
    return undefined;
  }

  const errors = (error.payload as { errors?: Record<string, unknown> } | null)?.errors ?? {};
  const messages = [
    ...new Set(
      Object.values(errors)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((message): message is string => typeof message === 'string' && message.trim() !== ''),
    ),
  ];

  if (messages.length === 0) {
    return error.message || undefined;
  }

  const rest = messages.length - MAX_LISTED_ERRORS;

  return [...messages.slice(0, MAX_LISTED_ERRORS), ...(rest > 0 ? [`(És még ${rest} hiba.)`] : [])].join(' ');
}
