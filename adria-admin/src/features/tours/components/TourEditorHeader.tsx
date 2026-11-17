import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { TOURS_LIST_PATH } from '../lib/tour-routes';
import type { Tour } from '../lib/tours.types';

type TourEditorHeaderProps = {
  tour?: Tour;
  /** The form the save button submits. */
  formId: string;
  dirty: boolean;
  saving: boolean;
  busy: boolean;
  onDelete?: () => void;
};

/** The editor's title and actions, kept in view while the sections scroll. */
export function TourEditorHeader({
  tour,
  formId,
  dirty,
  saving,
  busy,
  onDelete,
}: TourEditorHeaderProps) {
  return (
    <div className="sticky -top-6 z-20 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            title="Vissza az ajánlatokhoz"
            aria-label="Vissza az ajánlatokhoz"
          >
            <Link to={TOURS_LIST_PATH}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary">
              {tour ? 'Körutazás szerkesztése' : 'Új körutazás'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight">
                {tour?.name || 'Körutazás hozzáadása'}
              </h1>
              {tour ? (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    tour.active
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700',
                  )}
                >
                  {tour.active ? 'Aktív' : 'Inaktív'}
                </span>
              ) : null}
              {dirty ? (
                <span className="text-xs font-medium text-amber-700">
                  Nem mentett módosítások
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={busy}
            >
              <Trash2 className="size-4" />
              Törlés
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link to={TOURS_LIST_PATH}>Mégse</Link>
          </Button>
          <Button type="submit" form={formId} disabled={busy}>
            <Save className="size-4" />
            {saving ? 'Mentés...' : 'Mentés'}
          </Button>
        </div>
      </div>
    </div>
  );
}
