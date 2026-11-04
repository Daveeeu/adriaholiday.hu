export { formatDate, formatDateTime } from '@/lib/date-format';

export function formatMoney(value: number) {
  return `${new Intl.NumberFormat('hu-HU').format(value)} Ft`;
}

export function toInputDate(value?: string | null) {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}
