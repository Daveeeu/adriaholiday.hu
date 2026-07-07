export type Permission = {
  id: string | number;
  name: string;
  group: string;
  action: string;
};

export type PermissionGroup = {
  group: string;
  permissions: Permission[];
};

export function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const groups = new Map<string, Permission[]>();

  for (const permission of permissions) {
    const existing = groups.get(permission.group) ?? [];
    existing.push(permission);
    groups.set(permission.group, existing);
  }

  return Array.from(groups.entries())
    .map(([group, groupPermissions]) => ({ group, permissions: groupPermissions }))
    .sort((a, b) => a.group.localeCompare(b.group));
}
