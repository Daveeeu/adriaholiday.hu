import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  FileDown,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { tourEditPath } from '../lib/tour-routes';
import type { Tour } from '../lib/tours.types';
import type { TourListActions } from '../lib/use-tour-list-actions';

export type TourListPermissions = {
  canUpdate: boolean;
  canUpdateStatus: boolean;
  canDownloadPdf: boolean;
  canDuplicate: boolean;
  canReorder: boolean;
  canDelete: boolean;
};

type TourRowActionsProps = {
  tour: Tour;
  permissions: TourListPermissions;
  actions: TourListActions;
  onView: (tourId: string) => void;
};

/** A list row's buttons: view, edit and the less frequent actions in a menu. */
export function TourRowActions({
  tour,
  permissions,
  actions,
  onView,
}: TourRowActionsProps) {
  const {
    canUpdate,
    canUpdateStatus,
    canDownloadPdf,
    canDuplicate,
    canReorder,
    canDelete,
  } = permissions;
  const hasMenu =
    canUpdateStatus ||
    canDownloadPdf ||
    canDuplicate ||
    canReorder ||
    canDelete;

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="icon"
        title="Megtekintés"
        aria-label="Megtekintés"
        onClick={() => onView(tour.id)}
      >
        <Eye className="size-4" />
      </Button>
      {canUpdate ? (
        <Button
          asChild
          variant="outline"
          size="icon"
          title="Szerkesztés"
          aria-label="Szerkesztés"
        >
          <Link to={tourEditPath(tour.id)}>
            <Pencil className="size-4" />
          </Link>
        </Button>
      ) : null}
      {hasMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              title="További műveletek"
              aria-label="További műveletek"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canUpdateStatus ? (
              <DropdownMenuItem
                onSelect={() => actions.setActive(tour.id, !tour.active)}
              >
                <Power className="size-4" />
                {tour.active ? 'Inaktiválás' : 'Aktiválás'}
              </DropdownMenuItem>
            ) : null}
            {canDownloadPdf ? (
              <DropdownMenuItem
                disabled={actions.isDownloadingPdf(tour.id)}
                onSelect={() => actions.downloadPdf(tour)}
              >
                <FileDown className="size-4" />
                Program PDF letöltése
              </DropdownMenuItem>
            ) : null}
            {canDuplicate ? (
              <DropdownMenuItem onSelect={() => actions.duplicate(tour.id)}>
                <Copy className="size-4" />
                Másolás új útként
              </DropdownMenuItem>
            ) : null}
            {canReorder ? (
              <>
                <DropdownMenuItem onSelect={() => actions.move(tour.id, 'up')}>
                  <ArrowUp className="size-4" />
                  Feljebb az alapsorrendben
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => actions.move(tour.id, 'down')}
                >
                  <ArrowDown className="size-4" />
                  Lejjebb az alapsorrendben
                </DropdownMenuItem>
              </>
            ) : null}
            {canDelete ? (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => actions.remove(tour.id, tour.name)}
              >
                <Trash2 className="size-4" />
                Törlés
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
