import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/i18n';

type RegionsToolbarProps = {
  search: string;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
};

export function RegionsToolbar({
  search,
  resultCount,
  onSearchChange,
  onCreateClick,
}: RegionsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          {t('regions.toolbar.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('regions.toolbar.results', { count: resultCount })}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full pl-9 sm:w-72"
            placeholder={t('regions.toolbar.searchPlaceholder')}
          />
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="size-4" />
          {t('regions.toolbar.create')}
        </Button>
      </div>
    </div>
  );
}
