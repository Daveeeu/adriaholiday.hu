export const BUS_LANGUAGES = ['hu', 'en', 'de'] as const;

export const BUS_LANGUAGE_LABELS = {
  hu: 'Magyar',
  en: 'Angol',
  de: 'Német',
} as const;

export const BUS_VEHICLE_OPTIONS = [
  { value: 'man-lions-coach-r08-2019', label: 'Man Lions Coach R08 2019' },
  { value: 'neoplan-tourliner', label: 'Neoplan Tourliner' },
  { value: 'scania-touring-hd', label: 'Scania Touring HD' },
  { value: 'setra-s516-hd', label: 'Setra S 516 HD' },
  { value: 'volvo-9700', label: 'Volvo 9700' },
] as const;

export function slugifyBusText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
