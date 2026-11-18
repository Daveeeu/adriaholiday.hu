import { describe, expect, it } from 'vitest';

import { defaultTourDateCapacity } from './tour-date-capacity';

describe('defaultTourDateCapacity', () => {
  it('gives flying tours a plane allotment', () => {
    expect(defaultTourDateCapacity('plane')).toBe(22);
  });

  it('gives every other tour a full coach', () => {
    expect(defaultTourDateCapacity('bus')).toBe(45);
    expect(defaultTourDateCapacity('train')).toBe(45);
    expect(defaultTourDateCapacity('')).toBe(45);
  });
});
