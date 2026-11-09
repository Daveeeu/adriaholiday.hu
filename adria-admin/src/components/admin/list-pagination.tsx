import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ListPaginationProps = {
  page: number;
  perPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function ListPagination({ page, perPage, totalCount, onPageChange }: ListPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalCount / perPage));

  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-4 text-sm text-muted-foreground">
      <span>
        Találatok: <span className="font-medium text-foreground">{totalCount}</span>
      </span>
      <div className="flex items-center gap-2">
        <span>
          {page} / {pageCount}
        </span>
        <Button title="Előző" aria-label="Előző" variant="outline" size="icon" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
