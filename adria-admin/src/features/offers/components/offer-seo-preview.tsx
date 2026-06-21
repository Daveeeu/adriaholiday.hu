import type { OfferFormValues } from '@/features/offers/lib/offer-schema';
import { t } from '@/i18n';

type OfferSeoPreviewProps = {
  values: OfferFormValues;
  locale: 'hu' | 'en' | 'de';
};

export function OfferSeoPreview({ values, locale }: OfferSeoPreviewProps) {
  const translation = values.translations[locale];
  const previewUrl = `https://adriaholiday.hu/offers/${values.slug || t('offers.seo.slugFallback')}`;

  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-sm font-medium text-primary">{t('offers.seo.title')}</p>
      <div className="mt-3 space-y-1">
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          {previewUrl}
        </p>
        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
          {translation.title || values.title || t('offers.seo.titleFallback')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {translation.teaser ||
            translation.description ||
            t('offers.seo.descriptionFallback')}
        </p>
      </div>
    </div>
  );
}
