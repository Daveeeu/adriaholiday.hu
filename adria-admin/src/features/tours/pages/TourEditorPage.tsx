import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';

import { TourEditor } from '../components/TourEditor';
import { TOURS_LIST_PATH, tourDetailQueryKey } from '../lib/tour-routes';
import { getTourById } from '../lib/tours.api';

/** `/tours/new` and `/tours/:tourId/edit`: the full-page tour editor. */
export function TourEditorPage() {
  const { tourId } = useParams<{ tourId: string }>();

  if (!tourId) {
    return <TourEditor />;
  }

  return <SavedTourEditor key={tourId} tourId={tourId} />;
}

function SavedTourEditor({ tourId }: { tourId: string }) {
  const {
    data: tour,
    isLoading,
    isError,
  } = useQuery({
    queryKey: tourDetailQueryKey(tourId),
    queryFn: () => getTourById(tourId),
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !tour) {
    return (
      <div className="space-y-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        <p>Nem sikerült betölteni a körutazás adatait.</p>
        <Button asChild variant="outline">
          <Link to={TOURS_LIST_PATH}>Vissza az ajánlatokhoz</Link>
        </Button>
      </div>
    );
  }

  return <TourEditor tour={tour} />;
}
