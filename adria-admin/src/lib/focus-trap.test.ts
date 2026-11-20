import { describe, expect, it } from 'vitest';

import { getWrappedFocusIndex } from './focus-trap';

describe('getWrappedFocusIndex', () => {
  it('lets the browser move between the elements in the middle', () => {
    expect(getWrappedFocusIndex(1, 4, false)).toBeNull();
    expect(getWrappedFocusIndex(2, 4, true)).toBeNull();
  });

  it('wraps Tab from the last element to the first', () => {
    expect(getWrappedFocusIndex(3, 4, false)).toBe(0);
  });

  it('wraps Shift+Tab from the first element to the last', () => {
    expect(getWrappedFocusIndex(0, 4, true)).toBe(3);
  });

  it('moves into the area when the area itself has the focus', () => {
    expect(getWrappedFocusIndex(-1, 4, false)).toBe(0);
    expect(getWrappedFocusIndex(-1, 4, true)).toBe(3);
  });

  it('has nowhere to go in an area without focusable elements', () => {
    expect(getWrappedFocusIndex(-1, 0, false)).toBeNull();
  });
});
