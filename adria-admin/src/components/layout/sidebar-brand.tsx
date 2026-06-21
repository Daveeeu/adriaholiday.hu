import { Compass } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';

type SidebarBrandProps = {
  collapsed?: boolean;
};

export function SidebarBrand({ collapsed = false }: SidebarBrandProps) {
  return (
    <div
      className={cn(
        'flex items-center border-b border-sidebar-border',
        collapsed ? 'justify-center px-3 py-5' : 'justify-between px-5 py-5',
      )}
    >
      <div
        className={cn('flex items-center gap-3', collapsed && 'justify-center')}
      >
        <div className="flex size-10 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Compass className="size-5" />
        </div>
        {!collapsed ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-sidebar-foreground/55">
              {t('brand.name')}
            </p>
            <h1 className="text-lg font-semibold tracking-tight">
              {t('brand.admin')}
            </h1>
          </div>
        ) : null}
      </div>
      {!collapsed ? (
        <Badge className="border-transparent bg-sidebar-accent text-sidebar-accent-foreground">
          {t('brand.test')}
        </Badge>
      ) : null}
    </div>
  );
}
