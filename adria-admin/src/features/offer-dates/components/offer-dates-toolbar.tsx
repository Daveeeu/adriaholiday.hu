import { CalendarRange, Plus, TableProperties } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Offer } from '@/types/domain';

type OfferDatesToolbarProps = {
  offerFilter: string;
  activeFilter: string;
  resultCount: number;
  view: 'calendar' | 'table';
  offers: Offer[];
  onOfferFilterChange: (value: string) => void;
  onActiveFilterChange: (value: string) => void;
  onViewChange: (view: 'calendar' | 'table') => void;
  onAddClick: () => void;
};

export function OfferDatesToolbar({
  offerFilter,
  activeFilter,
  resultCount,
  view,
  offers,
  onOfferFilterChange,
  onActiveFilterChange,
  onViewChange,
  onAddClick,
}: OfferDatesToolbarProps) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Offer dates</h2>
          <p className="text-sm text-muted-foreground">
            {resultCount} date{resultCount === 1 ? '' : 's'} matched the current
            filters.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => onViewChange('calendar')}
          >
            <CalendarRange className="size-4" />
            Calendar
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            onClick={() => onViewChange('table')}
          >
            <TableProperties className="size-4" />
            Table
          </Button>
          <Button onClick={onAddClick}>
            <Plus className="size-4" />
            Add date
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:max-w-xl">
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          value={offerFilter}
          onChange={(event) => onOfferFilterChange(event.target.value)}
        >
          <option value="">All offers</option>
          {offers.map((offer) => (
            <option key={offer.id} value={offer.id}>
              {offer.title}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          value={activeFilter}
          onChange={(event) => onActiveFilterChange(event.target.value)}
        >
          <option value="">All states</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="xml-on">XML enabled</option>
          <option value="xml-off">XML disabled</option>
        </select>
      </div>
    </div>
  );
}
