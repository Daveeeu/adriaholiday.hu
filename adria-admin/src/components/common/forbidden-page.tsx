import { Button } from '@/components/ui/button';
import { t } from '@/i18n';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md space-y-4 rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-primary">{t('error.forbidden.eyebrow')}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{t('error.forbidden.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('error.forbidden.description')}</p>
        <Button onClick={() => window.location.assign('/')}>{t('error.forbidden.back')}</Button>
      </div>
    </div>
  );
}
