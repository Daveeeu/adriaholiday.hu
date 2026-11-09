import { SidebarBrand } from '@/components/layout/sidebar-brand';
import { SidebarNav } from '@/components/layout/sidebar-nav';

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
    </div>
  );
}
