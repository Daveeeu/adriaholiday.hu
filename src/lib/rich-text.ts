const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'div',
  'em',
  'h2',
  'h3',
  'h4',
  'i',
  'li',
  'ol',
  'p',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]);

/** Tags that may carry an id, the target of an in-page link (as the backend keeps them). */
const ANCHOR_TAGS = new Set(['a', 'h2', 'h3']);
const ANCHOR_ID = /^[a-z][a-z0-9_-]{0,63}$/;

function sanitizeAttribute(tagName: string, name: string, value: string): string | null {
  if (name === 'id') {
    return ANCHOR_TAGS.has(tagName) && ANCHOR_ID.test(value) ? value : null;
  }

  if (name === 'href') {
    const trimmed = value.trim();

    if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) {
      return trimmed;
    }

    return null;
  }

  if (name === 'target') {
    return value === '_blank' ? '_blank' : null;
  }

  if (name === 'rel') {
    return value
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => ['noopener', 'noreferrer', 'nofollow'].includes(part))
      .join(' ');
  }

  if (name === 'class' && tagName === 'span') {
    return null;
  }

  if (name === 'style') {
    return null;
  }

  if ((tagName === 'td' || tagName === 'th') && (name === 'colspan' || name === 'rowspan')) {
    return /^[1-9]\d?$/.test(value) ? value : null;
  }

  return null;
}

function sanitizeNode(node: Node, document: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent ?? '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();

  if (!ALLOWED_TAGS.has(tagName)) {
    const fragment = document.createDocumentFragment();

    element.childNodes.forEach((child) => {
      const sanitizedChild = sanitizeNode(child, document);
      if (sanitizedChild) {
        fragment.appendChild(sanitizedChild);
      }
    });

    return fragment;
  }

  const next = document.createElement(tagName);

  Array.from(element.attributes).forEach((attribute) => {
    const sanitized = sanitizeAttribute(tagName, attribute.name.toLowerCase(), attribute.value);

    if (sanitized !== null && sanitized !== '') {
      next.setAttribute(attribute.name.toLowerCase(), sanitized);
    }
  });

  element.childNodes.forEach((child) => {
    const sanitizedChild = sanitizeNode(child, document);
    if (sanitizedChild) {
      next.appendChild(sanitizedChild);
    }
  });

  return next;
}

export function sanitizeRichTextHtml(value?: string | null): string {
  const normalized = (value ?? '').trim();

  if (normalized === '') {
    return '';
  }

  const parser = new DOMParser();
  const source = parser.parseFromString(normalized, 'text/html');
  const output = document.createElement('div');

  source.body.childNodes.forEach((node) => {
    const sanitized = sanitizeNode(node, document);
    if (sanitized) {
      output.appendChild(sanitized);
    }
  });

  return output.innerHTML.trim();
}

export function isRichTextEmpty(value?: string | null): boolean {
  const sanitized = sanitizeRichTextHtml(value);

  if (sanitized === '') {
    return true;
  }

  const text = new DOMParser().parseFromString(sanitized, 'text/html').body.textContent ?? '';

  return text.replace(/\s+/g, '').trim() === '';
}
