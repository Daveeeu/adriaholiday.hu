import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { getPermissions } from '../lib/permissions.api';
import { groupPermissions } from '../lib/permissions.types';

export function PermissionsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
  });

  const groups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const permissions = data ?? [];
    const filtered = query
      ? permissions.filter(
          (permission) =>
            permission.group.toLowerCase().includes(query) ||
            permission.action.toLowerCase().includes(query) ||
            permission.name.toLowerCase().includes(query),
        )
      : permissions;

    return groupPermissions(filtered);
  }, [data, search]);

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a jogosultságokat.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Rendszergazda</p>
        <h1 className="text-3xl font-semibold tracking-tight">Permissionök</h1>
        <p className="text-sm text-muted-foreground">
          A rendszerben elérhető összes jogosultság, modulonként csoportosítva. Ez a lista csak
          olvasható — a jogosultságokat a Role-ok kezelése oldalon lehet szerepkörökhöz rendelni.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Keresés modul vagy művelet alapján..."
        />
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Nincs a keresésnek megfelelő jogosultság.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <div key={group.group} className="rounded-2xl border bg-card p-4 shadow-sm">
              <h2 className="font-semibold">{group.group}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.permissions.map((permission) => (
                  <Badge key={permission.name} className="bg-muted text-muted-foreground">
                    {permission.action}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
