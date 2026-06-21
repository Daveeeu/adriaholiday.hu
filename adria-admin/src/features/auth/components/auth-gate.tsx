import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/auth-store';

export function AuthGate() {
  const location = useLocation();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 text-white">
        <div className="space-y-3 text-center">
          <div className="mx-auto size-12 animate-pulse rounded-2xl bg-white/10" />
          <p className="text-sm text-white/70">Admin betöltése...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (location.pathname === '/login') {
      return <Outlet />;
    }

    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (location.pathname === '/login') {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}
