import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { HomepageOfferStatus } from '../lib/homepage-offer-schema';

type HomepageOffersToolbarProps = {
  search: string;
  statusFilter: '' | HomepageOfferStatus;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: '' | HomepageOfferStatus) => void;
  onCreateClick: () => void;
};

export function HomepageOffersToolbar({
  search,
  statusFilter,
  resultCount,
  onSearchChange,
  onStatusFilterChange,
  onCreateClick,
}: HomepageOffersToolbarProps) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Főoldali ajánlatok kezelése
          </h2>
          <p className="text-sm text-muted-foreground">
            Találatok: {resultCount} db
          </p>
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="size-4" />
          Új főoldali ajánlat
        </Button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative md:col-span-1 xl:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
            placeholder="Keresés név, link vagy SEO név alapján..."
          />
        </div>

        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as '' | HomepageOfferStatus)
          }
        >
          <option value="">Összes státusz</option>
          <option value="active">Aktív</option>
          <option value="inactive">Inaktív</option>
        </select>
      </div>
    </div>
  );
}
