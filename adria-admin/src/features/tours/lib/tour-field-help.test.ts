import { describe, expect, it } from 'vitest';

import { getTourFieldHelp, tourFieldHelpKey } from './tour-field-help';

describe('tour field help', () => {
  it('drops the row indices of a field path', () => {
    expect(tourFieldHelpKey('dates.3.priceBox.label')).toBe(
      'dates.priceBox.label',
    );
    expect(tourFieldHelpKey('departurePlaceFees.12')).toBe(
      'departurePlaceFees',
    );
  });

  it("finds the user guide's entry for a field, in any row", () => {
    expect(getTourFieldHelp('priceBox.discountText')?.name).toBe(
      'Ár alatti szöveg',
    );
    expect(getTourFieldHelp('dates.0.priceBox.originalPrice')?.name).toBe(
      'Eredeti ár (áthúzva)',
    );
    expect(getTourFieldHelp('programDays.2.badges.1.text')?.name).toBe(
      'Badge-ek',
    );
  });

  it('has no entry for a field the guide does not describe', () => {
    expect(getTourFieldHelp('sliderText')).toBeUndefined();
  });
});
