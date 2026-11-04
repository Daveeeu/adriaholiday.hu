import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppProviders } from '@/app/providers/app-providers';
import { AppRouter } from '@/app/router';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { reloadOnStaleChunk } from '@/lib/stale-chunk-reload';
import '@/index.css';

reloadOnStaleChunk();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>,
);
