import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { navigationItems } from '@/config/navigation';
import { t } from '@/i18n';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';

type SidebarNavProps = {
  collapsed?: boolean;
  mobile?: boolean;
};

const SIDEBAR_GROUP_STATE_STORAGE_KEY = 'sidebar.groupState';

function isRouteActive(pathname: string, to: string, exact?: boolean) {
  return exact
    ? pathname === to
    : pathname === to || pathname.startsWith(`${to}/`);
}

function getActiveGroupKey(
  pathname: string,
  items: typeof navigationItems,
) {
  return (
    items
      .filter(
        (item): item is Extract<(typeof navigationItems)[number], { children: unknown }> =>
          'children' in item,
      )
      .find((item) =>
        item.children.some((child) =>
          isRouteActive(pathname, child.to, child.exact),
        ),
      )?.labelKey ?? null
  );
}

function readGroupState() {
  if (typeof window === 'undefined') {
    return {} as Record<string, boolean>;
  }

  try {
    const stored = window.localStorage.getItem(SIDEBAR_GROUP_STATE_STORAGE_KEY);
    if (!stored) {
      return {} as Record<string, boolean>;
    }

    const parsed = JSON.parse(stored);

    if (Array.isArray(parsed)) {
      return parsed.reduce<Record<string, boolean>>((acc, value) => {
        if (typeof value === 'string') {
          acc[value] = true;
        }

        return acc;
      }, {});
    }

    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed).reduce<Record<string, boolean>>(
        (acc, [key, value]) => {
          if (typeof value === 'boolean') {
            acc[key] = value;
          }

          return acc;
        },
        {},
      );
    }
  } catch {
    return {} as Record<string, boolean>;
  }

  return {} as Record<string, boolean>;
}

export function SidebarNav({
  collapsed = false,
  mobile = false,
}: SidebarNavProps) {
  const location = useLocation();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const setMobileSidebarOpen = useUiStore(
    (state) => state.setMobileSidebarOpen,
  );

  const visibleNavigationItems = useMemo(
    () =>
      navigationItems
        .map((item) => {
          if ('children' in item) {
            const groupPermissions = item.permission;
            const allowedChildren = item.children.filter((child) =>
              child.permission ? hasPermission(child.permission) : true,
            );

            if (groupPermissions && !hasPermission(groupPermissions)) {
              return null;
            }

            return allowedChildren.length > 0
              ? {
                  ...item,
                  children: allowedChildren,
                }
              : null;
          }

          return item.permission && !hasPermission(item.permission)
            ? null
            : item;
        })
        .filter(Boolean) as typeof navigationItems,
    [hasPermission],
  );

  const activeGroupKey = useMemo(
    () => getActiveGroupKey(location.pathname, visibleNavigationItems),
    [location.pathname, visibleNavigationItems],
  );

  const [openGroupState, setOpenGroupState] = useState<Record<string, boolean>>(
    () => {
      const storedState = readGroupState();
      return Object.keys(storedState).length > 0
        ? storedState
        : activeGroupKey
          ? { [activeGroupKey]: true }
          : {};
    },
  );
  const previousActiveGroupKeyRef = useRef<string | null>(activeGroupKey);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      SIDEBAR_GROUP_STATE_STORAGE_KEY,
      JSON.stringify(openGroupState),
    );
  }, [openGroupState]);

  useEffect(() => {
    if (previousActiveGroupKeyRef.current === activeGroupKey) {
      return;
    }

    previousActiveGroupKeyRef.current = activeGroupKey;

    setOpenGroupState((current) => {
      const nextState = Object.keys(current).reduce<Record<string, boolean>>(
        (acc, key) => {
          acc[key] = false;
          return acc;
        },
        {},
      );

      if (activeGroupKey) {
        nextState[activeGroupKey] = true;
      }

      return nextState;
    });
  }, [activeGroupKey]);

  function isGroupOpen(labelKey: string) {
    return openGroupState[labelKey] ?? false;
  }

  function toggleGroup(labelKey: string) {
    setOpenGroupState((current) => ({
      ...current,
      [labelKey]: !(current[labelKey] ?? false),
    }));
  }

  return (
    <nav className="space-y-1 overflow-x-hidden px-3 py-4">
      {visibleNavigationItems.map((item) => {
        if ('children' in item) {
          const isGroupActive =
            activeGroupKey === item.labelKey ||
            (item.to ? isRouteActive(location.pathname, item.to) : false);
          const isOpen = isGroupOpen(item.labelKey);

          return (
            <div
              key={item.labelKey}
              className={cn(
                'space-y-2 rounded-2xl border border-transparent transition-colors',
                isOpen && !collapsed && 'border-sidebar-border/60 bg-sidebar-accent/20',
              )}
            >
              {item.to ? (
                <div className="flex items-center gap-1 rounded-xl">
                  <NavLink
                    to={item.to}
                    onClick={() => {
                      if (mobile) {
                        setMobileSidebarOpen(false);
                      }
                    }}
                    className={({ isActive }) =>
                      cn(
                        'flex min-w-0 flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-tight transition-colors',
                        isActive || isGroupActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/90 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                      )
                    }
                    title={collapsed ? t(item.labelKey) : undefined}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed ? (
                      <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
                    ) : null}
                  </NavLink>
                  {!collapsed ? (
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.labelKey)}
                      className="rounded-xl p-3 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      aria-label={isOpen ? 'Collapse group' : 'Expand group'}
                    >
                      {isOpen ? (
                        <ChevronDown className="size-4 opacity-70" />
                      ) : (
                        <ChevronRight className="size-4 opacity-70" />
                      )}
                    </button>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleGroup(item.labelKey)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-tight transition-colors',
                    isGroupActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/90 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  )}
                  title={collapsed ? t(item.labelKey) : undefined}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed ? (
                    <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
                  ) : null}
                  {!collapsed ? (
                    isOpen ? (
                      <ChevronDown className="size-4 shrink-0 opacity-70" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 opacity-70" />
                    )
                  ) : null}
                </button>
              )}

              {isOpen ? (
                <div className={cn('space-y-1 pb-1', collapsed ? 'pl-0' : 'pl-4')}>
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end={child.exact}
                      onClick={() => {
                        if (mobile) {
                          setMobileSidebarOpen(false);
                        }
                      }}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center rounded-xl text-sm font-medium transition-colors',
                          collapsed
                            ? 'justify-center px-3 py-3'
                            : 'gap-3 px-4 py-2.5',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )
                      }
                      title={collapsed ? t(child.labelKey) : undefined}
                    >
                      <child.icon className="size-4 shrink-0" />
                      {!collapsed ? (
                        <span className="min-w-0 flex-1 truncate">{t(child.labelKey)}</span>
                      ) : null}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={() => {
              if (mobile) {
                setMobileSidebarOpen(false);
              }
            }}
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-xl text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )
            }
            title={collapsed ? t(item.labelKey) : undefined}
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed ? <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span> : null}
          </NavLink>
        );
      })}
    </nav>
  );
}
