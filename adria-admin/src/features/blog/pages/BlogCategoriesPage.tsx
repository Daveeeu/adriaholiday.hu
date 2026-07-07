import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown, Eye, Pencil, Power, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

import { BlogCategorySidePanel } from '../components/BlogCategorySidePanel';
import {
  createBlogCategory,
  deleteBlogCategory,
  getBlogCategories,
  setBlogCategoryStatus,
  updateBlogCategory,
} from '../lib/blog.api';
import { BLOG_CATEGORY_COLUMNS } from '../lib/blog.constants';
import type {
  BlogCategoriesListQuery,
  BlogCategory,
  BlogCategoryUpsertInput,
} from '../lib/blog.types';

const queryKey = ['blog-categories'];

export function BlogCategoriesPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('blog-categories.create');
  const canUpdate = hasPermission('blog-categories.update');
  const canDelete = hasPermission('blog-categories.delete');
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | 'detail'>('create');
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | undefined>();

  const queryParams = useMemo<BlogCategoriesListQuery>(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search,
      sortBy: sorting[0]?.id as BlogCategoriesListQuery['sortBy'],
      sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
    }),
    [pagination.pageIndex, pagination.pageSize, search, sorting],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => getBlogCategories(queryParams),
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [search, sorting]);

  const createMutation = useMutation({
    mutationFn: createBlogCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Blog kategória létrehozva.');
      setPanelOpen(false);
      setSelectedCategory(undefined);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: BlogCategoryUpsertInput }) =>
      updateBlogCategory(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Blog kategória módosítva.');
      setPanelOpen(false);
      setSelectedCategory(undefined);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteBlogCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Blog kategória törölve.');
      setPanelOpen(false);
      setSelectedCategory(undefined);
    },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string | number; active: boolean }) =>
      setBlogCategoryStatus(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const columns = useMemo<ColumnDef<BlogCategory>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        id: 'name',
        accessorFn: (category) => category.translations.hu.name,
        header: ({ column }) => (
          <Button variant="ghost" className="-ml-3" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Név <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">{row.original.translations.hu.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.seoName}</div>
          </div>
        ),
      },
      {
        accessorKey: 'column',
        header: ({ column }) => (
          <Button variant="ghost" className="-ml-3" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Oszlop <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) =>
          BLOG_CATEGORY_COLUMNS.find((item) => item.value === row.original.column)?.label ??
          row.original.column,
      },
      {
        id: 'actions',
        header: 'Műveletek',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="icon" onClick={() => { setSelectedCategory(row.original); setPanelMode('detail'); setPanelOpen(true); }}>
              <Eye className="size-4" />
            </Button>
            {canUpdate ? (
              <Button variant="outline" size="icon" onClick={() => { setSelectedCategory(row.original); setPanelMode('edit'); setPanelOpen(true); }}>
                <Pencil className="size-4" />
              </Button>
            ) : null}
            {canUpdate ? (
              <Button variant="outline" size="icon" onClick={() => toggleMutation.mutate({ id: row.original.id, active: !row.original.active })}>
                <Power className="size-4" />
              </Button>
            ) : null}
            {canDelete ? (
              <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(row.original.id)}>
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [canDelete, canUpdate, deleteMutation, toggleMutation],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: { sorting, pagination },
    pageCount: Math.max(1, Math.ceil((data?.totalCount ?? 0) / pagination.pageSize)),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Nem sikerült betölteni a blog kategóriákat.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Blog</p>
        <h1 className="text-3xl font-semibold tracking-tight">Kategóriák</h1>
      </div>
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Blog kategóriák kezelése</h2>
            <p className="text-sm text-muted-foreground">{data.totalCount} találat.</p>
          </div>
          {canCreate ? (
            <Button onClick={() => { setSelectedCategory(undefined); setPanelMode('create'); setPanelOpen(true); }}>
              Új blog kategória
            </Button>
          ) : null}
        </div>
        <div className="mt-4">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Keresés név vagy SEO alapján..." />
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className={cn(header.column.id === 'actions' && 'text-right')}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cn(cell.column.id === 'actions' && 'text-right')}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-28 text-center text-sm text-muted-foreground">
                    Nincs megjeleníthető blog kategória.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Találatok: <span className="font-medium text-foreground">{data.totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Sorok száma
              <select
                value={pagination.pageSize}
                onChange={(event) => setPagination((current) => ({ ...current, pageIndex: 0, pageSize: Number(event.target.value) }))}
                className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <span className="text-sm text-muted-foreground">{pagination.pageIndex + 1} / {table.getPageCount() || 1}</span>
            <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ArrowUpDown className="size-4 rotate-90" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ArrowUpDown className="size-4 -rotate-90" />
            </Button>
          </div>
        </div>
      </div>

      <BlogCategorySidePanel
        open={panelOpen}
        mode={panelMode}
        category={selectedCategory}
        onOpenChange={(open) => { setPanelOpen(open); if (!open) setSelectedCategory(undefined); }}
        onSubmit={(values) => {
          if (panelMode === 'edit' && selectedCategory) {
            updateMutation.mutate({ id: selectedCategory.id, values });
          } else {
            createMutation.mutate(values);
          }
        }}
        onDelete={selectedCategory && canDelete ? () => deleteMutation.mutate(selectedCategory.id) : undefined}
        onToggleActive={selectedCategory && canUpdate ? () => toggleMutation.mutate({ id: selectedCategory.id, active: !selectedCategory.active }) : undefined}
      />
    </div>
  );
}
