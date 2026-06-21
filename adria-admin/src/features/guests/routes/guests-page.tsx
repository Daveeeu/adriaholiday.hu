import { useQuery } from '@tanstack/react-query';

import { PageLoader } from '@/components/common/page-loader';
import { GuestList } from '@/features/guests/components/guest-list';
import { t } from '@/i18n';
import { getGuests } from '@/services/guest-service';

export function GuestsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['guests'],
    queryFn: () => getGuests(),
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t('guests.error.load')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">
          {t('guests.page.eyebrow')}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t('guests.page.title')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('guests.page.description')}
        </p>
      </div>
      <GuestList guests={data} />
    </div>
  );
}
