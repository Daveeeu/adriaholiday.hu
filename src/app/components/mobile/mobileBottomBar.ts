import { type RefObject, useEffect, useSyncExternalStore } from "react";

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

/** Holds the bottom of the screen for as long as the given bar is on screen. */
export function useClaimMobileBottomBar(barRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const bar = barRef.current;

    if (!bar) {
      return;
    }

    let release: (() => void) | null = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !release) {
        release = claimMobileBottomBar();
      } else if (!entry.isIntersecting && release) {
        release();
        release = null;
      }
    });

    observer.observe(bar);

    return () => {
      observer.disconnect();
      release?.();
    };
  }, [barRef]);
}
