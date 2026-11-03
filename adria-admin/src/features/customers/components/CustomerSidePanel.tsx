import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { z } from 'zod';

import { EntitySidePanel } from '@/components/admin/entity-side-panel';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type { Customer, CustomerUpsertInput } from '../lib/customers.types';

const FORM_ID = 'customer-panel-form';

const customerFormSchema = z.object({
  email: z.string().trim().email('Adj meg egy érvényes e-mail címet.').max(255),
  name: z.string().trim().max(255),
  phone: z.string().trim().max(64),
  postalCode: z.string().trim().max(16),
  city: z.string().trim().max(255),
  address: z.string().trim().max(255),
  referralCode: z.string().trim().max(32),
  note: z.string().trim().max(5000),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

const TEXT_FIELDS: Array<{ name: FieldPath<CustomerFormValues>; label: string }> = [
  { name: 'name', label: 'Név' },
  { name: 'email', label: 'E-mail' },
  { name: 'phone', label: 'Telefon' },
  { name: 'referralCode', label: 'Ajánlói kód' },
  { name: 'postalCode', label: 'Irányítószám' },
  { name: 'city', label: 'Település' },
];

function getFormDefaults(customer?: Customer): CustomerFormValues {
  return {
    email: customer?.email ?? '',
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    postalCode: customer?.postalCode ?? '',
    city: customer?.city ?? '',
    address: customer?.address ?? '',
    referralCode: customer?.referralCode ?? '',
    note: customer?.note ?? '',
  };
}

type CustomerSidePanelProps = {
  open: boolean;
  customer?: Customer;
  canEdit: boolean;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CustomerUpsertInput) => void;
  onDelete?: () => void;
};

export function CustomerSidePanel({ open, customer, canEdit, submitting = false, onOpenChange, onSubmit, onDelete }: CustomerSidePanelProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: getFormDefaults(customer),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFormDefaults(customer));
    }
  }, [form, open, customer]);

  return (
    <EntitySidePanel
      open={open}
      eyebrow="Ügyfelek"
      title={customer ? customer.name || customer.email : 'Új ügyfél'}
      description={
        customer
          ? `Foglalások ezzel az e-mail címmel: ${customer.bookingsCount ?? 0}.${customer.registrationCouponValue ? ` Regisztrációs kupon: ${customer.registrationCouponValue.toLocaleString('hu-HU')} Ft.` : ''}`
          : 'Az ügyfél foglalásait az e-mail címe köti össze vele.'
      }
      widthClassName="max-w-[min(100vw,720px)]"
      onOpenChange={onOpenChange}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {customer && onDelete ? (
            <Button type="button" variant="destructive" onClick={onDelete} disabled={submitting}>
              <Trash2 className="size-4" />
              Törlés
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          {canEdit ? (
            <Button type="submit" form={FORM_ID} disabled={submitting}>
              Mentés
            </Button>
          ) : null}
        </div>
      }
    >
      <Form {...form}>
        <form id={FORM_ID} className="space-y-5" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
          <fieldset disabled={!canEdit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {TEXT_FIELDS.map((textField) => (
                <FormField
                  key={textField.name}
                  control={form.control}
                  name={textField.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{textField.label}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cím</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Megjegyzés</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>
        </form>
      </Form>
    </EntitySidePanel>
  );
}
