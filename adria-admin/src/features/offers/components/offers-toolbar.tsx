import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/i18n';
import type { OfferGroup, Region } from '@/types/domain';

type OffersToolbarProps = {
  search: string;
  statusFilter: string;
  regionFilter: string;
  groupFilter: string;
  resultCount: number;
  regions: Region[];
  offerGroups: OfferGroup[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onRegionFilterChange: (value: string) => void;
  onGroupFilterChange: (value: string) => void;
  onCreateClick: () => void;
};

export function OffersToolbar({
  search,
  statusFilter,
  regionFilter,
  groupFilter,
  resultCount,
  regions,
  offerGroups,
  onSearchChange,
  onStatusFilterChange,
  onRegionFilterChange,
  onGroupFilterChange,
  onCreateClick,
}: OffersToolbarProps) {
  const visibleGroups = regionFilter
    ? offerGroups.filter((group) => group.regionId === regionFilter)
    : offerGroups;

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            {t('offers.toolbar.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('offers.toolbar.results', { count: resultCount })}
          </p>
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="size-4" />
          {t('offers.toolbar.create')}
        </Button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative xl:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
            placeholder={t('offers.toolbar.searchPlaceholder')}
          />
        </div>

        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          value={regionFilter}
          onChange={(event) => onRegionFilterChange(event.target.value)}
        >
          <option value="">{t('offers.toolbar.allRegions')}</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
        >
          <option value="">{t('offers.toolbar.allStatuses')}</option>
          <option value="draft">{t('common.draft')}</option>
          <option value="published">{t('common.published')}</option>
          <option value="archived">{t('common.archived')}</option>
        </select>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:max-w-sm">
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          value={groupFilter}
          onChange={(event) => onGroupFilterChange(event.target.value)}
        >
          <option value="">{t('offers.toolbar.allGroups')}</option>
          {visibleGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
