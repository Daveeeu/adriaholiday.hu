import type { Column } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { Tour } from '../lib/tours.types';

/** A list column header that toggles the API's sorting by the column. */
export function TourSortableHeader({
  column,
  label,
}: {
  column: Column<Tour>;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      className="-ml-3"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label} <ArrowUpDown className="size-4" />
    </Button>
  );
}
