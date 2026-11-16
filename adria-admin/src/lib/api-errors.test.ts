import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { getValidationSummary } from '@/lib/api-errors';

const validationError = (errors: Record<string, string[]>) =>
  new ApiError('first message', 422, { message: 'first message', errors });

describe('getValidationSummary', () => {
  it('lists the server validation messages', () => {
    const error = validationError({
      'gallery.0.media_id': ['Az egyik galéria sorhoz nincs kép kiválasztva.'],
      'dates.0.end_date': ['Az időpont vége nem lehet korábbi, mint időpont kezdete.'],
    });

    expect(getValidationSummary(error)).toBe(
      'Az egyik galéria sorhoz nincs kép kiválasztva. Az időpont vége nem lehet korábbi, mint időpont kezdete.',
    );
  });

  it('keeps the summary short when many fields failed', () => {
    const error = validationError({
      a: ['Egy.'],
      b: ['Kettő.'],
      c: ['Három.'],
      d: ['Négy.'],
      e: ['Négy.'],
      f: ['Öt.'],
    });

    expect(getValidationSummary(error)).toBe('Egy. Kettő. Három. (És még 2 hiba.)');
  });

  it('says nothing for a failure that is not a validation error', () => {
    expect(getValidationSummary(new ApiError('Server Error', 500, null))).toBeUndefined();
    expect(getValidationSummary(new Error('offline'))).toBeUndefined();
  });
});
