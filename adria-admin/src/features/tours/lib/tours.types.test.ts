import { describe, expect, it } from 'vitest';

import { mapTourToFormValues } from './tours.types';

describe('mapTourToFormValues', () => {
  it('turns the API numeric departure place ids into the string ids the form looks names up by', () => {
    const values = mapTourToFormValues({ departurePlaceIds: [11, 21] });

    expect(values.departurePlaceIds).toEqual(['11', '21']);
  });

  it('starts a new tour without departure places', () => {
    expect(mapTourToFormValues().departurePlaceIds).toEqual([]);
  });
});
