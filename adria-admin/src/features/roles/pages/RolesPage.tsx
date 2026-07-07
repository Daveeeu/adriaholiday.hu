import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, ShieldAlert, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

import { RoleSidePanel } from '../components/RoleSidePanel';
import { createRole, deleteRole, getRoles, updateRole } from '../lib/roles.api';
import type { Role } from '../lib/roles.types';

const queryKey = ['roles'];

export function RolesPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create');
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();

  const canCreate = hasPermission('roles.create');
  const canUpdate = hasPermission('roles.update');
  const canDelete = hasPermission('roles.delete');

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKey, search],
    queryFn: () => getRoles({ page: 1, perPage: 100, search }),
    placeholderData: (previous) => previous,
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Role létrehozva.');
      setPanelOpen(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: Parameters<typeof updateRole>[1] }) =>
      updateRole(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Role módosítva.');
      setPanelOpen(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Role törölve.');
      setPanelOpen(false);
    },
  });

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: 'Megnevezés',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          {row.original.name}
          {row.original.isSystemRole ? (
            <span title="Rendszer role">
              <ShieldAlert className="size-4 text-muted-foreground" />
            </span>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: 'permissionsCount',
      header: 'Jogosultságok',
      cell: ({ row }) => `${row.original.permissionsCount} jogosultság`,
    },
    {
      accessorKey: 'usersCount',
      header: 'Felhasználók',
      cell: ({ row }) => `${row.original.usersCount} felhasználó`,
    },
    {
      id: 'actions',
      header: 'Műveletek',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {canUpdate ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedRole(row.original);
                setPanelMode('edit');
                setPanelOpen(true);
              }}
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
          {canDelete && !row.original.isSystemRole ? (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                if (row.original.usersCount > 0) {
                  toast.error('A role nem törölhető, amíg felhasználók vannak hozzárendelve.');
                  return;
                }
                deleteMutation.mutate(row.original.id);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a role-okat.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Rendszergazda</p>
        <h1 className="text-3xl font-semibold tracking-tight">Role-ok</h1>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Role-ok kezelése</h2>
            <p className="text-sm text-muted-foreground">{data.totalCount} találat.</p>
          </div>
          {canCreate ? (
            <Button
              onClick={() => {
                setSelectedRole(undefined);
                setPanelMode('create');
                setPanelOpen(true);
              }}
            >
              Új role
            </Button>
          ) : null}
        </div>
        <div className="mt-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Keresés role név alapján..."
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
                    Nincs megjeleníthető role.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <RoleSidePanel
        open={panelOpen}
        mode={panelMode}
        role={selectedRole}
        submitting={createMutation.isPending || updateMutation.isPending}
        onOpenChange={setPanelOpen}
        onSubmit={(values) => {
          if (panelMode === 'edit' && selectedRole) {
            updateMutation.mutate({ id: selectedRole.id, values });
          } else {
            createMutation.mutate(values);
          }
        }}
        onDelete={selectedRole ? () => deleteMutation.mutate(selectedRole.id) : undefined}
      />
    </div>
  );
}
