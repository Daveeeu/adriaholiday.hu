import { navigationItems, type NavigationItem } from './navigation';

type FlatNavigationEntry = {
  to: string;
  permission?: string | string[];
};

function flatten(items: NavigationItem[]): FlatNavigationEntry[] {
  const result: FlatNavigationEntry[] = [];

  for (const item of items) {
    if (item.to) {
      result.push({ to: item.to, permission: item.permission });
    }

    if ('children' in item) {
      result.push(...flatten(item.children));
    }
  }

  return result;
}

const flattenedNavigation = flatten(navigationItems);

export function getRoutePermission(path: string): string | string[] | undefined {
  return flattenedNavigation.find((entry) => entry.to === path)?.permission;
}
