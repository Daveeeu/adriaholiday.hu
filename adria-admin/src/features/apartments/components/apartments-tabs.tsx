import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { apartmentModuleTabs, type ApartmentModuleTabKey } from '../lib/apartments.constants';

type ApartmentsTabsProps = {
  activeTab?: ApartmentModuleTabKey;
};

export function ApartmentsTabs({ activeTab }: ApartmentsTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab =
    activeTab ??
    apartmentModuleTabs.find((tab) => tab.to && location.pathname.startsWith(tab.to))?.key ??
    'apartments';

  return (
    <div className="rounded-2xl border bg-card p-2 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {apartmentModuleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;

          return (
            <Button
              key={tab.key}
              type="button"
              size="sm"
              variant={isActive ? 'default' : 'outline'}
              disabled={tab.disabled}
              className={cn('gap-2', tab.disabled && 'opacity-50')}
              onClick={() => {
                if (!tab.to || tab.disabled) {
                  return;
                }

                navigate(tab.to);
              }}
            >
              {Icon ? <Icon className="size-4" /> : null}
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

