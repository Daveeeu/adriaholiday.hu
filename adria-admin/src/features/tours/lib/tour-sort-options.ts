import { formatDate } from '@/lib/date-format';

import type { Tour } from './tours.types';

export const TOUR_SORT_OPTIONS = [
  { value: 'sortOrder:asc', label: 'Alapértelmezett sorrend' },
  { value: 'name:asc', label: 'Név: A–Z' },
  { value: 'name:desc', label: 'Név: Z–A' },
  { value: 'createdAt:desc', label: 'Legújabb elöl' },
  { value: 'createdAt:asc', label: 'Legrégebbi elöl' },
  { value: 'updatedAt:desc', label: 'Legutóbb módosított' },
  { value: 'price:asc', label: 'Ár: legolcsóbb elöl' },
  { value: 'price:desc', label: 'Ár: legdrágább elöl' },
  { value: 'lastBookingAt:desc', label: 'Legutóbbi foglalás' },
  { value: 'bookingsCount:desc', label: 'Legtöbb foglalás' },
  { value: 'nextDepartureDate:asc', label: 'Legközelebbi indulás' },
] as const;

export function toTourSortValue(sort?: { id: string; desc: boolean }) {
  const value = sort ? `${sort.id}:${sort.desc ? 'desc' : 'asc'}` : '';

  return TOUR_SORT_OPTIONS.some((option) => option.value === value) ? value : '';
}

export function fromTourSortValue(value: string) {
  const [id, direction] = value.split(':');

  return { id, desc: direction === 'desc' };
}

/** What the list is sorted by for this tour, so the order explains itself. */
export function getTourSortDetail(tour: Tour, sortId?: string): string | null {
  switch (sortId) {
    case 'createdAt':
      return `Létrehozva: ${formatDate(tour.createdAt)}`;
    case 'updatedAt':
      return `Módosítva: ${formatDate(tour.updatedAt)}`;
    case 'price':
      return `Ár: ${tour.displayedPrice || 'nincs megadva'}`;
    case 'lastBookingAt':
      return tour.lastBookingAt
        ? `Utolsó foglalás: ${formatDate(tour.lastBookingAt)}`
        : 'Még nincs foglalás';
    case 'bookingsCount':
      return `Foglalások: ${tour.bookingsCount ?? 0}`;
    case 'nextDepartureDate':
      return tour.nextDepartureDate
        ? `Következő indulás: ${formatDate(tour.nextDepartureDate)}`
        : 'Nincs közelgő indulás';
    default:
      return null;
  }
}
