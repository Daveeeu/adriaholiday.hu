import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { toast } from 'sonner';

import { ListPagination } from '@/components/admin/list-pagination';
import { StatusBadge } from '@/components/admin/status-badge';
import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth-store';

import { SeoRedirectSidePanel } from '../components/SeoRedirectSidePanel';
import {
  createSeoRedirect,
  deleteSeoRedirect,
  getSeoRedirects,
  seoRedirectsQueryKey,
  updateSeoRedirect,
} from '../lib/seo-redirects.api';
import type { SeoRedirect, SeoRedirectOrigin, SeoRedirectUpsertInput } from '../lib/seo-redirects.types';

const PER_PAGE = 50;

const ORIGIN_LABELS: Record<SeoRedirectOrigin, string> = { legacy: 'Régi oldal', manual: 'Kézi' };

export function SeoRedirectsPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('seo-redirects.create');
  const canUpdate = hasPermission('seo-redirects.update');
  const canDelete = hasPermission('seo-redirects.delete');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [origin, setOrigin] = useState<SeoRedirectOrigin | ''>('');
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selected, setSelected] = useState<SeoRedirect | undefined>();

  const { data, isLoading, isError } = useQuery({
    queryKey: [...seoRedirectsQueryKey, { page, search: deferredSearch, origin }],
    queryFn: () => getSeoRedirects({ page, perPage: PER_PAGE, search: deferredSearch, origin: origin || undefined }),
    placeholderData: (previous) => previous,
  });

  const closePanel = () => {
    setPanelOpen(false);
    setSelected(undefined);
  };

  const onSaved = (message: string) => {
    queryClient.invalidateQueries({ queryKey: seoRedirectsQueryKey });
    toast.success(message);
    closePanel();
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: { id?: string; values: SeoRedirectUpsertInput }) =>
      id ? updateSeoRedirect(id, values) : createSeoRedirect(values),
    onSuccess: (_, { id }) => onSaved(id ? 'Átirányítás módosítva.' : 'Átirányítás létrehozva.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSeoRedirect,
    onSuccess: () => onSaved('Átirányítás törölve.'),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni az átirányításokat.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">SEO</p>
        <h1 className="text-3xl font-semibold tracking-tight">Átirányítások</h1>
        <p className="text-sm text-muted-foreground">
          Régi címek, amelyeken már nincs oldal: a látogató a célra kerül. A lista elején a legtöbbet látogatott régi címek állnak.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Keresés régi cím vagy cél alapján..."
        />
        <select
          className="flex h-10 rounded-md border bg-background px-3 text-sm sm:w-48"
          value={origin}
          onChange={(event) => {
            setOrigin(event.target.value as SeoRedirectOrigin | '');
            setPage(1);
          }}
        >
          <option value="">Minden forrás</option>
          <option value="legacy">Régi oldalról</option>
          <option value="manual">Kézi</option>
        </select>
        {canCreate ? (
          <Button
            onClick={() => {
              setSelected(undefined);
              setPanelOpen(true);
            }}
          >
            Új átirányítás
          </Button>
        ) : null}
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Régi cím</TableHead>
                <TableHead>Cél</TableHead>
                <TableHead className="text-right">Látogatás</TableHead>
                <TableHead>Forrás</TableHead>
                <TableHead>Állapot</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length > 0 ? (
                data.items.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell className="max-w-sm truncate font-medium" title={redirect.sourcePath}>
                      {redirect.sourcePath}
                    </TableCell>
                    <TableCell className="max-w-sm truncate text-muted-foreground" title={redirect.target}>
                      {redirect.target}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{redirect.hits}</TableCell>
                    <TableCell>{ORIGIN_LABELS[redirect.origin]}</TableCell>
                    <TableCell>
                      <StatusBadge active={redirect.active} activeLabel="Aktív" inactiveLabel="Kikapcsolva" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelected(redirect);
                          setPanelOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                    Nincs megjeleníthető átirányítás.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ListPagination page={page} perPage={PER_PAGE} totalCount={data.totalCount} onPageChange={setPage} />
      </div>

      <SeoRedirectSidePanel
        open={panelOpen}
        redirect={selected}
        canEdit={selected ? canUpdate : canCreate}
        submitting={saveMutation.isPending || deleteMutation.isPending}
        onOpenChange={(open) => (open ? setPanelOpen(true) : closePanel())}
        onSubmit={(values) => saveMutation.mutate({ id: selected?.id, values })}
        onDelete={selected && canDelete ? () => deleteMutation.mutate(selected.id) : undefined}
      />
    </div>
  );
}
