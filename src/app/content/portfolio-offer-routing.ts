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
