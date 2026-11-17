import { useQuery } from '@tanstack/react-query';
import { Copy, Pencil, Power, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EntitySidePanel } from '@/components/admin/entity-side-panel';
import { Button } from '@/components/ui/button';

import { tourDetailQueryKey, tourEditPath } from '../lib/tour-routes';
import { getTourById } from '../lib/tours.api';
import { TourDetailView } from './TourDetailView';

type TourDetailPanelProps = {
  /** The tour shown; none: the panel is closed. */
  tourId: string | null;
  canEdit: boolean;
  onClose: () => void;
  onToggleActive?: (tourId: string, active: boolean) => void;
  onDuplicate?: (tourId: string) => void;
  onDelete?: (tourId: string, name: string) => void;
};

/** A saved tour's every detail, read-only, beside the list; editing opens the full-page editor. */
export function TourDetailPanel({
  tourId,
  canEdit,
  onClose,
  onToggleActive,
  onDuplicate,
  onDelete,
}: TourDetailPanelProps) {
  const {
    data: tour,
    isLoading,
    isError,
  } = useQuery({
    queryKey: tourDetailQueryKey(tourId ?? ''),
    queryFn: () => getTourById(tourId ?? ''),
    enabled: tourId !== null,
  });

  if (tourId === null) {
    return null;
  }

  return (
    <EntitySidePanel
      open
      title="Körutazás részletei"
      description="A körutazás minden adata egy helyen."
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      headerActions={
        tour ? (
          <>
            {onToggleActive ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onToggleActive(tour.id, !tour.active)}
              >
                <Power className="size-4" />
                {tour.active ? 'Inaktiválás' : 'Aktiválás'}
              </Button>
            ) : null}
            {onDuplicate ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onDuplicate(tour.id)}
              >
                <Copy className="size-4" />
                Másolás
              </Button>
            ) : null}
            {canEdit ? (
              <Button asChild variant="outline">
                <Link to={tourEditPath(tour.id)}>
                  <Pencil className="size-4" />
                  Szerkesztés
                </Link>
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(tour.id, tour.name)}
              >
                <Trash2 className="size-4" />
                Törlés
              </Button>
            ) : null}
          </>
        ) : null
      }
    >
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
          Körutazás adatok betöltése...
        </div>
      ) : isError || !tour ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Nem sikerült betölteni a körutazás adatait.
        </div>
      ) : (
        <TourDetailView tour={tour} />
      )}
    </EntitySidePanel>
  );
}
