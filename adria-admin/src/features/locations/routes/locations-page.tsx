import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getLocations, getRegions, updateLocation } from '@/services/reference-data-service';
import { useAuthStore } from '@/store/auth-store';
import type { Location } from '@/types/domain';

import { LocationFormSheet } from '../components/location-form-sheet';
import { apartmentPagePath, toLocationMutationInput, type LocationFormValues } from '../lib/location-form';

const locationsQueryKey = ['locations'];

/**
 * The places apartments are in (Bibione, Lignano…), with the texts of their
 * public apartment pages.
 */
export function LocationsPage() {
  const queryClient = useQueryClient();
  const canUpdate = useAuthStore((state) => state.hasPermission('locations.update'));
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Location | null>(null);

  const locations = useQuery({ queryKey: locationsQueryKey, queryFn: () => getLocations() });
  const regions = useQuery({ queryKey: ['regions'], queryFn: () => getRegions() });

  const save = useMutation({
    mutationFn: ({ location, values }: { location: Location; values: LocationFormValues }) =>
      updateLocation(location.id, toLocationMutationInput(location, values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: locationsQueryKey });
      toast.success('A hely mentve.');
      setEditing(null);
    },
    onError: () => toast.error('A hely mentése nem sikerült.'),
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const regionNames = new Map((regions.data ?? []).map((region) => [region.id, region.name]));

    return (locations.data ?? [])
      .filter((location) => term === '' || location.name.toLowerCase().includes(term))
      .sort((a, b) => Number(Boolean(b.areaSlug)) - Number(Boolean(a.areaSlug)) || a.name.localeCompare(b.name, 'hu'))
      .map((location) => ({ location, regionName: regionNames.get(location.regionId) ?? '—' }));
  }, [locations.data, regions.data, search]);

  if (locations.isLoading) {
    return <PageLoader />;
  }

  if (locations.isError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        A helyek betöltése nem sikerült.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Apartmanok</p>
        <h1 className="text-2xl font-semibold tracking-tight">Helyek</h1>
        <p className="text-sm text-muted-foreground">
          Az apartmanok helyei. Amelyiknek van területe, annak apartmanoldala is van a publikus oldalon.
        </p>
      </div>

      <Input className="max-w-sm" placeholder="Keresés név szerint" value={search} onChange={(event) => setSearch(event.target.value)} />

      <div className="rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Név</TableHead>
              <TableHead>Régió</TableHead>
              <TableHead>Apartmanoldal</TableHead>
              <TableHead>Állapot</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ location, regionName }) => {
              const path = apartmentPagePath(location);

              return (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{regionName}</TableCell>
                  <TableCell className="font-mono text-xs">{path ?? '—'}</TableCell>
                  <TableCell>{location.isActive === false ? 'Inaktív' : 'Aktív'}</TableCell>
                  <TableCell>
                    {canUpdate ? (
                      <Button type="button" variant="ghost" size="icon" aria-label="Szerkesztés" onClick={() => setEditing(location)}>
                        <Pencil className="size-4" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LocationFormSheet
        location={editing}
        submitting={save.isPending}
        onOpenChange={(open) => !open && setEditing(null)}
        onSubmit={(values) => editing && save.mutate({ location: editing, values })}
      />
    </div>
  );
}
