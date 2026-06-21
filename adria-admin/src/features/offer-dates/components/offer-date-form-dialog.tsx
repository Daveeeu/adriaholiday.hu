import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Offer, OfferDate } from '@/types/domain';

import {
  getOfferDateFormDefaults,
  offerDateFormSchema,
  type OfferDateFormValues,
} from '../lib/offer-date-schema';

type OfferDateFormDialogProps = {
  open: boolean;
  offerDate?: OfferDate;
  offers: Offer[];
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OfferDateFormValues) => void;
};

export function OfferDateFormDialog({
  open,
  offerDate,
  offers,
  submitting = false,
  onOpenChange,
  onSubmit,
}: OfferDateFormDialogProps) {
  const form = useForm<OfferDateFormValues>({
    resolver: zodResolver(offerDateFormSchema),
    defaultValues: getOfferDateFormDefaults(offerDate),
  });

  useEffect(() => {
    form.reset(getOfferDateFormDefaults(offerDate));
  }, [form, offerDate, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {offerDate ? 'Edit offer date' : 'Add offer date'}
          </DialogTitle>
          <DialogDescription>
            Configure one departure window for an offer and control export
            flags.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((values) => onSubmit(values))}
          >
            <FormField
              control={form.control}
              name="offerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      {...field}
                    >
                      <option value="">Select offer</option>
                      {offers.map((offer) => (
                        <option key={offer.id} value={offer.id}>
                          {offer.title}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="10"
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                        value={field.value ? 'yes' : 'no'}
                        onChange={(event) =>
                          field.onChange(event.target.value === 'yes')
                        }
                      >
                        <option value="yes">Active</option>
                        <option value="no">Inactive</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="xmlExportEnabled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>XML Export Enabled</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                        value={field.value ? 'yes' : 'no'}
                        onChange={(event) =>
                          field.onChange(event.target.value === 'yes')
                        }
                      >
                        <option value="yes">Enabled</option>
                        <option value="no">Disabled</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Saving...'
                  : offerDate
                    ? 'Save date'
                    : 'Add date'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
