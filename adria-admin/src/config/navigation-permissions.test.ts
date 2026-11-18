import { LayoutDashboard } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { staticNavigationItems, type NavigationItem } from './navigation';
import {
  filterNavigationItems,
  getGroupPermission,
  getRoutePermission,
} from './navigation-permissions';

const icon = LayoutDashboard;

const items: NavigationItem[] = [
  { to: '/', labelKey: 'dashboard', icon },
  { to: '/buses', labelKey: 'buses', icon, permission: 'buses.viewAny' },
  {
    labelKey: 'blog',
    icon,
    children: [
      {
        to: '/blog',
        labelKey: 'articles',
        icon,
        permission: 'blog-articles.viewAny',
      },
      {
        to: '/blog/tags',
        labelKey: 'tags',
        icon,
        permission: 'blog-tags.viewAny',
      },
    ],
  },
  {
    labelKey: 'administration',
    icon,
    children: [
      { to: '/users', labelKey: 'users', icon, permission: 'users.viewAny' },
    ],
  },
];

function permissionCheck(granted: string[]) {
  return (permission: string | string[]) =>
    [permission].flat().some((required) => granted.includes(required));
}

function visibleRoutes(navigation: NavigationItem[]): string[] {
  return navigation.flatMap((item) =>
    'children' in item
      ? [item.labelKey, ...item.children.map((child) => child.to)]
      : [item.to],
  );
}

describe('filterNavigationItems', () => {
  it('shows everything to a user holding every permission', () => {
    const all = permissionCheck([
      'buses.viewAny',
      'blog-articles.viewAny',
      'blog-tags.viewAny',
      'users.viewAny',
    ]);

    expect(filterNavigationItems(items, all)).toEqual(items);
  });

  it('keeps only the links and sub-links the user may open', () => {
    const visible = filterNavigationItems(
      items,
      permissionCheck(['blog-tags.viewAny']),
    );

    expect(visibleRoutes(visible)).toEqual(['/', 'blog', '/blog/tags']);
  });

  it('hides a group once none of its children is visible', () => {
    const visible = filterNavigationItems(items, permissionCheck([]));

    expect(visibleRoutes(visible)).toEqual(['/']);
  });
});

describe('getGroupPermission', () => {
  it('is the union of the children permissions', () => {
    const blog = items[2];

    expect('children' in blog && getGroupPermission(blog)).toEqual([
      'blog-articles.viewAny',
      'blog-tags.viewAny',
    ]);
  });

  it('is open when any child is open', () => {
    expect(
      getGroupPermission({
        labelKey: 'mixed',
        icon,
        children: [
          { to: '/a', labelKey: 'a', icon, permission: 'a.viewAny' },
          { to: '/b', labelKey: 'b', icon },
        ],
      }),
    ).toBeUndefined();
  });
});

describe('admin navigation', () => {
  const links = staticNavigationItems.flatMap((item) =>
    'children' in item ? item.children : [item],
  );

  it('requires a permission for every page except the dashboard and the manual', () => {
    const openLinks = links
      .filter((link) => !link.permission)
      .map((link) => link.to);

    expect(openLinks).toEqual(['/', '/user-guide']);
  });

  it('guards each route with the permission of its menu item', () => {
    for (const link of links) {
      expect(getRoutePermission(link.to)).toEqual(link.permission);
    }
  });

  it('matches the backend policies of the sub-pages', () => {
    expect(getRoutePermission('/apartments/regions')).toBe('regions.viewAny');
    expect(getRoutePermission('/apartments/places')).toBe('locations.viewAny');
    expect(getRoutePermission('/apartments/types')).toBe(
      'apartment-types.viewAny',
    );
    expect(getRoutePermission('/bookings/tour-inquiries')).toBe(
      'bookings.viewAny',
    );
    expect(getRoutePermission('/tours/departure-places')).toBe(
      'tour-departure-places.viewAny',
    );
    expect(getRoutePermission('/tours/list-order')).toBe('tours.reorder');
  });

  it('opens the bookings overview for anyone who may open a booking sub-page', () => {
    expect(getRoutePermission('/bookings')).toEqual(
      expect.arrayContaining([
        'bookings.viewAny',
        'messages.viewAny',
        'customers.viewAny',
        'coupons.viewAny',
      ]),
    );
  });
});
