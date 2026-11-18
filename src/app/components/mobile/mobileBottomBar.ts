import { useEffect, useSyncExternalStore } from "react";

/**
 * The bottom of a phone screen holds one bar at a time. The site-wide call to
 * action bar steps aside while a page's own bar (the booking form's price and
 * button) is on screen and has claimed the place.
 */
let claims = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function claimMobileBottomBar(): () => void {
  claims += 1;
  emit();

  return () => {
    claims -= 1;
    emit();
  };
}

/** Whether a page's own bar holds the bottom of the screen right now. */
export function useMobileBottomBarClaimed(): boolean {
  return useSyncExternalStore(subscribe, () => claims > 0, () => false);
}

/** Holds the bottom of the screen while `onScreen` is true, i.e. while the page's own bar is on screen. */
export function useClaimMobileBottomBar(onScreen: boolean) {
  useEffect(() => (onScreen ? claimMobileBottomBar() : undefined), [onScreen]);
}
