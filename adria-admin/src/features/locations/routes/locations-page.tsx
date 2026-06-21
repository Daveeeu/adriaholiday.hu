import { useQuery } from '@tanstack/react-query';

import { PageLoader } from '@/components/common/page-loader';
import { AdminPlaceholderPage } from '@/features/shared/components/admin-placeholder-page';
import { t } from '@/i18n';
import { getLocations } from '@/services/reference-data-service';

export function LocationsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations(),
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Location data failed to load.
      </div>
    );
  }

  return (
    <AdminPlaceholderPage
      eyebrow={t('nav.locations')}
      title={t('locations.title')}
      description={t('locations.description')}
      metrics={[
        {
          label: t('locations.metric.tracked'),
          value: String(data.length),
          hint: t('locations.metric.trackedHint'),
        },
        {
          label: t('locations.metric.featured'),
          value: String(data.filter((location) => location.featured).length),
          hint: t('locations.metric.featuredHint'),
        },
        {
          label: t('locations.metric.transfer'),
          value: `${Math.round(data.reduce((sum, location) => sum + location.transferMinutesFromAirport, 0) / data.length)} min`,
          hint: t('locations.metric.transferHint'),
        },
        {
          label: t('locations.metric.types'),
          value: String(new Set(data.map((location) => location.type)).size),
          hint: t('locations.metric.typesHint'),
        },
      ]}
    />
  );
}
