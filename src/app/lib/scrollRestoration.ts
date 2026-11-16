/** React Router's key for the first history entry of every page load. */
const PAGE_LOAD_ENTRY_KEY = "default";

export const SCROLL_POSITIONS_STORAGE_KEY = "adria:scroll-positions";

type PositionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Makes a page load start at the top. React Router saves the first entry of
 * every page load under the same key, so a page loaded later in the tab (back
 * to Google, then the next result; a reload) jumped to the previous one's
 * position while its content was still loading: the short page clamped the
 * position and showed the footer, which the content then pushed away.
 * Positions of entries visited within the site still restore on back/forward.
 * Runs before <ScrollRestoration> reads the saved positions.
 */
export function forgetPageLoadScrollPosition(getStorage: () => PositionStorage = () => window.sessionStorage) {
  let storage: PositionStorage;

  try {
    storage = getStorage();
  } catch {
    // Blocked storage: <ScrollRestoration> cannot restore anything either.
    return;
  }

  try {
    const positions = JSON.parse(storage.getItem(SCROLL_POSITIONS_STORAGE_KEY) ?? "{}");

    if (PAGE_LOAD_ENTRY_KEY in positions) {
      delete positions[PAGE_LOAD_ENTRY_KEY];
      storage.setItem(SCROLL_POSITIONS_STORAGE_KEY, JSON.stringify(positions));
    }
  } catch {
    // Unreadable positions or a full storage: start over.
    storage.removeItem(SCROLL_POSITIONS_STORAGE_KEY);
  }
}
