import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ApartmentsToolbarProps = {
  title: string;
  description: string;
  search: string;
  resultCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onCreateClick?: () => void;
};

export function ApartmentsToolbar({
  title,
  description,
  search,
  resultCount,
  totalCount,
  onSearchChange,
  onCreateClick,
}: ApartmentsToolbarProps) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
          <p className="text-xs text-muted-foreground">
            {resultCount} találat a {totalCount} rekordból
          </p>
        </div>

        {onCreateClick ? (
          <Button onClick={onCreateClick}>
            <Plus className="size-4" />
            Új apartman
          </Button>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
            placeholder="Keresés név, kód, cím vagy SEO név alapján..."
          />
        </div>
      </div>
    </div>
  );
}
