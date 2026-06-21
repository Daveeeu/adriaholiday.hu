export const HOMEPAGE_OFFER_LANGUAGES = ['hu', 'en', 'de'] as const;

export const HOMEPAGE_OFFER_LANGUAGE_LABELS = {
  hu: 'Magyar',
  en: 'Angol',
  de: 'Német',
} as const;

export function slugifyHomepageOffer(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
