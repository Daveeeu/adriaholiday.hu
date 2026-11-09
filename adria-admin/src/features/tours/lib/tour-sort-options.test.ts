import { describe, expect, it } from 'vitest';

import { fromTourSortValue, getTourSortDetail, toTourSortValue } from './tour-sort-options';
import type { Tour } from './tours.types';

const tour = (fields: Partial<Tour>) => fields as Tour;

describe('tour sort options', () => {
  it('finds the option of the current sort', () => {
    expect(toTourSortValue({ id: 'price', desc: true })).toBe('price:desc');
  });

  it('has no option for a sort chosen in a column header', () => {
    expect(toTourSortValue({ id: 'regionId', desc: false })).toBe('');
  });

  it('turns an option back into a sort', () => {
    expect(fromTourSortValue('bookingsCount:desc')).toEqual({ id: 'bookingsCount', desc: true });
  });

  it('explains the sorted value, also when there is none', () => {
    expect(getTourSortDetail(tour({ lastBookingAt: null }), 'lastBookingAt')).toBe('Még nincs foglalás');
    expect(getTourSortDetail(tour({ bookingsCount: 3 }), 'bookingsCount')).toBe('Foglalások: 3');
    expect(getTourSortDetail(tour({}), 'name')).toBeNull();
  });
});
