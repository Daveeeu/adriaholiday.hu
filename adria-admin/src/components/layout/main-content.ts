/** The id of the admin's main content area, the target of the skip link. */
export const MAIN_CONTENT_ID = 'main-content';

/** Moves the keyboard focus to the start of the main content area. */
export function focusMainContent() {
  document.getElementById(MAIN_CONTENT_ID)?.focus({ preventScroll: true });
}
