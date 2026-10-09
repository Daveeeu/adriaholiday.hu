/**
 * Marks a tour's search keywords in its description HTML. Matching ignores
 * accents and case and follows Hungarian suffixes ("Róma" marks "Rómában",
 * "Rómából", "római"), but never a longer word: "Róma" leaves "Románia" alone.
 */

const HIGHLIGHT_CLASS_NAME = "bg-transparent font-semibold text-[#00a878]";

/** Case endings (accent-free, as matched) a keyword may carry in running text. */
const HUNGARIAN_SUFFIXES = [
  "ba", "be", "ban", "ben", "bol", "bel", "ra", "re", "rol", "nal", "nel", "hoz", "hez",
  "tol", "ig", "val", "vel", "kent", "nak", "nek", "ert", "on", "en", "n", "t", "ot", "et",
  "at", "i", "ul",
];

const SKIPPED_ELEMENTS = new Set(["A", "MARK", "SCRIPT", "STYLE", "CODE"]);

/** One lower-case, accent-free character per UTF-16 unit, so match offsets stay valid in the original. */
function foldText(text: string): string {
  return text
    .split("")
    .map((char) => char.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()[0] ?? char)
    .join("");
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordPattern(keywords: string[]): RegExp | null {
  const folded = [...new Set(keywords.map((keyword) => foldText(keyword.trim())).filter((keyword) => keyword.length >= 2))]
    .sort((a, b) => b.length - a.length)
    .map((keyword) => escapeRegExp(keyword).replace(/\s+/g, "\\s+"));

  if (folded.length === 0) {
    return null;
  }

  return new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${folded.join("|")})(?:${HUNGARIAN_SUFFIXES.join("|")})?(?![\\p{L}\\p{N}])`,
    "gu",
  );
}

function highlightTextNode(node: Text, pattern: RegExp): void {
  const text = node.data;
  const folded = foldText(text);
  const fragment = node.ownerDocument.createDocumentFragment();
  let cursor = 0;

  for (const match of folded.matchAll(pattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;

    fragment.append(text.slice(cursor, start));
    const mark = node.ownerDocument.createElement("mark");
    mark.className = HIGHLIGHT_CLASS_NAME;
    mark.textContent = text.slice(start, end);
    fragment.append(mark);
    cursor = end;
  }

  if (cursor === 0) {
    return;
  }

  fragment.append(text.slice(cursor));
  node.replaceWith(fragment);
}

function collectTextNodes(root: Node, nodes: Text[]): void {
  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      nodes.push(child as Text);
    } else if (child.nodeType === Node.ELEMENT_NODE && !SKIPPED_ELEMENTS.has((child as Element).tagName)) {
      collectTextNodes(child, nodes);
    }
  }
}

/** Returns a function that marks the keywords in an HTML fragment; the input is returned as is without keywords. */
export function createKeywordHighlighter(keywords: string[]): (html: string) => string {
  const pattern = keywordPattern(keywords);

  if (pattern === null || typeof DOMParser === "undefined") {
    return (html) => html;
  }

  const cache = new Map<string, string>();

  return (html) => {
    const cached = cache.get(html);

    if (cached !== undefined) {
      return cached;
    }

    const document = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
    const textNodes: Text[] = [];
    collectTextNodes(document.body, textNodes);
    textNodes.forEach((node) => highlightTextNode(node, pattern));

    const result = document.body.innerHTML;
    cache.set(html, result);

    return result;
  };
}
