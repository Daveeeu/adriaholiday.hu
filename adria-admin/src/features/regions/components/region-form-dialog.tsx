import { zodResolver } from '@hookform/resolvers/zod';
import { WandSparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

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
import { t } from '@/i18n';
import type { Region } from '@/types/domain';

import {
  getRegionFormDefaults,
  regionFormSchema,
  slugifyRegionName,
  type RegionFormValues,
} from '../lib/region-schema';

type RegionFormDialogProps = {
  open: boolean;
  region?: Region;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RegionFormValues) => void;
};

export function RegionFormDialog({
  open,
  region,
  submitting = false,
  onOpenChange,
  onSubmit,
}: RegionFormDialogProps) {
  const form = useForm<RegionFormValues>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: getRegionFormDefaults(region),
  });

  useEffect(() => {
    form.reset(getRegionFormDefaults(region));
  }, [form, region, open]);

  const nameValue = useWatch({
    control: form.control,
    name: 'name',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {region ? t('regions.form.editTitle') : t('regions.form.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('regions.form.description')}</DialogDescription>
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
                  <FormLabel>{t('regions.form.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('regions.form.namePlaceholder')} {...field} />
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
                    <FormLabel>{t('regions.form.slug')}</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs"
                      onClick={() =>
                        form.setValue('slug', slugifyRegionName(nameValue), {
                          shouldValidate: true,
                        })
                      }
                    >
                      <WandSparkles className="size-3.5" />
                      {t('common.generate')}
                    </Button>
                  </div>
                  <FormControl>
                    <Input placeholder={t('regions.form.slugPlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('regions.form.slugHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('regions.form.status')}</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                    >
                      <option value="active">{t('common.active')}</option>
                      <option value="inactive">{t('common.inactive')}</option>
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
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? t('common.loading')
                  : region
                    ? t('common.saveChanges')
                    : t('regions.form.submitCreate')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
