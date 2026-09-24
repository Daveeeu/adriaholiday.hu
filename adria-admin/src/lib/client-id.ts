/**
 * Generates a random RFC 4122 v4 UUID for client-side identifiers.
 *
 * `crypto.randomUUID` is only exposed in secure contexts (HTTPS or localhost),
 * so the admin would crash when served over plain HTTP (e.g. a LAN address).
 * `crypto.getRandomValues` is available in every context and is used as fallback.
 */
export function createClientId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
