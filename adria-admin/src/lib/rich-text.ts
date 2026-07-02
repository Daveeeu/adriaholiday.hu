const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'span',
]);

const ALLOWED_STYLES = new Set([
  'color',
  'background-color',
  'text-align',
  'font-size',
  'font-family',
]);

const ALLOWED_TEXT_ALIGN = new Set(['left', 'center', 'right', 'justify']);

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function normalizeRichTextInput(value?: string | null): string {
  if (value == null) {
    return '';
  }

  const trimmed = value.trim();

  if (trimmed === '') {
    return '';
  }

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  return `<p>${escapeHtml(trimmed).replaceAll(/\r?\n/g, '<br>')}</p>`;
}

export function sanitizeRichTextHtml(value?: string | null): string {
  const normalized = normalizeRichTextInput(value);

  if (normalized === '') {
    return '';
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return normalized;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(
    `<div id="rich-text-root">${normalized}</div>`,
    'text/html',
  );
  const root = document.getElementById('rich-text-root');

  if (!root) {
    return normalized;
  }

  const output = document.createElement('div');

  const appendNode = (source: Node, target: Element): void => {
    if (source.nodeType === Node.TEXT_NODE) {
      target.appendChild(document.createTextNode(source.textContent ?? ''));
      return;
    }

    if (source.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = source as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      Array.from(element.childNodes).forEach((child) => appendNode(child, target));
      return;
    }

    const next = document.createElement(tag);

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const attributeValue = attribute.value.trim();

      if (name.startsWith('on')) {
        return;
      }

      if (name === 'style') {
        const sanitizedStyle = sanitizeStyle(attributeValue);
        if (sanitizedStyle) {
          next.setAttribute('style', sanitizedStyle);
        }
        return;
      }

      if (tag === 'a' && ['href', 'target', 'rel', 'title'].includes(name)) {
        const sanitizedValue =
          name === 'href'
            ? sanitizeHref(attributeValue)
            : name === 'target'
              ? sanitizeTarget(attributeValue)
              : name === 'rel'
                ? sanitizeRel(attributeValue, element)
                : attributeValue || null;

        if (sanitizedValue) {
          next.setAttribute(name, sanitizedValue);
        }
      }
    });

    Array.from(element.childNodes).forEach((child) => appendNode(child, next));
    target.appendChild(next);
  };

  Array.from(root.childNodes).forEach((child) => appendNode(child, output));

  return output.innerHTML.trim();
}

function sanitizeStyle(style: string): string | null {
  const styles = new Map<string, string>();

  style
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const separator = entry.indexOf(':');

      if (separator === -1) {
        return;
      }

      const property = entry.slice(0, separator).trim().toLowerCase();
      const value = entry.slice(separator + 1).trim();

      if (!ALLOWED_STYLES.has(property)) {
        return;
      }

      const sanitizedValue = sanitizeStyleValue(property, value);
      if (sanitizedValue) {
        styles.set(property, sanitizedValue);
      }
    });

  if (styles.size === 0) {
    return null;
  }

  return Array.from(styles.entries())
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ');
}

function sanitizeStyleValue(property: string, value: string): string | null {
  if (/[;{}<>]/.test(value) || /url\s*\(|expression\s*\(/i.test(value)) {
    return null;
  }

  if (property === 'text-align') {
    return ALLOWED_TEXT_ALIGN.has(value.toLowerCase()) ? value.toLowerCase() : null;
  }

  if (property === 'font-size') {
    return /^\d+(?:\.\d+)?(px|rem|em|%)$/i.test(value) ? value : null;
  }

  if (property === 'font-family') {
    return /^[a-z0-9\s,"'\-]+$/i.test(value) ? value : null;
  }

  return /^(#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z][a-z-]*)$/i.test(value)
    ? value
    : null;
}

function sanitizeHref(value: string): string | null {
  const trimmed = value.trim();

  if (
    trimmed === '' ||
    /^(javascript|vbscript|data):/i.test(trimmed)
  ) {
    return null;
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? trimmed : null;
  } catch {
    return null;
  }
}

function sanitizeTarget(value: string): string | null {
  return ['_blank', '_self', '_parent', '_top'].includes(value) ? value : null;
}

function sanitizeRel(value: string, source: HTMLElement): string | null {
  const rel = Array.from(
    new Set(
      value
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  );

  if (rel.length === 0 && source.getAttribute('target') === '_blank') {
    return 'noopener noreferrer';
  }

  return rel.length > 0 ? rel.join(' ') : null;
}

export function richTextBlockClassName(className = ''): string {
  return [
    'space-y-3 leading-6',
    '[&_p]:mb-3 [&_p:last-child]:mb-0',
    '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6',
    '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6',
    '[&_li]:my-1',
    '[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic',
    '[&_h2]:my-4 [&_h2]:text-xl [&_h2]:font-semibold',
    '[&_h3]:my-3 [&_h3]:text-lg [&_h3]:font-semibold',
    '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}
