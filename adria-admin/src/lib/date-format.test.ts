import { describe, expect, it } from 'vitest';

import { formatDate, formatDateTime } from './date-format';

describe('date-format', () => {
  it('formats dates the same way everywhere', () => {
    expect(formatDate('2026-11-08')).toBe('2026. 11. 08.');
  });

  it('adds the time when there is one', () => {
    expect(formatDateTime('2026-11-08T15:17:00')).toBe('2026. 11. 08. 15:17');
  });

  it('shows a dash for a missing date and leaves unreadable text as it is', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDateTime('')).toBe('—');
    expect(formatDate('nem dátum')).toBe('nem dátum');
  });
});
