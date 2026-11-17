import type { ColumnDef } from '@tanstack/react-table';

import { TourBooleanBadge } from '../components/tour-boolean-badge';
import {
  TourRowActions,
  type TourListPermissions,
} from '../components/TourRowActions';
import { TourSortableHeader } from '../components/TourSortableHeader';
import { getTourSortDetail } from './tour-sort-options';
import type { Tour } from './tours.types';
import type { TourListActions } from './use-tour-list-actions';

function booleanColumn(
  key: 'featured' | 'active' | 'xmlEnabled',
  label: string,
): ColumnDef<Tour> {
  return {
    accessorKey: key,
    header: ({ column }) => (
      <TourSortableHeader column={column} label={label} />
    ),
    cell: ({ row }) => <TourBooleanBadge value={row.original[key]} />,
  };
}

type TourListColumnOptions = {
  permissions: TourListPermissions;
  actions: TourListActions;
  onView: (tourId: string) => void;
};

/** The offers list's columns; sorting is done by the API. */
export function getTourListColumns({
  permissions,
  actions,
  onView,
}: TourListColumnOptions): ColumnDef<Tour>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <TourSortableHeader column={column} label="Név" />
      ),
      cell: ({ row, table }) => {
        const sortDetail = getTourSortDetail(
          row.original,
          table.getState().sorting[0]?.id,
        );

        return (
          <div className="space-y-1">
            <div className="font-medium text-foreground">
              {row.original.name}
            </div>
            {sortDetail ? (
              <div className="text-xs font-medium text-primary">
                {sortDetail}
              </div>
            ) : null}
            {row.original.subtitle ? (
              <div className="text-xs text-muted-foreground">
                {row.original.subtitle}
              </div>
            ) : null}
            {row.original.active &&
            (row.original.searchKeywords ?? []).length === 0 ? (
              <div className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                Nincs keresési kulcsszó
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: 'regionId',
      header: ({ column }) => (
        <TourSortableHeader column={column} label="Régió" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.regionLabel ?? '—'}
        </span>
      ),
    },
    booleanColumn('featured', 'Kiemelt'),
    booleanColumn('active', 'Aktív'),
    booleanColumn('xmlEnabled', 'Partnerportálon megjelenik'),
    {
      id: 'actions',
      header: 'Műveletek',
      enableSorting: false,
      cell: ({ row }) => (
        <TourRowActions
          tour={row.original}
          permissions={permissions}
          actions={actions}
          onView={onView}
        />
      ),
    },
  ];
}
