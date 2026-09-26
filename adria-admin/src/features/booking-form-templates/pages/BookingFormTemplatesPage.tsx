import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

import { BookingFormFieldsSection } from '../components/BookingFormFieldsSection';
import { BookingFormTemplateSidePanel } from '../components/BookingFormTemplateSidePanel';
import { DefaultTemplateBadge } from '../components/DefaultTemplateBadge';
import {
  bookingFormFieldsQueryKey,
  bookingFormTemplatesQueryKey,
  createBookingFormTemplate,
  deleteBookingFormTemplate,
  getBookingFormFields,
  getBookingFormTemplates,
  updateBookingFormTemplate,
} from '../lib/booking-form-templates.api';
import type {
  BookingFormTemplate,
  BookingFormTemplateUpsertInput,
} from '../lib/booking-form-templates.types';

export function BookingFormTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Foglalások</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Foglalási űrlap sablonok
        </h1>
        <p className="text-sm text-muted-foreground">
          A Mezők fülön veheted fel, milyen adatokat lehet bekérni foglaláskor
          (pl. lakcím). A sablonokban mezőnként beállítható, hogy kötelező,
          opcionális vagy rejtett legyen, a sablont pedig az utazásnál lehet
          kiválasztani.
        </p>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Sablonok</TabsTrigger>
          <TabsTrigger value="fields">Mezők</TabsTrigger>
        </TabsList>
        <TabsContent value="templates">
          <BookingFormTemplatesSection />
        </TabsContent>
        <TabsContent value="fields">
          <BookingFormFieldsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingFormTemplatesSection() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('booking-form-templates.create');
  const canUpdate = hasPermission('booking-form-templates.update');
  const canDelete = hasPermission('booking-form-templates.delete');

  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | 'detail'>(
    'create',
  );
  const [selectedTemplate, setSelectedTemplate] = useState<
    BookingFormTemplate | undefined
  >();

  const { data, isLoading, isError } = useQuery({
    queryKey: [...bookingFormTemplatesQueryKey, search],
    queryFn: () => getBookingFormTemplates({ page: 1, perPage: 100, search }),
    placeholderData: (previous) => previous,
  });

  const { data: fields } = useQuery({
    queryKey: bookingFormFieldsQueryKey,
    queryFn: getBookingFormFields,
  });

  const createMutation = useMutation({
    mutationFn: createBookingFormTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingFormTemplatesQueryKey });
      toast.success('Sablon létrehozva.');
      setPanelOpen(false);
      setSelectedTemplate(undefined);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string | number;
      values: BookingFormTemplateUpsertInput;
    }) => updateBookingFormTemplate(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingFormTemplatesQueryKey });
      toast.success('Sablon módosítva.');
      setPanelOpen(false);
      setSelectedTemplate(undefined);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBookingFormTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingFormTemplatesQueryKey });
      toast.success('Sablon törölve.');
      setPanelOpen(false);
      setSelectedTemplate(undefined);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const confirmDelete = (template: BookingFormTemplate) => {
    if (window.confirm(`Biztosan törlöd ezt a sablont? (${template.name})`)) {
      deleteMutation.mutate(template.id);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a foglalási űrlap sablonokat.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Sablonok kezelése
            </h2>
            <p className="text-sm text-muted-foreground">
              {data.totalCount} sablon.
            </p>
          </div>
          {canCreate ? (
            <Button
              onClick={() => {
                setSelectedTemplate(undefined);
                setPanelMode('create');
                setPanelOpen(true);
              }}
            >
              Új sablon
            </Button>
          ) : null}
        </div>
        <div className="mt-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Keresés sablon neve alapján..."
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Név</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Mezők</TableHead>
                <TableHead>Aktív</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length > 0 ? (
                data.items.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-wrap items-center gap-2">
                        {template.name}
                        {template.isDefault ? <DefaultTemplateBadge /> : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {template.slug}
                    </TableCell>
                    <TableCell>
                      {
                        template.fields.filter(
                          (field) => field.visibility !== 'hidden',
                        ).length
                      }{' '}
                      látható mező
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                          template.active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700',
                        )}
                      >
                        {template.active ? 'Aktív' : 'Inaktív'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setPanelMode('detail');
                            setPanelOpen(true);
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {canUpdate ? (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setPanelMode('edit');
                              setPanelOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        ) : null}
                        {canDelete ? (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => confirmDelete(template)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-28 text-center text-sm text-muted-foreground"
                  >
                    Nincs megjeleníthető sablon.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <BookingFormTemplateSidePanel
        open={panelOpen}
        mode={panelMode}
        template={selectedTemplate}
        fields={fields ?? []}
        onOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) {
            setSelectedTemplate(undefined);
          }
        }}
        onSubmit={(values) => {
          if (panelMode === 'edit' && selectedTemplate) {
            updateMutation.mutate({ id: selectedTemplate.id, values });
          } else {
            createMutation.mutate(values);
          }
        }}
        onDelete={
          selectedTemplate && canDelete
            ? () => confirmDelete(selectedTemplate)
            : undefined
        }
        submitting={
          createMutation.isPending ||
          updateMutation.isPending ||
          deleteMutation.isPending
        }
      />
    </div>
  );
}
