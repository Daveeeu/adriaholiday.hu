import { createContext, useContext } from "react";

const unchanged = (html: string) => html;

/** Marks the current tour's search keywords in description HTML; outside a trip page it leaves HTML unchanged. */
export const KeywordHighlightContext = createContext<(html: string) => string>(unchanged);

export function useKeywordHighlight(): (html: string) => string {
  return useContext(KeywordHighlightContext);
}
