import { describe, expect, it } from 'vitest';

import {
  collectFormErrorMessages,
  tourFormPathForServerKey,
} from './tour-form-errors';
import { tourFormSectionsWithErrors } from './tour-form-sections';

describe('tourFormPathForServerKey', () => {
  it('turns the snake case keys the API validates into the form fields', () => {
    expect(tourFormPathForServerKey('name')).toBe('name');
    expect(tourFormPathForServerKey('seo_name')).toBe('seoName');
    expect(tourFormPathForServerKey('program_days.2.title')).toBe(
      'programDays.2.title',
    );
    expect(tourFormPathForServerKey('dates.0.extras.1.price')).toBe(
      'dates.0.extras.1.price',
    );
  });

  it('puts the price box columns under the price box', () => {
    expect(tourFormPathForServerKey('price_box_discount_text')).toBe(
      'priceBox.discountText',
    );
    expect(tourFormPathForServerKey('dates.3.price_box_label')).toBe(
      'dates.3.priceBox.label',
    );
  });
});

describe('collectFormErrorMessages', () => {
  it('lists each nested message once, without walking into the field elements', () => {
    const element = { tagName: 'INPUT' };
    const errors = {
      name: {
        type: 'too_small',
        message: 'A név megadása kötelező.',
        ref: element,
      },
      dates: [
        { endDate: { type: 'server', message: 'Hibás dátum.' } },
        { endDate: { type: 'server', message: 'Hibás dátum.' } },
      ],
    };

    expect(collectFormErrorMessages(errors as never)).toEqual([
      'A név megadása kötelező.',
      'Hibás dátum.',
    ]);
  });
});

describe('tourFormSectionsWithErrors', () => {
  it('names the sections whose fields have errors', () => {
    const errors = {
      name: { type: 'too_small', message: 'A név megadása kötelező.' },
      seoTitle: { type: 'too_big', message: 'Legfeljebb 255 karakter.' },
      dates: [
        {
          capacity: {
            type: 'invalid_string',
            message: 'Adj meg egy nem negatív egész számot.',
          },
        },
      ],
    };

    expect(tourFormSectionsWithErrors(errors as never)).toEqual([
      'seo',
      'dates',
    ]);
  });
});
