import { SidebarBrand } from '@/components/layout/sidebar-brand';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { cn } from '@/lib/utils';

type AppSidebarProps = {
  collapsed?: boolean;
  mobile?: boolean;
};

export function AppSidebar({
  collapsed = false,
  mobile = false,
}: AppSidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
      <div className="shrink-0">
        <SidebarBrand collapsed={collapsed && !mobile} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <SidebarNav collapsed={collapsed && !mobile} mobile={mobile} />
      </div>
      <div
        className={cn(
          'shrink-0 border-t border-sidebar-border text-sidebar-foreground/70',
          collapsed && !mobile
            ? 'px-3 py-4 text-center text-xs'
            : 'px-5 py-4 text-sm',
        )}
      >
        {collapsed && !mobile
          ? 'API'
          : 'Adria Holiday admin rendszer a valós Laravel API-val.'}
      </div>
    </div>
  );
}
