import { useEffect, useState } from "react";

import { PortfolioApiError } from "../content/portfolio-api";

export type PortfolioResource<T> =
  | { status: "loading"; data: T | null }
  | { status: "ready"; data: T }
  | { status: "notFound"; data: null }
  | { status: "error"; data: null };

/**
 * Loads a portfolio API resource whenever its key changes. While a new key
 * loads, the previous data stays available (no flash of an empty list); a
 * 404 is told apart from other failures. A response for an earlier key is
 * dropped.
 */
export function usePortfolioResource<T>(key: string | null, load: () => Promise<T>): PortfolioResource<T> {
  const [state, setState] = useState<PortfolioResource<T>>({ status: "loading", data: null });

  useEffect(() => {
    if (key === null) {
      setState({ status: "notFound", data: null });

      return;
    }

    let cancelled = false;
    setState((current) => ({ status: "loading", data: current.data }));

    load().then(
      (data) => {
        if (!cancelled) {
          setState({ status: "ready", data });
        }
      },
      (error: unknown) => {
        if (!cancelled) {
          setState({ status: error instanceof PortfolioApiError && error.status === 404 ? "notFound" : "error", data: null });
        }
      },
    );

    return () => {
      cancelled = true;
    };
    // The key identifies what load() fetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
