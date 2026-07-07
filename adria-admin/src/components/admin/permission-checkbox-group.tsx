import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  groupPermissions,
  type Permission,
  type PermissionGroup,
} from '@/features/permissions/lib/permissions.types';

type PermissionCheckboxGroupProps = {
  permissions: Permission[];
  selected: string[];
  onChange: (selected: string[]) => void;
  searchable?: boolean;
};

export function PermissionCheckboxGroup({
  permissions,
  selected,
  onChange,
  searchable = true,
}: PermissionCheckboxGroupProps) {
  const [search, setSearch] = useState('');
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return permissions;
    return permissions.filter(
      (permission) =>
        permission.group.toLowerCase().includes(query) ||
        permission.action.toLowerCase().includes(query) ||
        permission.name.toLowerCase().includes(query),
    );
  }, [permissions, search]);

  const groups = useMemo(() => groupPermissions(filteredPermissions), [filteredPermissions]);

  function togglePermission(name: string) {
    if (selectedSet.has(name)) {
      onChange(selected.filter((item) => item !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  function toggleGroup(group: PermissionGroup, checked: boolean) {
    const groupNames = group.permissions.map((permission) => permission.name);
    if (checked) {
      onChange(Array.from(new Set([...selected, ...groupNames])));
    } else {
      onChange(selected.filter((name) => !groupNames.includes(name)));
    }
  }

  return (
    <div className="space-y-4">
      {searchable ? (
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Jogosultságok keresése..."
        />
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {groups.map((group) => {
          const groupNames = group.permissions.map((permission) => permission.name);
          const allSelected = groupNames.every((name) => selectedSet.has(name));
          const someSelected = !allSelected && groupNames.some((name) => selectedSet.has(name));

          return (
            <div key={group.group} className="rounded-xl border bg-card p-3">
              <label className="flex items-center gap-2 border-b pb-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(element) => {
                    if (element) element.indeterminate = someSelected;
                  }}
                  onChange={(event) => toggleGroup(group, event.target.checked)}
                />
                {group.group}
              </label>
              <div className="mt-2 space-y-1.5">
                {group.permissions.map((permission) => (
                  <label
                    key={permission.name}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSet.has(permission.name)}
                      onChange={() => togglePermission(permission.name)}
                    />
                    {permission.action}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nincs a keresésnek megfelelő jogosultság.</p>
        ) : null}
      </div>
    </div>
  );
}
