import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { t } from '@/i18n';

export function RouteErrorFallback() {
  const error = useRouteError();

  const description = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : t('error.route.unknown');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md space-y-4 rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-primary">
          {t('error.route.eyebrow')}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('error.route.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button onClick={() => window.location.assign('/')}>
          {t('error.route.back')}
        </Button>
      </div>
    </div>
  );
}
