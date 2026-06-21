import { useQuery } from '@tanstack/react-query';

import { PageLoader } from '@/components/common/page-loader';
import { AdminPlaceholderPage } from '@/features/shared/components/admin-placeholder-page';
import { t } from '@/i18n';
import { getGalleries } from '@/services/reference-data-service';

export function GalleriesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['galleries'],
    queryFn: () => getGalleries(),
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Gallery data failed to load.
      </div>
    );
  }

  return (
    <AdminPlaceholderPage
      eyebrow={t('nav.galleries')}
      title={t('galleries.title')}
      description={t('galleries.description')}
      metrics={[
        {
          label: t('galleries.metric.collections'),
          value: String(data.length),
          hint: t('galleries.metric.collectionsHint'),
        },
        {
          label: t('galleries.metric.offerGalleries'),
          value: String(
            data.filter((gallery) => gallery.category === 'offer').length,
          ),
          hint: t('galleries.metric.offerGalleriesHint'),
        },
        {
          label: t('galleries.metric.apartmentGalleries'),
          value: String(
            data.filter((gallery) => gallery.category === 'apartment').length,
          ),
          hint: t('galleries.metric.apartmentGalleriesHint'),
        },
        {
          label: t('galleries.metric.assets'),
          value: String(
            data.reduce((sum, gallery) => sum + (gallery.images?.length ?? gallery.imageIds.length), 0),
          ),
          hint: t('galleries.metric.assetsHint'),
        },
      ]}
    />
  );
}
