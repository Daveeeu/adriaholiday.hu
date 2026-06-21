export const BLOG_LANGUAGES = ['hu', 'en', 'de'] as const;

export const BLOG_LANGUAGE_LABELS = {
  hu: 'Magyar',
  en: 'Angol',
  de: 'Német',
} as const;

export const BLOG_CATEGORY_COLUMNS = [
  { value: '1', label: '1. oszlop' },
  { value: '2', label: '2. oszlop' },
  { value: '3', label: '3. oszlop' },
] as const;

export function slugifyBlogText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
