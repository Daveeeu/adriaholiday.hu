import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ModuleToolbarProps = {
  title: string;
  description: string;
  search: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
  onCreate?: () => void;
  createLabel?: string;
  onReset?: () => void;
  extraControls?: ReactNode;
  className?: string;
};

export function ModuleToolbar({
  title,
  description,
  search,
  placeholder,
  onSearchChange,
  onCreate,
  createLabel = 'Új rekord',
  onReset,
  extraControls,
  className,
}: ModuleToolbarProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border bg-card/90 p-4 shadow-sm backdrop-blur',
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onReset ? (
            <Button type="button" variant="outline" onClick={onReset}>
              <SlidersHorizontal className="size-4" />
              Szűrők törlése
            </Button>
          ) : null}
          {onCreate ? (
            <Button type="button" onClick={onCreate}>
              <Plus className="size-4" />
              {createLabel}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>
        {extraControls ? <div className="flex flex-wrap gap-2">{extraControls}</div> : null}
      </div>
    </div>
  );
}

