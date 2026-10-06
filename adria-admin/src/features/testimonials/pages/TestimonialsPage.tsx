import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

import { TestimonialSidePanel } from '../components/TestimonialSidePanel';
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  testimonialsQueryKey,
  updateTestimonial,
} from '../lib/testimonials.api';
import type { Testimonial, TestimonialUpsertInput } from '../lib/testimonials.types';

const PER_PAGE = 25;

export function TestimonialsPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('testimonials.create');
  const canUpdate = hasPermission('testimonials.update');
  const canDelete = hasPermission('testimonials.delete');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selected, setSelected] = useState<Testimonial | undefined>();

  const { data, isLoading, isError } = useQuery({
    queryKey: [...testimonialsQueryKey, { page, search: deferredSearch }],
    queryFn: () => getTestimonials({ page, perPage: PER_PAGE, search: deferredSearch }),
    placeholderData: (previous) => previous,
  });

  const closePanel = () => {
    setPanelOpen(false);
    setSelected(undefined);
  };

  const onSaved = (message: string) => {
    queryClient.invalidateQueries({ queryKey: testimonialsQueryKey });
    toast.success(message);
    closePanel();
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: { id?: number; values: TestimonialUpsertInput }) =>
      id ? updateTestimonial(id, values) : createTestimonial(values),
    onSuccess: (_, { id }) => onSaved(id ? 'Levél módosítva.' : 'Levél létrehozva.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => onSaved('Levél törölve.'),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a leveleket.
      </div>
    );
  }

  const pageCount = Math.max(1, Math.ceil(data.totalCount / PER_PAGE));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Tartalom</p>
        <h1 className="text-3xl font-semibold tracking-tight">Rólunk írták</h1>
        <p className="text-sm text-muted-foreground">
          Utasaink levelei. Az aktív levelek közül a legfrissebbek a főoldalon, az összes a „Rólunk írták” oldalon jelenik meg.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Keresés cím vagy aláírás alapján..."
        />
        {canCreate ? (
          <Button
            onClick={() => {
              setSelected(undefined);
              setPanelOpen(true);
            }}
          >
            Új levél
          </Button>
        ) : null}
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Dátum</TableHead>
                <TableHead>Cím</TableHead>
                <TableHead>Aláírás</TableHead>
                <TableHead>Állapot</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length > 0 ? (
                data.items.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell className="whitespace-nowrap">{testimonial.publishedAt.slice(0, 10)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{testimonial.title}</div>
                      <div className="line-clamp-1 max-w-xl text-xs text-muted-foreground">{testimonial.excerpt}</div>
                    </TableCell>
                    <TableCell>{testimonial.author ?? '—'}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                          testimonial.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700',
                        )}
                      >
                        {testimonial.active ? 'Megjelenik' : 'Rejtett'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelected(testimonial);
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
                    Nincs megjeleníthető levél.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-4 py-4 text-sm text-muted-foreground">
          <span>
            Találatok: <span className="font-medium text-foreground">{data.totalCount}</span>
          </span>
          <div className="flex items-center gap-2">
            <span>
              {page} / {pageCount}
            </span>
            <Button variant="outline" size="icon" onClick={() => setPage(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPage(page + 1)} disabled={page >= pageCount}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <TestimonialSidePanel
        open={panelOpen}
        testimonial={selected}
        canEdit={selected ? canUpdate : canCreate}
        submitting={saveMutation.isPending || deleteMutation.isPending}
        onOpenChange={(open) => (open ? setPanelOpen(true) : closePanel())}
        onSubmit={(values) => saveMutation.mutate({ id: selected?.id, values })}
        onDelete={selected && canDelete ? () => deleteMutation.mutate(selected.id) : undefined}
      />
    </div>
  );
}
