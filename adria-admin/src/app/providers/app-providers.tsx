import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useEffect, type PropsWithChildren } from 'react';
import { toast } from 'sonner';

import { Toaster } from '@/components/ui/sonner';
import { onAuthForbidden, onAuthUnauthorized } from '@/lib/auth-session';

import { queryClient } from './query-client';

function AuthEventBridge() {
  useEffect(() => {
    return onAuthUnauthorized(() => {
      // The auth store clears the session via the registered handler.
    });
  }, []);

  useEffect(() => {
    return onAuthForbidden(() => {
      toast.error('Nincs jogosultság ehhez a művelethez.');
    });
  }, []);

  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthEventBridge />
        {children}
        <Toaster richColors closeButton position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
