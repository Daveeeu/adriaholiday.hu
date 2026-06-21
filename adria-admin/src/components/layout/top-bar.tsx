import { Bell, Menu, PanelLeft } from 'lucide-react';
import { toast } from 'sonner';

import { AppBreadcrumbs } from '@/components/layout/app-breadcrumbs';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { UserNav } from '@/components/layout/user-nav';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n';
import { useUiStore } from '@/store/ui-store';

type TopBarProps = {
  onOpenMobileMenu: () => void;
};

export function TopBar({ onOpenMobileMenu }: TopBarProps) {
  const toggleDesktopSidebar = useUiStore(
    (state) => state.toggleDesktopSidebar,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMobileMenu}
          aria-label={t('layout.openNavigation')}
        >
          <Menu className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={toggleDesktopSidebar}
          aria-label={t('layout.toggleSidebar')}
        >
          <PanelLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <AppBreadcrumbs />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => toast.info(t('layout.noNotifications'))}
            aria-label={t('layout.notifications')}
          >
            <Bell className="size-4" />
          </Button>
          <ThemeToggle />
          <UserNav />
        </div>
      </div>

    </div>
  );
}
