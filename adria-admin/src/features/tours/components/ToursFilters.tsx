import type { SortingState } from '@tanstack/react-table';

import { Select } from '@/components/ui/select';

import {
  fromTourSortValue,
  toTourSortValue,
  TOUR_SORT_OPTIONS,
} from '../lib/tour-sort-options';
import type {
  TourBooleanFilter,
  TourListFilters,
} from '../lib/tour-list-filters';
import type { SelectOption } from '../lib/tours.types';

const BOOLEAN_FILTERS: Array<{
  key: Exclude<keyof TourListFilters, 'regionId'>;
  all: string;
  yes: string;
  no: string;
}> = [
  { key: 'active', all: 'Aktív állapot', yes: 'Aktív', no: 'Inaktív' },
  {
    key: 'featured',
    all: 'Kiemelt állapot',
    yes: 'Kiemelt',
    no: 'Nem kiemelt',
  },
  {
    key: 'xmlEnabled',
    all: 'Partnerportál',
    yes: 'Partnerportálon megjelenik',
    no: 'Nem szerepel',
  },
];

type ToursFiltersProps = {
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  filters: TourListFilters;
  onFiltersChange: (filters: TourListFilters) => void;
  regionOptions: SelectOption[];
};

/** The offers list's ordering and filters. */
export function ToursFilters({
  sorting,
  onSortingChange,
  filters,
  onFiltersChange,
  regionOptions,
}: ToursFiltersProps) {
  return (
    <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      <Select
        aria-label="Rendezés"
        value={toTourSortValue(sorting[0])}
        onChange={(event) =>
          onSortingChange([fromTourSortValue(event.target.value)])
        }
      >
        <option value="" hidden>
          Rendezés: oszlop szerint
        </option>
        {TOUR_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            Rendezés: {option.label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Régió"
        value={filters.regionId}
        onChange={(event) =>
          onFiltersChange({ ...filters, regionId: event.target.value })
        }
      >
        <option value="all">Összes régió</option>
        {regionOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {BOOLEAN_FILTERS.map(({ key, all, yes, no }) => (
        <Select
          key={key}
          aria-label={all}
          value={filters[key]}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              [key]: event.target.value as TourBooleanFilter,
            })
          }
        >
          <option value="all">{all}</option>
          <option value="true">{yes}</option>
          <option value="false">{no}</option>
        </Select>
      ))}
    </div>
  );
}
