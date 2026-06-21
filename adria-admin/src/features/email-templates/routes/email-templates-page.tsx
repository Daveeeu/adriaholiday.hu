import { useQuery } from '@tanstack/react-query';

import { PageLoader } from '@/components/common/page-loader';
import { AdminPlaceholderPage } from '@/features/shared/components/admin-placeholder-page';
import { t } from '@/i18n';
import { getEmailTemplates } from '@/services/reference-data-service';

export function EmailTemplatesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => getEmailTemplates(),
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Email template data failed to load.
      </div>
    );
  }

  return (
    <AdminPlaceholderPage
      eyebrow={t('nav.emailTemplates')}
      title={t('emailTemplates.title')}
      description={t('emailTemplates.description')}
      metrics={[
        {
          label: t('emailTemplates.metric.active'),
          value: String(data.filter((template) => template.isActive).length),
          hint: t('emailTemplates.metric.activeHint'),
        },
        {
          label: t('emailTemplates.metric.locales'),
          value: String(new Set(data.map((template) => template.locale)).size),
          hint: t('emailTemplates.metric.localesHint'),
        },
        {
          label: t('emailTemplates.metric.categories'),
          value: String(
            new Set(data.map((template) => template.category)).size,
          ),
          hint: t('emailTemplates.metric.categoriesHint'),
        },
        {
          label: t('emailTemplates.metric.variables'),
          value: String(
            data.reduce((sum, template) => sum + template.variables.length, 0),
          ),
          hint: t('emailTemplates.metric.variablesHint'),
        },
      ]}
    />
  );
}
