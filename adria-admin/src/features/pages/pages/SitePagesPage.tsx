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

import { SitePageSidePanel } from '../components/SitePageSidePanel';
import { createSitePage, deleteSitePage, getSitePages, sitePagesQueryKey, updateSitePage } from '../lib/pages.api';
import type { PageKind, SitePage, SitePageUpsertInput } from '../lib/pages.types';

const PER_PAGE = 25;

const KIND_LABELS: Record<PageKind, string> = { page: 'Oldal', text_block: 'Szövegblokk' };

export function SitePagesPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('pages.create');
  const canUpdate = hasPermission('pages.update');
  const canDelete = hasPermission('pages.delete');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [kind, setKind] = useState<PageKind | ''>('');
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selected, setSelected] = useState<SitePage | undefined>();

  const { data, isLoading, isError } = useQuery({
    queryKey: [...sitePagesQueryKey, { page, search: deferredSearch, kind }],
    queryFn: () => getSitePages({ page, perPage: PER_PAGE, search: deferredSearch, kind: kind || undefined }),
    placeholderData: (previous) => previous,
  });

  const closePanel = () => {
    setPanelOpen(false);
    setSelected(undefined);
  };

  const onSaved = (message: string) => {
    queryClient.invalidateQueries({ queryKey: sitePagesQueryKey });
    toast.success(message);
    closePanel();
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: { id?: string; values: SitePageUpsertInput }) =>
      id ? updateSitePage(id, values) : createSitePage(values),
    onSuccess: (_, { id }) => onSaved(id ? 'Oldal módosítva.' : 'Oldal létrehozva.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSitePage,
    onSuccess: () => onSaved('Oldal törölve.'),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni az oldalakat.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Tartalom</p>
        <h1 className="text-3xl font-semibold tracking-tight">Oldalak</h1>
        <p className="text-sm text-muted-foreground">
          Szöveges oldalak a saját címükön és szövegblokkok. A régi oldalról áthozott oldalak rejtve érkeznek: nézd át, melyik jelenjen meg.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Keresés cím vagy URL alapján..."
        />
        <select
          className="flex h-10 rounded-md border bg-background px-3 text-sm sm:w-48"
          value={kind}
          onChange={(event) => {
            setKind(event.target.value as PageKind | '');
            setPage(1);
          }}
        >
          <option value="">Minden fajta</option>
          <option value="page">Oldalak</option>
          <option value="text_block">Szövegblokkok</option>
        </select>
        {canCreate ? (
          <Button
            onClick={() => {
              setSelected(undefined);
              setPanelOpen(true);
            }}
          >
            Új oldal
          </Button>
        ) : null}
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cím</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Fajta</TableHead>
                <TableHead>Állapot</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length > 0 ? (
                data.items.map((sitePage) => (
                  <TableRow key={sitePage.id}>
                    <TableCell className="font-medium">{sitePage.title}</TableCell>
                    <TableCell className="text-muted-foreground">{sitePage.slug ? `/${sitePage.slug}` : '—'}</TableCell>
                    <TableCell>{KIND_LABELS[sitePage.kind]}</TableCell>
                    <TableCell>
                      <StatusBadge active={sitePage.active} activeLabel="Megjelenik" inactiveLabel="Rejtett" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelected(sitePage);
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
                  <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                    Nincs megjeleníthető oldal.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ListPagination page={page} perPage={PER_PAGE} totalCount={data.totalCount} onPageChange={setPage} />
      </div>

      <SitePageSidePanel
        open={panelOpen}
        page={selected}
        canEdit={selected ? canUpdate : canCreate}
        submitting={saveMutation.isPending || deleteMutation.isPending}
        onOpenChange={(open) => (open ? setPanelOpen(true) : closePanel())}
        onSubmit={(values) => saveMutation.mutate({ id: selected?.id, values })}
        onDelete={selected && canDelete ? () => deleteMutation.mutate(selected.id) : undefined}
      />
    </div>
  );
}
