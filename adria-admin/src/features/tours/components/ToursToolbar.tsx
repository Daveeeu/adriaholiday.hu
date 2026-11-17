import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ToursToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  /** The new tour editor; none: the user may not create tours. */
  createPath?: string;
};

export function ToursToolbar({
  search,
  onSearchChange,
  createPath,
}: ToursToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Keresés név, webcím vagy kulcsszó alapján..."
            className="pl-9"
          />
        </div>
      </div>

      {createPath ? (
        <Button asChild>
          <Link to={createPath}>
            <Plus className="size-4" />
            Új körutazás
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
