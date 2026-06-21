import { hu } from '@/i18n/hu';

export type Locale = 'hu' | 'en' | 'de';

const dictionaries: Record<Locale, Record<string, string>> = {
  hu,
  en: hu,
  de: hu,
};

let currentLocale: Locale = 'hu';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale() {
  return currentLocale;
}

export function t(key: string, params?: Record<string, string | number>) {
  const dictionary = dictionaries[currentLocale] ?? dictionaries.hu;
  const template = dictionary[key] ?? key;

  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (value, [paramKey, paramValue]) =>
      value.replaceAll(`{{${paramKey}}}`, String(paramValue)),
    template,
  );
}
