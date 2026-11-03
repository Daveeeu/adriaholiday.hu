import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { toast } from 'sonner';

import { ListPagination } from '@/components/admin/list-pagination';
import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth-store';

import { CustomerSidePanel } from '../components/CustomerSidePanel';
import { createCustomer, customersQueryKey, deleteCustomer, getCustomers, updateCustomer } from '../lib/customers.api';
import type { Customer, CustomerUpsertInput } from '../lib/customers.types';

const PER_PAGE = 25;

export function CustomersPage() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('customers.create');
  const canUpdate = hasPermission('customers.update');
  const canDelete = hasPermission('customers.delete');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | undefined>();

  const { data, isLoading, isError } = useQuery({
    queryKey: [...customersQueryKey, { page, search: deferredSearch }],
    queryFn: () => getCustomers({ page, perPage: PER_PAGE, search: deferredSearch }),
    placeholderData: (previous) => previous,
  });

  const closePanel = () => {
    setPanelOpen(false);
    setSelected(undefined);
  };

  const onSaved = (message: string) => {
    queryClient.invalidateQueries({ queryKey: customersQueryKey });
    toast.success(message);
    closePanel();
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: { id?: string; values: CustomerUpsertInput }) =>
      id ? updateCustomer(id, values) : createCustomer(values),
    onSuccess: (_, { id }) => onSaved(id ? 'Ügyfél módosítva.' : 'Ügyfél létrehozva.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => onSaved('Ügyfél törölve.'),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni az ügyfeleket.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Foglalások</p>
        <h1 className="text-3xl font-semibold tracking-tight">Ügyfelek</h1>
        <p className="text-sm text-muted-foreground">
          A régi oldalon regisztrált ügyfelek elérhetőségei és ajánlói kódjai. Foglalásaikat az e-mail címük köti össze velük.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Keresés név, e-mail, telefon vagy ajánlói kód alapján..."
        />
        {canCreate ? (
          <Button
            onClick={() => {
              setSelected(undefined);
              setPanelOpen(true);
            }}
          >
            Új ügyfél
          </Button>
        ) : null}
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Név</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Ajánlói kód</TableHead>
                <TableHead className="text-right">Foglalások</TableHead>
                <TableHead className="w-32">Regisztrált</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length > 0 ? (
                data.items.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name ?? '—'}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone ?? '—'}</TableCell>
                    <TableCell>{customer.referralCode ?? '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{customer.bookingsCount ?? 0}</TableCell>
                    <TableCell className="whitespace-nowrap">{customer.registeredAt?.slice(0, 10) ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelected(customer);
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
                  <TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground">
                    Nincs megjeleníthető ügyfél.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ListPagination page={page} perPage={PER_PAGE} totalCount={data.totalCount} onPageChange={setPage} />
      </div>

      <CustomerSidePanel
        open={panelOpen}
        customer={selected}
        canEdit={selected ? canUpdate : canCreate}
        submitting={saveMutation.isPending || deleteMutation.isPending}
        onOpenChange={(open) => (open ? setPanelOpen(true) : closePanel())}
        onSubmit={(values) => saveMutation.mutate({ id: selected?.id, values })}
        onDelete={selected && canDelete ? () => deleteMutation.mutate(selected.id) : undefined}
      />
    </div>
  );
}
