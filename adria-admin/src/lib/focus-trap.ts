const TABBABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/** The elements inside the container that Tab reaches, in page order. */
export function getTabbableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR),
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.closest('[inert]') &&
      element.getClientRects().length > 0,
  );
}

/**
 * Where Tab should move focus to keep it inside a trapped area, or null when
 * the browser's own move stays inside. `currentIndex` is -1 when the focus is
 * on the area itself rather than on one of its elements.
 */
export function getWrappedFocusIndex(
  currentIndex: number,
  count: number,
  backwards: boolean,
): number | null {
  if (count === 0) {
    return null;
  }

  if (backwards) {
    return currentIndex <= 0 ? count - 1 : null;
  }

  return currentIndex === -1 || currentIndex === count - 1 ? 0 : null;
}

/** Keeps Tab and Shift+Tab cycling inside the container. */
export function trapTabKey(
  event: Pick<KeyboardEvent, 'shiftKey' | 'preventDefault'>,
  container: HTMLElement,
) {
  const tabbable = getTabbableElements(container);

  if (tabbable.length === 0) {
    event.preventDefault();
    return;
  }

  const currentIndex = tabbable.indexOf(document.activeElement as HTMLElement);
  const targetIndex = getWrappedFocusIndex(
    currentIndex,
    tabbable.length,
    event.shiftKey,
  );

  if (targetIndex !== null) {
    event.preventDefault();
    tabbable[targetIndex].focus();
  }
}
