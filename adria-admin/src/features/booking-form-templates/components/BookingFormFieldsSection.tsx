import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store/auth-store';

import {
  BOOKING_FORM_FIELD_TYPE_LABELS,
  BOOKING_FORM_INPUT_GROUP_LABELS,
  BOOKING_FORM_OPTION_FIELD_TYPES,
} from '../lib/booking-form.constants';
import {
  bookingFormFieldsQueryKey,
  bookingFormTemplatesQueryKey,
  createBookingFormField,
  deleteBookingFormField,
  getBookingFormFields,
  updateBookingFormField,
} from '../lib/booking-form-templates.api';
import type {
  BookingFormField,
  BookingFormFieldUpsertInput,
} from '../lib/booking-form-templates.types';
import { BookingFormFieldSidePanel } from './BookingFormFieldSidePanel';

export function BookingFormFieldsSection() {
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCreate = hasPermission('booking-form-templates.create');
  const canUpdate = hasPermission('booking-form-templates.update');
  const canDelete = hasPermission('booking-form-templates.delete');

  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<
    BookingFormField | undefined
  >();

  const {
    data: fields,
    isLoading,
    isError,
  } = useQuery({
    queryKey: bookingFormFieldsQueryKey,
    queryFn: getBookingFormFields,
  });

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedField(undefined);
  };

  const handleSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: bookingFormFieldsQueryKey });
    queryClient.invalidateQueries({ queryKey: bookingFormTemplatesQueryKey });
    toast.success(message);
    closePanel();
  };

  const handleError = (error: Error) => toast.error(error.message);

  const saveMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id?: string | number;
      values: BookingFormFieldUpsertInput;
    }) =>
      id === undefined
        ? createBookingFormField(values)
        : updateBookingFormField(id, values),
    onSuccess: (_, { id }) =>
      handleSuccess(id === undefined ? 'Mező létrehozva.' : 'Mező módosítva.'),
    onError: handleError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBookingFormField,
    onSuccess: () => handleSuccess('Mező törölve.'),
    onError: handleError,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !fields) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a foglalási mezőket.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Foglaláskor bekérhető adatok
            </h2>
            <p className="text-sm text-muted-foreground">
              Az itt felvett mezők minden sablonban megjelennek, ahol kötelezőre
              vagy opcionálisra állíthatók.
            </p>
          </div>
          {canCreate ? (
            <Button
              onClick={() => {
                setSelectedField(undefined);
                setPanelOpen(true);
              }}
            >
              Új mező
            </Button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Név</TableHead>
                <TableHead>Kinek az adata?</TableHead>
                <TableHead>Típus</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <div className="font-medium">{field.label}</div>
                    {field.description || field.priceLabel ? (
                      <div className="text-xs text-muted-foreground">
                        {[field.description, field.priceLabel]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    ) : null}
                    {field.isSystem ? (
                      <div className="text-xs text-muted-foreground">
                        Rendszermező
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {BOOKING_FORM_INPUT_GROUP_LABELS[field.inputGroup]}
                  </TableCell>
                  <TableCell>
                    {BOOKING_FORM_FIELD_TYPE_LABELS[field.fieldType]}
                    {BOOKING_FORM_OPTION_FIELD_TYPES.includes(
                      field.fieldType,
                    ) && field.options?.length ? (
                      <div className="text-xs text-muted-foreground">
                        {field.options.join(', ')}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    {canUpdate ? (
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`${field.label} szerkesztése`}
                        onClick={() => {
                          setSelectedField(field);
                          setPanelOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <BookingFormFieldSidePanel
        open={panelOpen}
        field={selectedField}
        submitting={saveMutation.isPending || deleteMutation.isPending}
        onOpenChange={(open) => (open ? setPanelOpen(true) : closePanel())}
        onSubmit={(values) =>
          saveMutation.mutate({ id: selectedField?.id, values })
        }
        onDelete={
          selectedField && canDelete
            ? () => {
                if (
                  window.confirm(
                    `Biztosan törlöd ezt a mezőt? (${selectedField.label})`,
                  )
                ) {
                  deleteMutation.mutate(selectedField.id);
                }
              }
            : undefined
        }
      />
    </div>
  );
}
