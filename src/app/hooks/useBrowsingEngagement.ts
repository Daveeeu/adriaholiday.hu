import { useEffect, useState } from "react";

/**
 * Whether the visitor has been reading the page: it has been on screen for
 * `visibleMs` in all (time in a background tab does not count) and they have
 * scrolled it. Stays false while `enabled` is false.
 */
export function useBrowsingEngagement(visibleMs: number, enabled = true): boolean {
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    if (!enabled || engaged) {
      return;
    }

    let visibleFor = 0;
    let visibleSince = document.visibilityState === "visible" ? performance.now() : null;
    let scrolled = window.scrollY > 0;
    let timer: number | undefined;

    function check() {
      const now = performance.now();
      const total = visibleFor + (visibleSince !== null ? now - visibleSince : 0);

      window.clearTimeout(timer);
      if (scrolled && total >= visibleMs) {
        setEngaged(true);
      } else if (visibleSince !== null) {
        timer = window.setTimeout(check, Math.max(visibleMs - total, 250));
      }
    }

    function onScroll() {
      if (!scrolled) {
        scrolled = true;
        check();
      }
    }

    function onVisibilityChange() {
      const now = performance.now();

      if (document.visibilityState === "visible") {
        visibleSince ??= now;
      } else if (visibleSince !== null) {
        visibleFor += now - visibleSince;
        visibleSince = null;
      }
      check();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    check();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [visibleMs, enabled, engaged]);

  return engaged;
}
