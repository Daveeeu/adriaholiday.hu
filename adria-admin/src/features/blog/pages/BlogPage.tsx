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

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { BlogArticleSidePanel } from '../components/BlogArticleSidePanel';
import {
  createBlogArticle,
  deleteBlogArticle,
  getAllBlogCategories,
  getAllBlogTags,
  getBlogArticles,
  setBlogArticleStatus,
  updateBlogArticle,
} from '../lib/blog.api';
import type {
  BlogArticle,
  BlogArticlesListQuery,
  BlogArticleUpsertInput,
} from '../lib/blog.types';

const queryKey = ['blog-articles'];

function formatDate(date?: string) {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString('hu-HU');
}

export function BlogPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'publishedAt', desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | 'detail'>('create');
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | undefined>();

  const queryParams = useMemo<BlogArticlesListQuery>(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      search,
      sortBy: sorting[0]?.id as BlogArticlesListQuery['sortBy'],
      sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
    }),
    [pagination.pageIndex, pagination.pageSize, search, sorting],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => getBlogArticles(queryParams),
    placeholderData: (previous) => previous,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories', 'all'],
    queryFn: getAllBlogCategories,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['blog-tags', 'all'],
    queryFn: getAllBlogTags,
  });

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [search, sorting]);

  const createMutation = useMutation({
    mutationFn: createBlogArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Blog cikk létrehozva.');
      setPanelOpen(false);
      setSelectedArticle(undefined);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: BlogArticleUpsertInput }) =>
      updateBlogArticle(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Blog cikk módosítva.');
      setPanelOpen(false);
      setSelectedArticle(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Blog cikk törölve.');
      setPanelOpen(false);
      setSelectedArticle(undefined);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string | number; active: boolean }) =>
      setBlogArticleStatus(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: `${category.translations.hu.name} (${category.seoName})`,
      })),
    [categories],
  );

  const tagOptions = useMemo(
    () =>
      tags.map((tag) => ({
        value: String(tag.id),
        label: tag.translations.hu.name,
      })),
    [tags],
  );

  const columns = useMemo<ColumnDef<BlogArticle>[]>(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            ID <ArrowUpDown className="size-4" />
          </Button>
        ),
      },
      {
        id: 'title',
        accessorFn: (article) => article.translations.hu.title,
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Cím <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">{row.original.translations.hu.title}</div>
            <div className="text-xs text-muted-foreground">{row.original.seoName}</div>
          </div>
        ),
      },
      {
        accessorKey: 'publishedAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Dátum <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => formatDate(row.original.publishedAt),
      },
      {
        accessorKey: 'showOnHomepage',
        header: 'Megjelenik',
        cell: ({ row }) => (
          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
            {row.original.showOnHomepage ? 'Igen' : 'Nem'}
          </span>
        ),
      },
      {
        accessorKey: 'portfolioFeatured',
        header: 'Portfólió',
        cell: ({ row }) => (
          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
            {row.original.portfolioFeatured ? 'Kiemelt' : 'Nem'}
          </span>
        ),
      },
      {
        accessorKey: 'portfolioSortOrder',
        header: 'Portfólió sorrend',
      },
      {
        accessorKey: 'views',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Megnyitva <ArrowUpDown className="size-4" />
          </Button>
        ),
      },
      {
        id: 'actions',
        header: 'Műveletek',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedArticle(row.original);
                setPanelMode('detail');
                setPanelOpen(true);
              }}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedArticle(row.original);
                setPanelMode('edit');
                setPanelOpen(true);
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                toggleMutation.mutate({
                  id: row.original.id,
                  active: !row.original.active,
                })
              }
            >
              <Power className="size-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => deleteMutation.mutate(row.original.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation, toggleMutation],
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
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a blog cikkeket.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Blog</p>
        <h1 className="text-3xl font-semibold tracking-tight">Blog cikkek</h1>
        <p className="text-sm text-muted-foreground">
          Lista, keresés, rendezés és side paneles CRUD a blog cikkekhez.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Blog cikkek kezelése</h2>
            <p className="text-sm text-muted-foreground">
              {data.totalCount} találat a megjelenített oldalon.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedArticle(undefined);
              setPanelMode('create');
              setPanelOpen(true);
            }}
          >
            Új blog cikk
          </Button>
        </div>
        <div className="mt-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Keresés cím, SEO, kivonat vagy tartalom alapján..."
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(header.column.id === 'actions' && 'text-right')}
                    >
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
                      <TableCell
                        key={cell.id}
                        className={cn(cell.column.id === 'actions' && 'text-right')}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-28 text-center text-sm text-muted-foreground"
                  >
                    Nincs megjeleníthető blog cikk.
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Sorok száma
              <select
                value={pagination.pageSize}
                onChange={(event) =>
                  setPagination((current) => ({
                    ...current,
                    pageIndex: 0,
                    pageSize: Number(event.target.value),
                  }))
                }
                className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {pagination.pageIndex + 1} / {table.getPageCount() || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ArrowUpDown className="size-4 rotate-90" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ArrowUpDown className="size-4 -rotate-90" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BlogArticleSidePanel
        open={panelOpen}
        mode={panelMode}
        article={selectedArticle}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        onOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) setSelectedArticle(undefined);
        }}
        onSubmit={(values) => {
          if (panelMode === 'edit' && selectedArticle) {
            updateMutation.mutate({ id: selectedArticle.id, values });
          } else {
            createMutation.mutate(values);
          }
        }}
        onDelete={selectedArticle ? () => deleteMutation.mutate(selectedArticle.id) : undefined}
        onToggleActive={
          selectedArticle
            ? () =>
                toggleMutation.mutate({
                  id: selectedArticle.id,
                  active: !selectedArticle.active,
                })
            : undefined
        }
        submitting={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
      />
    </div>
  );
}
