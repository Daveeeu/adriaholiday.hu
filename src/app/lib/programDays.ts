/** A block opening a program day: "1. NAP …", "2. nap: …". */
const DAY_START = /^\s*\d{1,2}\.\s*nap\b/i;

/**
 * A program written as one block split into its days, each part starting
 * with its "N. nap" block (the first also keeping what stands before it);
 * the whole program as one part when it has fewer than two days.
 */
export function splitProgramDays(html: string): string[] {
  if (typeof DOMParser === "undefined") {
    return [html];
  }

  const blocks = Array.from(new DOMParser().parseFromString(`<body>${html}</body>`, "text/html").body.childNodes);
  const parts: string[] = [];
  let current = "";
  let days = 0;

  for (const block of blocks) {
    const startsDay = block.nodeType === Node.ELEMENT_NODE && DAY_START.test(block.textContent ?? "");

    if (startsDay) {
      days++;

      if (days > 1) {
        parts.push(current);
        current = "";
      }
    }

    current += block.nodeType === Node.ELEMENT_NODE ? (block as Element).outerHTML : (block.textContent ?? "");
  }

  parts.push(current);

  return days > 1 ? parts : [html];
}
