import { zodResolver } from '@hookform/resolvers/zod';
import { WandSparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { ApartmentType } from '@/types/domain';

import {
  apartmentTypeFormSchema,
  getApartmentTypeFormDefaults,
  slugifyApartmentTypeName,
  type ApartmentTypeFormValues,
} from '../lib/apartment-type-schema';

type ApartmentTypeFormDialogProps = {
  open: boolean;
  apartmentType?: ApartmentType;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ApartmentTypeFormValues) => void;
};

export function ApartmentTypeFormDialog({
  open,
  apartmentType,
  submitting = false,
  onOpenChange,
  onSubmit,
}: ApartmentTypeFormDialogProps) {
  const form = useForm<ApartmentTypeFormValues>({
    resolver: zodResolver(apartmentTypeFormSchema) as unknown as Resolver<ApartmentTypeFormValues>,
    defaultValues: getApartmentTypeFormDefaults(apartmentType),
  });

  useEffect(() => {
    form.reset(getApartmentTypeFormDefaults(apartmentType));
  }, [form, apartmentType, open]);

  const nameValue = useWatch({ control: form.control, name: 'name' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {apartmentType ? 'Apartman típus szerkesztése' : 'Új apartman típus'}
          </DialogTitle>
          <DialogDescription>
            A típus a menüben és az apartman űrlap típusválasztójában jelenik meg.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((values) => onSubmit(values))}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Név</FormLabel>
                  <FormControl>
                    <Input placeholder="Olasz apartmanok" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Slug</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs"
                      onClick={() =>
                        form.setValue('slug', slugifyApartmentTypeName(nameValue), {
                          shouldValidate: true,
                        })
                      }
                    >
                      <WandSparkles className="size-3.5" />
                      Generálás
                    </Button>
                  </div>
                  <FormControl>
                    <Input placeholder="italian" {...field} />
                  </FormControl>
                  <FormDescription>
                    Ez lesz az útvonal az apartman menüben (pl. /apartments/{field.value || 'slug'}).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sorrend</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === '' ? 0 : Number(event.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Állapot</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                    >
                      <option value="active">Aktív</option>
                      <option value="inactive">Inaktív</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Mégse
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Mentés...'
                  : apartmentType
                    ? 'Mentés'
                    : 'Létrehozás'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
