import {
  staticNavigationItems,
  type NavigationGroup,
  type NavigationItem,
  type NavigationLink,
  type NavigationPermission,
} from './navigation';

type PermissionCheck = (permission: string | string[]) => boolean;

function isGroup(item: NavigationItem): item is NavigationGroup {
  return 'children' in item;
}

/**
 * A group opens for anyone who may open at least one of its children, so its
 * permission is the union of theirs. One child without a permission makes the
 * whole group open to every signed-in user.
 */
export function getGroupPermission(
  group: NavigationGroup,
): NavigationPermission {
  const permissions = new Set<string>();

  for (const child of group.children) {
    if (!child.permission) {
      return undefined;
    }

    for (const permission of [child.permission].flat()) {
      permissions.add(permission);
    }
  }

  return [...permissions];
}

function canOpenLink(link: NavigationLink, hasPermission: PermissionCheck) {
  return !link.permission || hasPermission(link.permission);
}

/**
 * Drops every link the user may not open, and every group left without a
 * visible child.
 */
export function filterNavigationItems(
  items: NavigationItem[],
  hasPermission: PermissionCheck,
): NavigationItem[] {
  return items.flatMap((item): NavigationItem[] => {
    if (!isGroup(item)) {
      return canOpenLink(item, hasPermission) ? [item] : [];
    }

    const children = item.children.filter((child) =>
      canOpenLink(child, hasPermission),
    );

    return children.length > 0 ? [{ ...item, children }] : [];
  });
}

function collectRoutePermissions(
  items: NavigationItem[],
): Map<string, NavigationPermission> {
  const routePermissions = new Map<string, NavigationPermission>();

  for (const item of items) {
    if (!isGroup(item)) {
      routePermissions.set(item.to, item.permission);
      continue;
    }

    for (const child of item.children) {
      routePermissions.set(child.to, child.permission);
    }

    if (item.to && !routePermissions.has(item.to)) {
      routePermissions.set(item.to, getGroupPermission(item));
    }
  }

  return routePermissions;
}

const routePermissions = collectRoutePermissions(staticNavigationItems);

/**
 * The permission the sidebar requires for a path. The router guards the same
 * path with it, so a menu item is shown exactly when its page opens.
 */
export function getRoutePermission(path: string): NavigationPermission {
  return routePermissions.get(path);
}
