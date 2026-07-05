import { useEffect, useState } from "react";

const cache = new Map<string, unknown>();

/**
 * Fetches a Lottie JSON file from /public/lottie at runtime instead of
 * bundling it into the JS chunk, since these animation files run 70KB-900KB
 * each and would otherwise bloat whichever component statically imports them.
 */
export function useLottieAnimation(fileName: string): unknown | null {
  const [data, setData] = useState<unknown | null>(() => cache.get(fileName) ?? null);

  useEffect(() => {
    const cached = cache.get(fileName);
    if (cached) {
      setData(cached);
      return;
    }

    let cancelled = false;

    fetch(`${import.meta.env.BASE_URL}lottie/${fileName}`)
      .then((response) => response.json())
      .then((json) => {
        if (cancelled) return;
        cache.set(fileName, json);
        setData(json);
      })
      .catch(() => {
        // Animation is decorative; silently skip on fetch failure.
      });

    return () => {
      cancelled = true;
    };
  }, [fileName]);

  return data;
}
