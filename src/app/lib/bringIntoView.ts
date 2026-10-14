/**
 * Marks a fixed header or a sticky bar: content scrolled into view is kept
 * below whatever of these currently covers the top of the screen.
 */
export const STICKY_TOP_ATTRIBUTE = "data-sticky-top";

export const stickyTop = { [STICKY_TOP_ATTRIBUTE]: "" };

/** The space kept between the covered top of the screen and an element taller than the rest. */
const GAP = 16;

/** How far down the fixed header and the bars stuck to the top reach. */
function coveredTop(): number {
  return Array.from(document.querySelectorAll<HTMLElement>(`[${STICKY_TOP_ATTRIBUTE}]`)).reduce((bottom, element) => {
    const rect = element.getBoundingClientRect();
    const stuckAt = Number.parseFloat(getComputedStyle(element).top);
    // A sticky bar covers the top only while it is stuck there, and a hidden header not at all.
    const covering = rect.height > 0 && Number.isFinite(stuckAt) && Math.abs(rect.top - stuckAt) < 1;

    return covering ? Math.max(bottom, rect.bottom) : bottom;
  }, 0);
}

/**
 * Scrolls the element to the middle of the visible part of the screen (or,
 * when taller than that, its top just below the header) and moves focus to
 * `focusTarget`, so the visitor cannot miss what changed.
 */
export function bringIntoView(element: HTMLElement, focusTarget: HTMLElement = element): void {
  const top = coveredTop();
  const visibleHeight = window.innerHeight - top;
  const rect = element.getBoundingClientRect();
  const offset = rect.height + GAP * 2 <= visibleHeight ? (visibleHeight - rect.height) / 2 : GAP;

  window.scrollTo({ top: window.scrollY + rect.top - top - offset, behavior: "smooth" });
  focusTarget.focus({ preventScroll: true });
}
