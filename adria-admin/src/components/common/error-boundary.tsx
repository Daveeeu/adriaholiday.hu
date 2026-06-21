import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { Button } from '@/components/ui/button';
import { t } from '@/i18n';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError() {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="max-w-md space-y-4 rounded-2xl border bg-card p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-primary">
              {t('error.boundary.eyebrow')}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {t('error.boundary.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('error.boundary.description')}
            </p>
            <Button onClick={() => window.location.reload()}>
              {t('error.boundary.reload')}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
