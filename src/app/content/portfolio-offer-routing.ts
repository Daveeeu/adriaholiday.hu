const CATEGORY_PREFIX = '/kategoriak/';

function resolveCategorySlugFromOfferLink(value: string) {
  const withoutQuery = value.split('?')[0].split('#')[0];
  const normalized = withoutQuery.replace(/\/+$/, '');
  const segments = normalized.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? normalized;
}

/**
 * The page a homepage card leads to: a path of this site other than a category
 * page (e.g. an apartment location) as it is, anything else (a category path or
 * a bare category slug) as that category's page.
 */
export function homepageCardRoute(link: string) {
  const trimmed = link.trim();

  if (trimmed.startsWith('/') && !trimmed.startsWith(CATEGORY_PREFIX)) {
    return trimmed;
  }

  return `${CATEGORY_PREFIX}${resolveCategorySlugFromOfferLink(trimmed)}`;
}

/** An absolute web address (e.g. a partner site) rather than a page of this site. */
export function isExternalLink(value: string) {
  return /^https?:\/\//i.test(value.trim());
}
