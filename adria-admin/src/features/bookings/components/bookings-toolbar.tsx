import { Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { t } from '@/i18n';
import type { Offer, Region } from '@/types/domain';

import { bookingStatusOptions } from '../lib/booking-utils';

type BookingsToolbarProps = {
  search: string;
  statusFilter: string;
  regionFilter: string;
  offerFilter: string;
  regions: Region[];
  offers: Offer[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onRegionFilterChange: (value: string) => void;
  onOfferFilterChange: (value: string) => void;
  onReset: () => void;
};

export function BookingsToolbar({
  search,
  statusFilter,
  regionFilter,
  offerFilter,
  regions,
  offers,
  onSearchChange,
  onStatusFilterChange,
  onRegionFilterChange,
  onOfferFilterChange,
  onReset,
}: BookingsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('bookings.toolbar.searchPlaceholder')}
            className="pl-9"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-3 xl:grid-cols-4">
          <Select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            aria-label={t('common.status')}
          >
            <option value="">{t('bookings.toolbar.allStatuses')}</option>
            {bookingStatusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
          <Select
            value={regionFilter}
            onChange={(event) => onRegionFilterChange(event.target.value)}
            aria-label={t('common.region')}
          >
            <option value="">{t('bookings.toolbar.allRegions')}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </Select>
          <Select
            value={offerFilter}
            onChange={(event) => onOfferFilterChange(event.target.value)}
            aria-label={t('bookings.table.offer')}
          >
            <option value="">{t('bookings.toolbar.allOffers')}</option>
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                {offer.title}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            onClick={onReset}
            className="justify-center"
          >
            <SlidersHorizontal className="size-4" />
            {t('bookings.toolbar.reset')}
          </Button>
        </div>
      </div>
    </div>
  );
}
