import { useCallback, useEffect, useState } from "react";

/**
 * Whether an element is on screen. Returns a callback ref to put on the
 * element, so an element that appears later (or is swapped) is followed too.
 */
export function useInView<T extends Element>(): [(element: T | null) => void, boolean] {
  const [element, setElement] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useCallback((node: T | null) => setElement(node), []);

  useEffect(() => {
    if (!element) {
      setInView(false);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));

    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return [ref, inView];
}
