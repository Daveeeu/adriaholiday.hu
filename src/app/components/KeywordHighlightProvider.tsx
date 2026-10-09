import { useMemo, type ReactNode } from "react";

import { KeywordHighlightContext } from "../content/keyword-highlight-context";
import { createKeywordHighlighter } from "../lib/keywordHighlight";

/** Highlights the given search keywords in every rich text description rendered inside. */
export default function KeywordHighlightProvider({ keywords, children }: { keywords: string[]; children: ReactNode }) {
  const highlight = useMemo(() => createKeywordHighlighter(keywords), [keywords]);

  return <KeywordHighlightContext.Provider value={highlight}>{children}</KeywordHighlightContext.Provider>;
}
