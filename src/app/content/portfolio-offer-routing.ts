export function resolveCategorySlugFromOfferLink(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const withoutQuery = trimmed.split('?')[0].split('#')[0];
  const normalized = withoutQuery.replace(/\/+$/, '');
  const segments = normalized.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? normalized;
}

/** An absolute web address (e.g. a partner site) rather than a page of this site. */
export function isExternalLink(value: string) {
  return /^https?:\/\//i.test(value.trim());
}
