import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { TopBar } from '@/components/layout/top-bar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { LoginPage } from '@/features/auth/routes/login-page';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';

export function AppShell() {
  const location = useLocation();
  const mobileSidebarOpen = useUiStore((state) => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore(
    (state) => state.setMobileSidebarOpen,
  );
  const desktopSidebarCollapsed = useUiStore(
    (state) => state.desktopSidebarCollapsed,
  );
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto size-12 animate-pulse rounded-2xl bg-primary/10" />
          <p className="text-sm text-muted-foreground">Hitelesítés ellenőrzése...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (location.pathname !== '/') {
      return <Navigate replace state={{ from: location }} to="/" />;
    }

    return <LoginPage />;
  }

  return (
    <div className="h-screen overflow-hidden bg-muted/30">
      <div className="mx-auto flex h-full max-w-[1680px] overflow-hidden">
        <aside
          className={cn(
            'hidden h-full shrink-0 overflow-hidden border-r bg-sidebar transition-[width] duration-200 lg:block',
            desktopSidebarCollapsed ? 'w-24' : 'w-72',
          )}
        >
          <AppSidebar collapsed={desktopSidebarCollapsed} />
        </aside>

        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="h-dvh w-80 border-r p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin oldalsáv</SheetTitle>
              <SheetDescription>Mobil navigáció az admin felülethez.</SheetDescription>
            </SheetHeader>
            <AppSidebar mobile />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b bg-background/92 backdrop-blur">
            <div className="px-4 py-4 lg:px-6">
              <TopBar onOpenMobileMenu={() => setMobileSidebarOpen(true)} />
            </div>
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
