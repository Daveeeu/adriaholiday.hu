import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Power } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

import { UserSidePanel } from '../components/UserSidePanel';
import { createUser, getUsers, setUserActiveState, updateUser } from '../lib/users.api';
import type { AdminUser } from '../lib/users.types';

const queryKey = ['users'];

export function UsersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUser | undefined>();

  const canCreate = hasPermission('users.create');
  const canUpdate = hasPermission('users.update');

  const queryParams = useMemo(
    () => ({ page: pagination.pageIndex + 1, perPage: pagination.pageSize, search }),
    [pagination.pageIndex, pagination.pageSize, search],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => getUsers(queryParams),
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [search]);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Felhasználó létrehozva.');
      setPanelOpen(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Felhasználó módosítva.');
      setPanelOpen(false);
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string | number; isActive: boolean }) =>
      setUserActiveState(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Állapot módosítva.');
    },
  });

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'name',
      header: 'Felhasználó',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Szerepkörök',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role) => (
            <Badge key={role} className="bg-muted text-muted-foreground">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Állapot',
      cell: ({ row }) => (
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            row.original.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700',
          )}
        >
          {row.original.isActive ? 'Aktív' : 'Inaktív'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Műveletek',
      cell: ({ row }) => {
        const isSelf = currentUser?.id === row.original.id;
        return (
          <div className="flex justify-end gap-2">
            {canUpdate ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedUser(row.original);
                  setPanelMode('edit');
                  setPanelOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
            ) : null}
            {canUpdate && !isSelf ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  statusMutation.mutate({ id: row.original.id, isActive: !row.original.isActive })
                }
              >
                <Power className="size-4" />
              </Button>
            ) : null}
          </div>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: { pagination },
    pageCount: Math.max(1, Math.ceil((data?.totalCount ?? 0) / pagination.pageSize)),
    onPaginationChange: setPagination,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a felhasználókat.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Rendszergazda</p>
        <h1 className="text-3xl font-semibold tracking-tight">Felhasználók</h1>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Felhasználók kezelése</h2>
            <p className="text-sm text-muted-foreground">{data.totalCount} találat.</p>
          </div>
          {canCreate ? (
            <Button
              onClick={() => {
                setSelectedUser(undefined);
                setPanelMode('create');
                setPanelOpen(true);
              }}
            >
              Új felhasználó
            </Button>
          ) : null}
        </div>
        <div className="mt-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Keresés név vagy email alapján..."
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
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
                    Nincs megjeleníthető felhasználó.
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
            <span className="text-sm text-muted-foreground">
              {pagination.pageIndex + 1} / {table.getPageCount() || 1}
            </span>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Előző
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Következő
            </Button>
          </div>
        </div>
      </div>

      <UserSidePanel
        open={panelOpen}
        mode={panelMode}
        user={selectedUser}
        currentUserId={currentUser?.id}
        submitting={createMutation.isPending || updateMutation.isPending}
        onOpenChange={setPanelOpen}
        onSubmit={(values) => {
          if (panelMode === 'edit' && selectedUser) {
            updateMutation.mutate({ id: selectedUser.id, values });
          } else {
            createMutation.mutate(values);
          }
        }}
        onDeactivate={
          selectedUser ? () => statusMutation.mutate({ id: selectedUser.id, isActive: false }) : undefined
        }
      />
    </div>
  );
}
