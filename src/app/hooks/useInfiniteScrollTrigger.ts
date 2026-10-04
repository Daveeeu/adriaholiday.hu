import { useEffect, useRef } from "react";

type InfiniteScrollTriggerOptions = {
  enabled: boolean;
  onTrigger: () => void;
  /** How far before the sentinel enters the viewport the next load starts. */
  rootMargin?: string;
};

/**
 * Calls `onTrigger` whenever the returned sentinel element scrolls into view
 * while `enabled` is true. Attach the ref to an element placed after the list.
 */
export function useInfiniteScrollTrigger<T extends Element>({
  enabled,
  onTrigger,
  rootMargin = "600px 0px",
}: InfiniteScrollTriggerOptions) {
  const sentinelRef = useRef<T | null>(null);
  const onTriggerRef = useRef(onTrigger);

  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!enabled || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onTriggerRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return sentinelRef;
}
