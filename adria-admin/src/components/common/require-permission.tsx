import type { ReactNode } from 'react';

import { useAuthStore } from '@/store/auth-store';

import { ForbiddenPage } from './forbidden-page';

type RequirePermissionProps = {
  permission?: string | string[];
  children: ReactNode;
};

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (permission && !hasPermission(permission)) {
    return <ForbiddenPage />;
  }

  return children;
}
